package com.ecommerce.modules.wishlist.service;

import com.ecommerce.modules.wishlist.dto.WishlistItemDTO;
import com.ecommerce.modules.wishlist.dto.WishlistToggleResponse;

import java.util.List;

public interface WishlistService {
    List<WishlistItemDTO> getMyWishlist();
    List<Long> getMyWishlistProductIds();
    WishlistToggleResponse toggleWishlist(Long productId);
    void addToWishlist(Long productId);
    void removeFromWishlist(Long productId);
    boolean isInWishlist(Long productId);
}
