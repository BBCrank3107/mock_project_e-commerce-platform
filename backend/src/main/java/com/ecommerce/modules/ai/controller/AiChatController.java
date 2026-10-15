package com.ecommerce.modules.ai.controller;

import com.ecommerce.common.dto.ApiResponse;
import com.ecommerce.modules.ai.dto.AiChatDTOs.*;
import com.ecommerce.modules.ai.service.AiConsultingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
public class AiChatController {

    private final AiConsultingService aiConsultingService;

    @PostMapping("/chat")
    public ResponseEntity<ApiResponse<ChatResponse>> chat(@Valid @RequestBody ChatRequest request) {
        ChatResponse response = aiConsultingService.consult(request);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @GetMapping("/suggestions")
    public ResponseEntity<ApiResponse<List<String>>> getSuggestions() {
        return ResponseEntity.ok(ApiResponse.ok(aiConsultingService.getSuggestions()));
    }
}
