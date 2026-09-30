package com.ecommerce.modules.catalog.service;

import com.ecommerce.modules.auth_user.entity.User;
import com.ecommerce.modules.auth_user.repository.UserRepository;
import com.ecommerce.modules.catalog.dto.ReviewCreateRequest;
import com.ecommerce.modules.catalog.dto.ReviewDTO;
import com.ecommerce.modules.catalog.entity.Product;
import com.ecommerce.modules.catalog.entity.Review;
import com.ecommerce.modules.catalog.repository.ProductRepository;
import com.ecommerce.modules.catalog.repository.ReviewRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<ReviewDTO> getReviewsByProductId(Long productId) {
        return reviewRepository.findByProductIdOrderByCreatedAtDesc(productId)
                .stream()
                .map(ReviewDTO::from)
                .collect(Collectors.toList());
    }

    @Transactional
    public ReviewDTO createReview(Long productId, ReviewCreateRequest request) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getPrincipal())) {
            throw new RuntimeException("Vui lòng đăng nhập để gửi đánh giá sản phẩm");
        }

        User user = userRepository.findByUsername(auth.getName())
                .orElseThrow(() -> new RuntimeException("Người dùng không tồn tại"));

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Sản phẩm không tồn tại"));

        if (reviewRepository.existsByUserIdAndProductId(user.getId(), productId)) {
            throw new RuntimeException("Bạn đã đánh giá sản phẩm này rồi!");
        }

        Review review = Review.builder()
                .user(user)
                .product(product)
                .rating(request.getRating())
                .comment(request.getComment().trim())
                .build();

        Review saved = reviewRepository.save(review);
        return ReviewDTO.from(saved);
    }
}
