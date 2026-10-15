package com.ecommerce.modules.promotion_inventory.repository;

import com.ecommerce.modules.promotion_inventory.entity.Promotion;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface PromotionRepository extends JpaRepository<Promotion, Long> {
    Optional<Promotion> findByCodeIgnoreCase(String code);

    List<Promotion> findByIsActiveTrue();

    List<Promotion> findAllByOrderByIdDesc();

    boolean existsByCodeIgnoreCase(String code);
}
