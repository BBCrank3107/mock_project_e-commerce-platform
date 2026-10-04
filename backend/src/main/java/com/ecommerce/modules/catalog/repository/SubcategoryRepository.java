package com.ecommerce.modules.catalog.repository;

import com.ecommerce.modules.catalog.entity.Subcategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SubcategoryRepository extends JpaRepository<Subcategory, Long> {
    List<Subcategory> findByCategoryIdAndIsActiveTrue(Long categoryId);
    Optional<Subcategory> findBySlug(String slug);
}
