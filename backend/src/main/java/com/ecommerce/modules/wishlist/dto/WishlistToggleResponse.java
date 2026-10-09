package com.ecommerce.modules.wishlist.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WishlistToggleResponse {
    private Long productId;
    private boolean inWishlist;
    private String message;
}
