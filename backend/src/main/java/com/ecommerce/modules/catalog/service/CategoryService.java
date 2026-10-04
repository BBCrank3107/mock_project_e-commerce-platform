package com.ecommerce.modules.catalog.service;

import com.ecommerce.modules.catalog.dto.CategoryDTO;
import com.ecommerce.modules.catalog.dto.SubcategoryDTO;
import com.ecommerce.modules.catalog.entity.Category;
import com.ecommerce.modules.catalog.repository.CategoryRepository;
import com.ecommerce.modules.catalog.repository.SubcategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
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
}
