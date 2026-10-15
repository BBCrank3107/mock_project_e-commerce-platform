package com.ecommerce.modules.ai.service;

import com.ecommerce.modules.ai.dto.AiChatDTOs.*;
import com.ecommerce.modules.catalog.dto.ProductDTO;
import com.ecommerce.modules.catalog.entity.Product;
import com.ecommerce.modules.catalog.repository.ProductRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestClient;

import java.math.BigDecimal;
import java.text.NumberFormat;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class AiConsultingService {

    private final ProductRepository productRepository;
    private final com.ecommerce.modules.promotion_inventory.repository.PromotionRepository promotionRepository;
    private final ObjectMapper objectMapper;

    @Value("${app.gemini.api-key:}")
    private String geminiApiKey;

    @Value("${app.gemini.model:gemini-3.8-flash}")
    private String geminiModel;

    public enum DeviceCategory {
        PHONE("Điện thoại"),
        LAPTOP("Laptop"),
        TABLET("Máy tính bảng"),
        AUDIO("Âm thanh & Tai nghe"),
        WATCH("Đồng hồ thông minh"),
        ACCESSORY("Phụ kiện công nghệ"),
        ANY("Sản phẩm công nghệ");

        private final String displayName;

        DeviceCategory(String displayName) {
            this.displayName = displayName;
        }

        public String getDisplayName() {
            return displayName;
        }
    }

    private static final String STORE_POLICIES = """
            - Cửa hàng: CyberTech Store - Hệ thống bán lẻ công nghệ và phong cách sống chính hãng cao cấp.
            - Chính sách giao hàng: Miễn phí vận chuyển toàn quốc cho đơn hàng từ 500.000đ. Đơn dưới 500.000đ phí ship đồng giá 30.000đ.
            - Chính sách bảo hành: Bảo hành chính hãng 12 đến 24 tháng cho toàn bộ thiết bị điện tử. Đổi mới 1-1 trong 7 ngày đầu nếu có lỗi do nhà sản xuất.
            - Thanh toán: Hỗ trợ thanh toán tiền mặt khi nhận hàng (COD) và Chuyển khoản ngân hàng trực tuyến (VietQR quét mã tự động xác nhận tức thì).
            - Khuyến mãi hiện có: Mã 'WELCOME10' giảm 10% tối đa 500.000đ, mã 'CYBERTECH20' giảm 20% tối đa 1.500.000đ.
            """;

    public List<String> getSuggestions() {
        return List.of(
                "Tư vấn điện thoại chụp ảnh đẹp pin trâu",
                "Laptop mỏng nhẹ văn phòng dưới 25 triệu",
                "So sánh Samsung Galaxy S25 và Galaxy S26",
                "Chính sách bảo hành và đổi trả như thế nào?"
        );
    }

    @Transactional(readOnly = true)
    public ChatResponse consult(ChatRequest request) {
        String userQuery = request.getMessage() != null ? request.getMessage().trim() : "";
        if (userQuery.isBlank()) {
            return ChatResponse.builder()
                    .reply("Dạ, CyberTech Store có thể giúp gì cho anh/chị hôm nay ạ?")
                    .recommendedProducts(List.of())
                    .suggestedQuestions(getSuggestions())
                    .source("LOCAL_KNOWLEDGE_BASE")
                    .build();
        }

        String lowerQuery = userQuery.toLowerCase(Locale.ROOT);
        DeviceCategory intent = detectIntent(lowerQuery);

        // 1. RETRIEVAL (RAG): Tìm kiếm sản phẩm thực tế trong CSDL
        List<Product> matchedProducts = retrieveProductsFromDatabase(lowerQuery, intent);
        List<ProductDTO> productDTOs = matchedProducts.stream()
                .limit(4)
                .map(ProductDTO::from)
                .collect(Collectors.toList());

        // 2. AUGMENTATION & GENERATION: Gọi LLM (Gemini API)
        // Hệ thống sẽ tự động gọi API cho mọi câu hỏi (cả trong kho lẫn ngoài phạm vi RAG như so sánh máy, hỏi công nghệ...)
        if (geminiApiKey != null && !geminiApiKey.isBlank() && !geminiApiKey.startsWith("YOUR_")) {
            try {
                String aiReply = callGeminiApi(userQuery, matchedProducts);
                if (aiReply != null && !aiReply.isBlank()) {
                    return ChatResponse.builder()
                            .reply(aiReply)
                            .recommendedProducts(productDTOs)
                            .suggestedQuestions(generateFollowUps(lowerQuery, intent, !matchedProducts.isEmpty()))
                            .source("GEMINI_AI")
                            .build();
                }
            } catch (Exception ex) {
                log.warn("Gemini API call failed or timed out. Falling back to dynamic local engine: {}", ex.getMessage());
            }
        }

        // 3. FALLBACK DYNAMIC ENGINE: Chỉ kích hoạt khi mất kết nối mạng hoặc không có API key
        String localReply = generateDynamicLocalReply(lowerQuery, matchedProducts);
        return ChatResponse.builder()
                .reply(localReply)
                .recommendedProducts(productDTOs)
                .suggestedQuestions(generateFollowUps(lowerQuery, intent, !matchedProducts.isEmpty()))
                .source("LOCAL_KNOWLEDGE_BASE")
                .build();
    }

    private List<Product> retrieveProductsFromDatabase(String lowerQuery, DeviceCategory intent) {
        BigDecimal detectedBudget = extractBudget(lowerQuery);
        Set<String> requestedSpecificModels = extractSpecificModels(lowerQuery);
        boolean isComparison = containsAny(lowerQuery, "so sánh", "so sanh", "vs", "versus", "khác nhau", "khac nhau");

        List<String> tokens = Arrays.stream(lowerQuery.split("\\s+"))
                .filter(t -> t.length() >= 2 && !isStopWord(t))
                .toList();

        List<Product> allActive = productRepository.findAll().stream()
                .filter(p -> Boolean.TRUE.equals(p.getIsActive()))
                .toList();

        // Chấm điểm mức độ liên quan
        List<Map.Entry<Product, Integer>> scoredProducts = allActive.stream()
                .map(p -> Map.entry(p, computeRelevanceScore(p, lowerQuery, intent, detectedBudget, tokens, requestedSpecificModels, isComparison)))
                .filter(entry -> entry.getValue() > 0)
                .sorted((a, b) -> Integer.compare(b.getValue(), a.getValue()))
                .toList();

        if (!scoredProducts.isEmpty()) {
            return scoredProducts.stream()
                    .map(Map.Entry::getKey)
                    .limit(4)
                    .collect(Collectors.toList());
        }

        // Nếu câu hỏi ngoài phạm vi RAG (ví dụ: so sánh máy không có trong CSDL), trả về danh sách rỗng
        // để LLM tự do phân tích tri thức rộng mà không bị ép hiển thị thẻ sản phẩm sai.
        return List.of();
    }

    private int computeRelevanceScore(Product product, String lowerQuery, DeviceCategory intent,
                                      BigDecimal budget, List<String> tokens,
                                      Set<String> requestedSpecificModels, boolean isComparison) {
        String lowerName = product.getName() != null ? product.getName().toLowerCase(Locale.ROOT) : "";
        String normalizedName = lowerName.replaceAll("\\s+", "");
        DeviceCategory prodCategory = getProductCategory(product);

        // 1. Kiểm tra mã model cụ thể được nhắc tới (ví dụ: người dùng hỏi S25, S26 nhưng kho chỉ có S24)
        if (!requestedSpecificModels.isEmpty()) {
            boolean matchesAnyRequested = false;
            for (String model : requestedSpecificModels) {
                if (normalizedName.contains(model)) {
                    matchesAnyRequested = true;
                    break;
                }
            }
            if (!matchesAnyRequested) {
                // Người dùng hỏi đích danh model máy mà sản phẩm này không phải -> Phạt loại bỏ
                return -999;
            }
        }

        // 2. Nếu là câu hỏi so sánh mà không khớp model trong CSDL -> Không đề xuất
        if (isComparison && requestedSpecificModels.isEmpty() && !lowerQuery.contains(lowerName)) {
            // Không phải so sánh các sản phẩm cụ thể có trong kho
            boolean matchesBrandAndLine = false;
            if (lowerQuery.contains("iphone") && lowerName.contains("iphone")) matchesBrandAndLine = true;
            if (lowerQuery.contains("samsung") && lowerName.contains("samsung")) matchesBrandAndLine = true;
            if (lowerQuery.contains("macbook") && lowerName.contains("macbook")) matchesBrandAndLine = true;
            if (!matchesBrandAndLine) {
                return -999;
            }
        }

        int score = 0;

        // 3. Khớp ngành hàng
        if (intent != DeviceCategory.ANY) {
            if (prodCategory == intent) {
                score += 200;
            } else {
                return -999; // Phạt nặng: Không bao giờ trả về sai ngành hàng
            }
        }

        String desc = product.getDescription() != null ? product.getDescription().toLowerCase(Locale.ROOT) : "";
        String subName = (product.getSubcategory() != null && product.getSubcategory().getName() != null)
                ? product.getSubcategory().getName().toLowerCase(Locale.ROOT) : "";

        // 4. Nhận diện tính năng tìm kiếm (Chụp ảnh, pin, mỏng nhẹ, gaming, âm thanh...)
        if (containsAny(lowerQuery, "chụp ảnh", "chụp hình", "camera", "quay phim", "zoom", "sống ảo")) {
            if (desc.contains("camera") || desc.contains("zoom") || desc.contains("200mp") || desc.contains("tiềm vọng")) score += 80;
            if (lowerName.contains("pro max") || lowerName.contains("ultra")) score += 60;
        }

        if (containsAny(lowerQuery, "pin", "pin trâu", "pin khỏe", "thời lượng pin", "dung lượng pin")) {
            if (desc.contains("pin") || desc.contains("thời lượng")) score += 80;
            if (lowerName.contains("pro max") || lowerName.contains("ultra") || lowerName.contains("plus")) score += 50;
        }

        if (containsAny(lowerQuery, "mỏng nhẹ", "văn phòng", "học tập", "gọn nhẹ", "di động")) {
            if (desc.contains("mỏng nhẹ") || desc.contains("độ mỏng") || desc.contains("nhôm nguyên khối") || lowerName.contains("air")) score += 80;
        }

        if (containsAny(lowerQuery, "chơi game", "gaming", "đồ họa", "cấu hình mạnh", "hiệu năng", "mượt")) {
            if (desc.contains("gaming") || desc.contains("rtx") || desc.contains("mạnh mẽ") || desc.contains("đột phá")) score += 80;
        }

        if (containsAny(lowerQuery, "chống ồn", "âm thanh", "anc", "bass")) {
            if (desc.contains("chống ồn") || desc.contains("hi-res") || desc.contains("âm thanh")) score += 80;
        }

        // 5. Khớp thương hiệu
        if (containsAny(lowerQuery, "apple", "iphone") && (lowerName.contains("iphone") || lowerName.contains("apple"))) score += 60;
        if (containsAny(lowerQuery, "samsung", "galaxy") && lowerName.contains("samsung")) score += 60;
        if (containsAny(lowerQuery, "macbook") && lowerName.contains("macbook")) score += 60;
        if (containsAny(lowerQuery, "sony") && lowerName.contains("sony")) score += 60;
        if (containsAny(lowerQuery, "marshall") && lowerName.contains("marshall")) score += 60;

        // 6. Khớp ngân sách
        BigDecimal effectivePrice = product.getDiscountPrice() != null ? product.getDiscountPrice() : product.getPrice();
        if (budget != null && budget.compareTo(BigDecimal.ZERO) > 0) {
            BigDecimal maxAllowed = budget.multiply(BigDecimal.valueOf(1.15));
            if (effectivePrice.compareTo(maxAllowed) <= 0) {
                score += 50;
            } else {
                score -= 150;
            }
        }

        // 7. Khớp từ khóa
        for (String token : tokens) {
            if (lowerName.contains(token)) score += 25;
            if (subName.contains(token)) score += 15;
            if (desc.contains(token)) score += 5;
        }

        return score;
    }

    private Set<String> extractSpecificModels(String query) {
        Set<String> models = new HashSet<>();
        // Bắt các mẫu model phổ biến: s20..s29, iphone 11..18, ip11..ip18, rtx 3000..5000, m1..m5
        Pattern p = Pattern.compile("\\b(s\\s*\\d{2}|ip\\s*\\d{1,2}|iphone\\s*\\d{1,2}|galaxy\\s*s\\d{1,2}|rtx\\s*\\d{4}|m\\s*[1-5])\\b");
        Matcher m = p.matcher(query.toLowerCase(Locale.ROOT));
        while (m.find()) {
            models.add(m.group(1).replaceAll("\\s+", ""));
        }
        return models;
    }

    public DeviceCategory detectIntent(String text) {
        if (containsAny(text, "bàn phím", "chuột", "củ sạc", "cáp sạc", "keyboard", "mouse", "charger", "cáp type-c")) {
            return DeviceCategory.ACCESSORY;
        }
        if (containsAny(text, "đồng hồ", "dong ho", "watch", "apple watch", "galaxy watch", "smartwatch")) {
            return DeviceCategory.WATCH;
        }
        if (containsAny(text, "tai nghe", "loa", "headphone", "earphone", "airpods", "marshall", "sony wh", "chống ồn")) {
            return DeviceCategory.AUDIO;
        }
        if (containsAny(text, "ipad", "tablet", "máy tính bảng", "may tinh bang", "tab")) {
            return DeviceCategory.TABLET;
        }
        if (containsAny(text, "laptop", "macbook", "máy tính xách tay", "ultrabook", "gaming laptop", "zephyrus", "máy trạm")) {
            return DeviceCategory.LAPTOP;
        }
        if (containsAny(text, "điện thoại", "dien thoai", "smartphone", "phone", "iphone", "samsung galaxy", "galaxy s24", "galaxy ultra", "đt", "mobile")) {
            return DeviceCategory.PHONE;
        }
        return DeviceCategory.ANY;
    }

    private DeviceCategory getProductCategory(Product product) {
        String name = product.getName() != null ? product.getName().toLowerCase(Locale.ROOT) : "";
        if (name.contains("iphone") || name.contains("galaxy s") || name.contains("galaxy z") || name.contains("ai phone") || name.contains("smartphone")) {
            return DeviceCategory.PHONE;
        }
        if (name.contains("ipad") || name.contains("tablet") || name.contains("tab")) {
            return DeviceCategory.TABLET;
        }
        if (name.contains("macbook") || name.contains("laptop") || name.contains("zephyrus")) {
            return DeviceCategory.LAPTOP;
        }
        if (name.contains("tai nghe") || name.contains("airpods") || name.contains("loa") || name.contains("wh-1000xm") || name.contains("marshall")) {
            return DeviceCategory.AUDIO;
        }
        if (name.contains("watch") || name.contains("đồng hồ")) {
            return DeviceCategory.WATCH;
        }
        if (name.contains("chuột") || name.contains("bàn phím") || name.contains("sạc") || name.contains("cáp")) {
            return DeviceCategory.ACCESSORY;
        }

        if (product.getSubcategory() == null) return DeviceCategory.ANY;
        String subSlug = product.getSubcategory().getSlug() != null ? product.getSubcategory().getSlug().toLowerCase(Locale.ROOT) : "";
        String subName = product.getSubcategory().getName() != null ? product.getSubcategory().getName().toLowerCase(Locale.ROOT) : "";
        String catSlug = (product.getSubcategory().getCategory() != null && product.getSubcategory().getCategory().getSlug() != null)
                ? product.getSubcategory().getCategory().getSlug().toLowerCase(Locale.ROOT) : "";

        if (subSlug.contains("iphone") || subSlug.contains("samsung-galaxy") || subName.contains("iphone") || subName.contains("samsung")) {
            return DeviceCategory.PHONE;
        }
        if (subSlug.contains("ipad") || subSlug.contains("tablet") || subName.contains("ipad") || subName.contains("tablet")) {
            return DeviceCategory.TABLET;
        }
        if (catSlug.contains("laptop") || subSlug.contains("macbook") || subSlug.contains("laptop") || subName.contains("laptop") || subName.contains("macbook")) {
            return DeviceCategory.LAPTOP;
        }
        if (catSlug.contains("am-thanh") || subSlug.contains("tai-nghe") || subSlug.contains("loa") || subName.contains("tai nghe") || subName.contains("loa")) {
            return DeviceCategory.AUDIO;
        }
        if (catSlug.contains("dong-ho") || subSlug.contains("watch") || subName.contains("watch") || subName.contains("đồng hồ")) {
            return DeviceCategory.WATCH;
        }
        if (catSlug.contains("phu-kien") || subSlug.contains("ban-phim") || subName.contains("chuột") || subName.contains("bàn phím") || subName.contains("sạc")) {
            return DeviceCategory.ACCESSORY;
        }
        return DeviceCategory.ANY;
    }

    private boolean containsAny(String text, String... keywords) {
        for (String kw : keywords) {
            if (text.contains(kw)) return true;
        }
        return false;
    }

    private BigDecimal extractBudget(String text) {
        Pattern millionPattern = Pattern.compile("(\\d+([.,]\\d+)?)\\s*(triệu|trieu|tr|m)\\b");
        Matcher m1 = millionPattern.matcher(text);
        if (m1.find()) {
            try {
                double val = Double.parseDouble(m1.group(1).replace(",", "."));
                return BigDecimal.valueOf((long) (val * 1_000_000));
            } catch (Exception ignored) {}
        }

        Pattern thousandPattern = Pattern.compile("(\\d+([.,]\\d+)?)\\s*(nghìn|nghin|k)\\b");
        Matcher m2 = thousandPattern.matcher(text);
        if (m2.find()) {
            try {
                double val = Double.parseDouble(m2.group(1).replace(",", "."));
                return BigDecimal.valueOf((long) (val * 1_000));
            } catch (Exception ignored) {}
        }
        return null;
    }

    private boolean isStopWord(String word) {
        return Set.of(
                "cho", "tôi", "em", "mình", "cần", "mua", "tư", "vấn", "có", "nào",
                "giá", "dưới", "khoảng", "tầm", "được", "không", "nhé", "ạ", "ơi",
                "với", "là", "và", "các", "một", "trong"
        ).contains(word);
    }

    private String callGeminiApi(String userQuery, List<Product> products) {
        StringBuilder context = new StringBuilder();
        context.append("=== CHÍNH SÁCH CỬA HÀNG CYBERTECH STORE ===\n").append(STORE_POLICIES).append("\n");

        if (!products.isEmpty()) {
            context.append("=== SẢN PHẨM PHÙ HỢP HIỆN CÓ TRONG KHO CYBERTECH STORE ===\n");
            for (Product p : products) {
                BigDecimal effectivePrice = p.getDiscountPrice() != null ? p.getDiscountPrice() : p.getPrice();
                context.append(String.format("- ID: %d | Tên: %s | Giá bán: %s | Danh mục: %s | Mô tả thông số: %s\n",
                        p.getId(), p.getName(), formatVnd(effectivePrice),
                        p.getSubcategory() != null ? p.getSubcategory().getName() : "Khác",
                        p.getDescription() != null ? p.getDescription() : ""));
            }
        }

        String systemPrompt = """
                Bạn là 'Trợ lý AI CyberTech' - chuyên viên tư vấn công nghệ và bán hàng thông minh của hệ thống CyberTech Store.
                
                QUY TẮC TƯ VẤN:
                1. Phong cách: Luôn xưng 'em' và gọi khách là 'anh/chị', trả lời bằng tiếng Việt lịch sự, thân thiện, kiến thức chuẩn xác, văn phong tự nhiên.
                
                2. QUY TẮC ĐỊNH DẠNG VĂN BẢN CHUYÊN NGHIỆP TRÊN GIAO DIỆN CHAT:
                   - Tuyệt đối KHÔNG dùng các ký tự markdown thô gây rối mắt: KHÔNG dùng dấu thăng (#, ##, ###), KHÔNG dùng các đường kẻ gạch nối (---, ***), KHÔNG vẽ bảng bằng ký tự kẻ sọc (|).
                   - Dùng đề mục in đậm rõ ràng (ví dụ: **1. Hiệu năng & Vi xử lý:**, **2. Công nghệ AI:**).
                   - Trình bày danh sách bằng dấu gạch đầu dòng tròn chuẩn (•) hoặc số thứ tự (1, 2, 3).
                   - In đậm (**tên sản phẩm, thông số quan trọng**) để câu trả lời sinh động, dễ theo dõi.
                
                3. KHI CÂU HỎI LIÊN QUAN ĐẾN SẢN PHẨM CỬA HÀNG (RAG In-Store):
                   - Nếu câu hỏi tìm mua sản phẩm và có 'SẢN PHẨM PHÙ HỢP HIỆN CÓ TRONG KHO' ở trên:
                     + Hãy tư vấn các sản phẩm đó, phân tích các đặc điểm nổi bật khớp với nhu cầu của khách hàng.
                     + Nhắc khách có thể bấm vào thẻ sản phẩm bên dưới để xem chi tiết hoặc thêm vào giỏ hàng.
                     + Tuyệt đối không đề xuất sản phẩm sai danh mục (ví dụ: hỏi điện thoại thì không tư vấn laptop hay ipad).
                
                4. KHI CÂU HỎI NGOÀI DANH MỤC KHO HÀNG HOẶC SO SÁNH / HỎI ĐÁP CÔNG NGHỆ CHUNG (Out-of-scope / Tech Comparison):
                   - Ví dụ: Khách hỏi so sánh Samsung S25 vs S26, iPhone 16 vs 17, chip M3 vs M4, công nghệ màn hình, tư vấn lập trình, hỏi đáp phần cứng... mà cửa hàng chưa có hoặc không bán:
                     + Hãy sử dụng toàn bộ tri thức công nghệ sâu rộng của bạn để phân tích, so sánh chi tiết, khách quan và chính xác (về thông số, hiệu năng chip, AI, camera, thời điểm ra mắt, ưu/nhược điểm...).
                     + Không từ chối trả lời, không bịa đặt rằng cửa hàng đang bán các máy chưa ra mắt.
                     + Ở phần kết, có thể gợi ý thêm một cách tự nhiên: Nếu anh/chị cần một sản phẩm sẵn hàng để trải nghiệm ngay, CyberTech Store hiện đang có sẵn các dòng flagship như Galaxy S24 Ultra, iPhone 15 Pro Max...
                
                5. KHI KHÁCH HỎI VỀ CHÍNH SÁCH / VẬN CHUYỂN / BẢO HÀNH / THANH TOÁN:
                   - Dựa vào 'CHÍNH SÁCH CỬA HÀNG' ở trên để giải đáp chính xác (bảo hành 12-24 tháng, đổi mới 7 ngày, miễn phí ship từ 500k, thanh toán VietQR / COD, mã giảm giá...).
                """;

        String url = String.format("https://generativelanguage.googleapis.com/v1beta/models/%s:generateContent?key=%s",
                geminiModel, geminiApiKey);

        Map<String, Object> payload = Map.of(
                "contents", List.of(
                        Map.of("role", "user", "parts", List.of(
                                Map.of("text", systemPrompt + "\n\n" + context + "\n\nCÂU HỎI CỦA KHÁCH HÀNG: " + userQuery)
                        ))
                )
        );

        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(10000);
        factory.setReadTimeout(20000);

        RestClient restClient = RestClient.builder().requestFactory(factory).build();
        String jsonResponse = restClient.post()
                .uri(url)
                .contentType(MediaType.APPLICATION_JSON)
                .body(payload)
                .retrieve()
                .body(String.class);

        return extractGeminiText(jsonResponse);
    }

    private String extractGeminiText(String json) {
        try {
            JsonNode root = objectMapper.readTree(json);
            JsonNode textNode = root.path("candidates").path(0).path("content").path("parts").path(0).path("text");
            if (!textNode.isMissingNode()) {
                return textNode.asText();
            }
        } catch (Exception e) {
            log.error("Failed to parse Gemini response: {}", e.getMessage());
        }
        return null;
    }

    /**
     * Bộ sinh phản hồi nội bộ linh hoạt (Dynamic Fallback) khi mất kết nối tới Gemini API.
     * Hoàn toàn không hardcode tên sản phẩm hay thông số, dữ liệu được sinh động từ CSDL.
     */
    private String generateDynamicLocalReply(String query, List<Product> products) {
        // Kiểm tra hỏi về chính sách
        if (query.contains("bảo hành") || query.contains("đổi trả") || query.contains("lỗi")) {
            return "Dạ chào anh/chị! Về chính sách bảo hành, CyberTech Store áp dụng chế độ bảo hành chính hãng từ 12 đến 24 tháng cho toàn bộ sản phẩm thiết bị. Đặc biệt, bên em hỗ trợ đổi mới 1-1 miễn phí trong 7 ngày đầu tiên nếu máy phát sinh lỗi kỹ thuật từ nhà sản xuất ạ!";
        }
        if (query.contains("vận chuyển") || query.contains("ship") || query.contains("giao hàng")) {
            return "Dạ, CyberTech Store hỗ trợ miễn phí vận chuyển toàn quốc cho mọi đơn hàng từ 500.000đ trở lên ạ! Thời gian giao hàng chỉ từ 1-3 ngày làm việc.";
        }
        if (query.contains("khuyến mãi") || query.contains("voucher") || query.contains("mã giảm") || query.contains("coupon")) {
            java.time.Instant now = java.time.Instant.now();
            List<com.ecommerce.modules.promotion_inventory.entity.Promotion> activePromos = promotionRepository.findByIsActiveTrue().stream()
                    .filter(p -> (p.getValidFrom() == null || !now.isBefore(p.getValidFrom()))
                              && (p.getValidTo() == null || now.isBefore(p.getValidTo())))
                    .toList();

            if (activePromos.isEmpty()) {
                return "Dạ hiện tại CyberTech Store chưa có chương trình phát hành mã giảm giá mới. Tuy nhiên bên em luôn có giá ưu đãi trực tiếp trên từng sản phẩm cùng chính sách miễn phí vận chuyển toàn quốc cho đơn từ 500.000đ anh/chị nhé!";
            }

            StringBuilder sb = new StringBuilder("Dạ hiện tại CyberTech Store đang có các mã voucher ưu đãi cực hấp dẫn dành cho anh/chị khi đặt hàng:\n\n");
            for (var promo : activePromos) {
                sb.append("• Mã **").append(promo.getCode()).append("**: Giảm ngay **")
                  .append(promo.getDiscountPercent()).append("%**");
                if (promo.getMaxDiscountAmount() != null) {
                    sb.append(" (tối đa ").append(formatVnd(promo.getMaxDiscountAmount())).append(")");
                }
                if (promo.getMinOrderAmount() != null && promo.getMinOrderAmount().compareTo(BigDecimal.ZERO) > 0) {
                    sb.append(" cho đơn từ ").append(formatVnd(promo.getMinOrderAmount()));
                }
                if (promo.getDescription() != null && !promo.getDescription().isBlank()) {
                    sb.append(" — *").append(promo.getDescription()).append("*");
                }
                sb.append("\n");
            }
            sb.append("\nAnh/chị chỉ cần nhập mã tại bước Thanh toán để được giảm giá trực tiếp nhé ạ!");
            return sb.toString();
        }

        if (products.isEmpty()) {
            return "Dạ, câu hỏi của anh/chị hiện nằm ngoài danh mục sản phẩm đang kinh doanh tại CyberTech Store. Bên em chuyên cung cấp các thiết bị công nghệ chính hãng gồm Điện thoại, Laptop, Tablet, Tai nghe & Loa, Đồng hồ thông minh và Phụ kiện. Anh/chị có thể cho em biết thêm chi tiết hoặc nhu cầu cụ thể để em hỗ trợ tư vấn nhé ạ!";
        }

        StringBuilder sb = new StringBuilder();
        sb.append("Dạ, dựa trên nhu cầu của anh/chị, CyberTech Store xin gợi ý các sản phẩm phù hợp đang có sẵn tại cửa hàng:\n\n");
        for (Product p : products) {
            BigDecimal price = p.getDiscountPrice() != null ? p.getDiscountPrice() : p.getPrice();
            sb.append(String.format("• **%s**: Giá ưu đãi chỉ **%s**\n", p.getName(), formatVnd(price)));
            if (p.getDescription() != null && !p.getDescription().isBlank()) {
                String brief = p.getDescription().length() > 120 ? p.getDescription().substring(0, 120) + "..." : p.getDescription();
                sb.append("  ↳ *Thông tin nổi bật*: ").append(brief).append("\n");
            }
        }
        sb.append("\nAnh/chị có thể bấm trực tiếp vào thẻ sản phẩm bên dưới để xem thông số chi tiết hoặc thêm vào giỏ hàng ngay nhé ạ!");
        return sb.toString();
    }

    private List<String> generateFollowUps(String query, DeviceCategory intent, boolean hasMatchedProducts) {
        if (!hasMatchedProducts) {
            return List.of(
                    "Các dòng flagship đang sẵn hàng tại CyberTech Store",
                    "Chính sách bảo hành và đổi trả 7 ngày",
                    "Mã giảm giá đang áp dụng hôm nay"
            );
        }
        if (intent == DeviceCategory.PHONE) {
            return List.of(
                    "So sánh camera và dung lượng pin",
                    "Chính sách đổi mới 1-1 trong 7 ngày",
                    "Thanh toán chuyển khoản quét mã VietQR"
            );
        }
        if (intent == DeviceCategory.LAPTOP) {
            return List.of(
                    "Chính sách bảo hành chính hãng laptop",
                    "Laptop pin dùng trên 15 tiếng",
                    "Xem các mã giảm giá đang áp dụng"
            );
        }
        return List.of(
                "Tư vấn điện thoại chụp ảnh đẹp pin trâu",
                "Laptop mỏng nhẹ văn phòng dưới 25 triệu",
                "Chính sách bảo hành và đổi trả trong 7 ngày"
        );
    }

    private String formatVnd(BigDecimal amount) {
        if (amount == null) return "0 đ";
        return NumberFormat.getCurrencyInstance(new Locale("vi", "VN")).format(amount);
    }
}
