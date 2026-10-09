package com.ecommerce.modules.wishlist.dto;

import com.ecommerce.modules.catalog.dto.ProductDTO;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WishlistItemDTO {
    private Long id;
    private ProductDTO product;
    private Instant createdAt;
}
