package com.ecommerce.modules.catalog.service;

import com.ecommerce.modules.catalog.dto.CategoryCreateRequest;
import com.ecommerce.modules.catalog.dto.CategoryDTO;
import com.ecommerce.modules.catalog.dto.SubcategoryCreateRequest;
import com.ecommerce.modules.catalog.dto.SubcategoryDTO;
import com.ecommerce.modules.catalog.entity.Category;
import com.ecommerce.modules.catalog.entity.Subcategory;
import com.ecommerce.modules.catalog.repository.CategoryRepository;
import com.ecommerce.modules.catalog.repository.SubcategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.text.Normalizer;
import java.util.List;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final SubcategoryRepository subcategoryRepository;

    @Transactional(readOnly = true)
    public List<CategoryDTO> getAllCategories() {
        return categoryRepository.findByIsActiveTrue()
                .stream()
                .map(CategoryDTO::from)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public CategoryDTO getCategoryById(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy danh mục với id: " + id));
        return CategoryDTO.from(category);
    }

    @Transactional(readOnly = true)
    public List<SubcategoryDTO> getSubcategoriesByCategoryId(Long categoryId) {
        return subcategoryRepository.findByCategoryIdAndIsActiveTrue(categoryId)
                .stream()
                .map(SubcategoryDTO::from)
                .collect(Collectors.toList());
    }

    @Transactional
    public CategoryDTO createCategory(CategoryCreateRequest request) {
        String slug = (request.getSlug() != null && !request.getSlug().isBlank())
                ? toSlug(request.getSlug())
                : toSlug(request.getName());

        if (slug.isBlank()) {
            slug = "cat-" + System.currentTimeMillis();
        }

        // Đảm bảo slug là duy nhất
        String baseSlug = slug;
        int count = 1;
        while (categoryRepository.findBySlug(slug).isPresent()) {
            slug = baseSlug + "-" + count++;
        }

        Category category = Category.builder()
                .name(request.getName().trim())
                .slug(slug)
                .description(request.getDescription())
                .iconUrl(request.getIconUrl())
                .isActive(true)
                .build();

        Category saved = categoryRepository.save(category);
        return CategoryDTO.from(saved);
    }

    @Transactional
    public SubcategoryDTO createSubcategory(SubcategoryCreateRequest request) {
        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy danh mục cha với id: " + request.getCategoryId()));

        String slug = (request.getSlug() != null && !request.getSlug().isBlank())
                ? toSlug(request.getSlug())
                : toSlug(request.getName());

        if (slug.isBlank()) {
            slug = "sub-" + System.currentTimeMillis();
        }

        String baseSlug = slug;
        int count = 1;
        while (subcategoryRepository.findBySlug(slug).isPresent()) {
            slug = baseSlug + "-" + count++;
        }

        Subcategory subcategory = Subcategory.builder()
                .category(category)
                .name(request.getName().trim())
                .slug(slug)
                .description(request.getDescription())
                .isActive(true)
                .build();

        Subcategory saved = subcategoryRepository.save(subcategory);
        return SubcategoryDTO.from(saved);
    }

    @Transactional
    public void deleteCategory(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy danh mục với id: " + id));
        category.setIsActive(false);
        categoryRepository.save(category);
    }

    @Transactional
    public void deleteSubcategory(Long id) {
        Subcategory subcategory = subcategoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy danh mục con với id: " + id));
        subcategory.setIsActive(false);
        subcategoryRepository.save(subcategory);
    }

    private String toSlug(String input) {
        if (input == null) return "";
        String nowhitespace = Pattern.compile("[\\s]").matcher(input).replaceAll("-");
        String normalized = Normalizer.normalize(nowhitespace, Normalizer.Form.NFD);
        String slug = Pattern.compile("[\\p{InCombiningDiacriticalMarks}]").matcher(normalized).replaceAll("");
        return slug.toLowerCase().replaceAll("[^a-z0-9-]", "");
    }
}
