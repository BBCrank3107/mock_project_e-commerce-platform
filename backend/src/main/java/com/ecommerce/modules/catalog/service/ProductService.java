package com.ecommerce.modules.catalog.service;

import com.ecommerce.common.dto.PageResponse;
import com.ecommerce.modules.catalog.dto.ProductCreateRequest;
import com.ecommerce.modules.catalog.dto.ProductDTO;
import com.ecommerce.modules.catalog.dto.ProductUpdateRequest;
import com.ecommerce.modules.catalog.entity.Product;
import com.ecommerce.modules.catalog.entity.ProductImage;
import com.ecommerce.modules.catalog.entity.Subcategory;
import com.ecommerce.modules.catalog.repository.ProductImageRepository;
import com.ecommerce.modules.catalog.repository.ProductRepository;
import com.ecommerce.modules.catalog.repository.SubcategoryRepository;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.text.Normalizer;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.UUID;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
    private final SubcategoryRepository subcategoryRepository;
    private final ProductImageRepository productImageRepository;
    private final FileStorageService fileStorageService;

    @Transactional(readOnly = true)
    public PageResponse<ProductDTO> getProducts(
            String keyword,
            Long subcategoryId,
            BigDecimal minPrice,
            BigDecimal maxPrice,
            Boolean isActive,
            Pageable pageable
    ) {
        Specification<Product> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (keyword != null && !keyword.trim().isEmpty()) {
                String pattern = "%" + keyword.trim().toLowerCase() + "%";
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("name")), pattern),
                        cb.like(cb.lower(root.get("description")), pattern)
                ));
            }

            if (subcategoryId != null) {
                predicates.add(cb.equal(root.get("subcategory").get("id"), subcategoryId));
            }

            if (minPrice != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("price"), minPrice));
            }

            if (maxPrice != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("price"), maxPrice));
            }

            if (isActive != null) {
                predicates.add(cb.equal(root.get("isActive"), isActive));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<Product> page = productRepository.findAll(spec, pageable);
        return PageResponse.from(page.map(ProductDTO::from));
    }

    @Transactional(readOnly = true)
    public ProductDTO getProductById(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy sản phẩm với id: " + id));
        return ProductDTO.from(product);
    }

    @Transactional
    public ProductDTO createProduct(ProductCreateRequest request) {
        Subcategory subcategory = subcategoryRepository.findById(request.getSubcategoryId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy danh mục con id: " + request.getSubcategoryId()));

        String slug = toSlug(request.getName()) + "-" + UUID.randomUUID().toString().substring(0, 6);
        String sku = request.getSku() != null && !request.getSku().isBlank() ?
                request.getSku().trim() :
                "SKU-" + System.currentTimeMillis();

        if (productRepository.existsBySku(sku)) {
            sku = sku + "-" + UUID.randomUUID().toString().substring(0, 4);
        }

        Product product = Product.builder()
                .subcategory(subcategory)
                .name(request.getName().trim())
                .slug(slug)
                .sku(sku)
                .price(request.getPrice())
                .discountPrice(request.getDiscountPrice())
                .description(request.getDescription())
                .thumbnailUrl(request.getThumbnailUrl() != null && !request.getThumbnailUrl().isBlank() ?
                        request.getThumbnailUrl().trim() :
                        "https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=500")
                .isActive(true)
                .build();

        Product saved = productRepository.save(product);
        return ProductDTO.from(saved);
    }

    @Transactional
    public ProductDTO updateProduct(Long id, ProductUpdateRequest request) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy sản phẩm với id: " + id));

        Subcategory subcategory = subcategoryRepository.findById(request.getSubcategoryId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy danh mục con id: " + request.getSubcategoryId()));

        product.setSubcategory(subcategory);
        product.setName(request.getName().trim());
        if (request.getSku() != null && !request.getSku().isBlank()) {
            product.setSku(request.getSku().trim());
        }
        product.setPrice(request.getPrice());
        product.setDiscountPrice(request.getDiscountPrice());
        product.setDescription(request.getDescription());
        if (request.getThumbnailUrl() != null) {
            product.setThumbnailUrl(request.getThumbnailUrl().trim());
        }
        if (request.getIsActive() != null) {
            product.setIsActive(request.getIsActive());
        }

        Product updated = productRepository.save(product);
        return ProductDTO.from(updated);
    }

    @Transactional
    public void deleteProduct(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy sản phẩm với id: " + id));
        productRepository.delete(product);
    }

    @Transactional
    public String uploadProductImage(Long productId, MultipartFile file, boolean isThumbnail) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy sản phẩm id: " + productId));

        String imageUrl = fileStorageService.storeFile(file);

        ProductImage productImage = ProductImage.builder()
                .product(product)
                .imageUrl(imageUrl)
                .isThumbnail(isThumbnail)
                .build();

        productImageRepository.save(productImage);

        if (isThumbnail || product.getThumbnailUrl() == null || product.getThumbnailUrl().isBlank()) {
            product.setThumbnailUrl(imageUrl);
            productRepository.save(product);
        }

        return imageUrl;
    }

    private String toSlug(String input) {
        if (input == null) return "";
        String nowhitespace = Pattern.compile("[\\s]").matcher(input).replaceAll("-");
        String normalized = Normalizer.normalize(nowhitespace, Normalizer.Form.NFD);
        String slug = Pattern.compile("[^\\w-]").matcher(normalized).replaceAll("");
        return slug.toLowerCase(Locale.ENGLISH);
    }
}
