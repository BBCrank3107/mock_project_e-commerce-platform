package com.ecommerce.modules.ai.dto;

import com.ecommerce.modules.catalog.dto.ProductDTO;
import jakarta.validation.constraints.NotBlank;
import lombok.*;
import java.util.List;

public final class AiChatDTOs {
    private AiChatDTOs() {}

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ChatRequest {
        @NotBlank(message = "Nội dung câu hỏi không được để trống")
        private String message;
        private String conversationId;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ChatResponse {
        private String reply;
        private List<ProductDTO> recommendedProducts;
        private List<String> suggestedQuestions;
        private String source; // "GEMINI_AI" hoặc "LOCAL_KNOWLEDGE_BASE"
    }
}
