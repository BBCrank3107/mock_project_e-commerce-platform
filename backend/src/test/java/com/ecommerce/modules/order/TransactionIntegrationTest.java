package com.ecommerce.modules.order;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.*;
import org.junit.jupiter.api.condition.EnabledIfEnvironmentVariable;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.core.io.ClassPathResource;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.datasource.init.ResourceDatabasePopulator;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;
import java.util.Map;
import java.util.concurrent.*;
import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;

@SpringBootTest(properties={
    "spring.datasource.url=jdbc:postgresql://localhost:5432/ecommerce_member_b_test",
    "spring.jpa.hibernate.ddl-auto=none", "spring.sql.init.mode=always", "spring.jpa.show-sql=false",
    "logging.level.root=WARN"
})
@AutoConfigureMockMvc
@EnabledIfEnvironmentVariable(named="RUN_MEMBER_B_DB_TESTS", matches="true")
class TransactionIntegrationTest {
    @Autowired MockMvc mvc;
    @Autowired ObjectMapper json;
    @Autowired JdbcTemplate jdbc;
    @Autowired org.springframework.security.crypto.password.PasswordEncoder encoder;
    String customer;
    String admin;
    final Map<String, Object> checkout = Map.of("recipientName", "Nguyen Van An", "phone", "0912345678",
        "address", "123 Nguyen Hue", "city", "Ho Chi Minh", "paymentMethod", "COD", "couponCode", "WELCOME10");

    @BeforeEach void seed() throws Exception {
        assertEquals("ecommerce_member_b_test", jdbc.queryForObject("select current_database()", String.class));
        new ResourceDatabasePopulator(new ClassPathResource("schema.sql")).execute(jdbc.getDataSource());
        jdbc.update("update users set password=?", encoder.encode("123456"));
        customer = login("customer"); admin = login("admin");
    }

    String login(String user) throws Exception {
        return call(post("/api/auth/login"), null, Map.of("username", user, "password", "123456"), 200).path("data").path("token").asText();
    }

    JsonNode call(MockHttpServletRequestBuilder request, String token, Object body, int expected) throws Exception {
        if (token != null) request.header("Authorization", "Bearer " + token);
        if (body != null) request.contentType("application/json").content(json.writeValueAsString(body));
        var response = mvc.perform(request).andReturn().getResponse();
        assertEquals(expected, response.getStatus(), response.getContentAsString());
        return json.readTree(response.getContentAsString());
    }

    int stock(long id) { return jdbc.queryForObject("select stock_quantity from inventory where product_id=?", Integer.class, id); }

    @Test void checkoutRepricesAppliesCouponClearsCartAndCancelRestoresExactlyOnce() throws Exception {
        jdbc.update("update cart_items set price=1 where cart_id=1");
        int before = stock(12);
        var order = call(post("/api/orders/checkout"), customer, checkout, 200).path("data");
        assertEquals(2468000, order.path("totalAmount").decimalValue().intValueExact());
        assertEquals(246800, order.path("discountAmount").decimalValue().intValueExact());
        assertEquals(before-1, stock(12));
        assertEquals(0, call(get("/api/cart"), customer, null, 200).path("data").path("itemCount").asInt());
        long id = order.path("id").asLong(); assertTrue(id > 2);
        assertEquals(1, jdbc.queryForObject("select count(*) from payments where order_id=?", Integer.class, id));
        assertEquals(1, jdbc.queryForObject("select count(*) from shipping_info where order_id=?", Integer.class, id));
        call(post("/api/orders/"+id+"/cancel"), customer, null, 200);
        call(post("/api/orders/"+id+"/cancel"), customer, null, 200);
        assertEquals(before, stock(12));
        call(patch("/api/admin/orders/"+id+"/status"), admin, Map.of("status", "CONFIRMED"), 400);
    }

    @Test void invalidCouponRollsBackStockAndOrderAndKeepsCart() throws Exception {
        int before = stock(12);
        var body = new java.util.HashMap<>(checkout); body.put("couponCode", "INVALID");
        call(post("/api/orders/checkout"), customer, body, 400);
        assertEquals(before, stock(12));
        assertEquals(2, jdbc.queryForObject("select count(*) from orders", Integer.class));
        assertEquals(3, call(get("/api/cart"), customer, null, 200).path("data").path("itemCount").asInt());
    }

    @Test void insufficientStockRollsBackEarlierStockDeductions() throws Exception {
        int before = stock(12); jdbc.update("update inventory set stock_quantity=0 where product_id=15");
        call(post("/api/orders/checkout"), customer, checkout, 400);
        assertEquals(before, stock(12));
        assertEquals(2, jdbc.queryForObject("select count(*) from orders", Integer.class));
    }

    @Test void enforcesOwnershipAdminAccessAndValidation() throws Exception {
        call(get("/api/cart"), null, null, 401);
        call(get("/api/admin/orders"), customer, null, 403);
        call(post("/api/orders/2/cancel"), customer, null, 404);
        call(get("/api/orders/2"), customer, null, 404);
        call(put("/api/cart/items/1"), login("hoangnam"), Map.of("quantity", 2), 404);
        call(post("/api/cart/items"), customer, Map.of("productId", 1, "quantity", 0), 400);
        call(post("/api/cart/items"), customer, Map.of("productId", 1, "quantity", 999), 400);
        call(get("/api/orders/my-orders?size=101"), customer, null, 400);
        call(get("/api/admin/orders?status=INVALID"), admin, null, 400);
    }

    @Test void cartCrudCreatesCartAfterSeedAndMergesItems() throws Exception {
        var token = login("hoangnam");
        var cart = call(post("/api/cart/items"), token, Map.of("productId", 1, "quantity", 1), 200).path("data");
        assertTrue(cart.path("id").asLong() > 1);
        long item = cart.path("items").get(0).path("id").asLong();
        assertEquals(2, call(post("/api/cart/items"), token, Map.of("productId", 1, "quantity", 1), 200).path("data").path("itemCount").asInt());
        assertEquals(3, call(put("/api/cart/items/"+item), token, Map.of("quantity", 3), 200).path("data").path("itemCount").asInt());
        assertEquals(0, call(delete("/api/cart/items/"+item), token, null, 200).path("data").path("itemCount").asInt());
    }

    @Test void couponsCheckExpiryMinimumAndCap() throws Exception {
        var coupon = call(post("/api/promotions/apply"), customer, Map.of("code", "mockproject"), 200).path("data");
        assertEquals(493600, coupon.path("discountAmount").decimalValue().intValueExact());
        jdbc.update("update promotions set valid_to=current_timestamp - interval '1 day' where code='MOCKPROJECT'");
        call(post("/api/promotions/apply"), customer, Map.of("code", "MOCKPROJECT"), 400);
        jdbc.update("update promotions set min_order_amount=99999999 where code='WELCOME10'");
        call(post("/api/promotions/apply"), customer, Map.of("code", "WELCOME10"), 400);
        jdbc.update("update promotions set min_order_amount=0, max_discount_amount=100 where code='WELCOME10'");
        assertEquals(100, call(post("/api/promotions/apply"), customer, Map.of("code", "WELCOME10"), 200).path("data").path("discountAmount").asInt());
    }

    @Test void adminTransitionsSynchronizeShippingAndPaymentAndFilter() throws Exception {
        call(patch("/api/admin/orders/2/status"), admin, Map.of("status", "COMPLETED"), 400);
        for (var status : new String[]{"CONFIRMED", "SHIPPING", "COMPLETED"})
            call(patch("/api/admin/orders/2/status"), admin, Map.of("status", status), 200);
        var order = call(get("/api/admin/orders/2"), admin, null, 200).path("data");
        assertEquals("DELIVERED", order.path("shipping").path("shippingStatus").asText());
        assertEquals("COMPLETED", order.path("payment").path("paymentStatus").asText());
        call(patch("/api/admin/orders/2/status"), admin, Map.of("status", "CANCELLED"), 400);
        assertEquals(2, call(get("/api/admin/orders?status=COMPLETED&size=1"), admin, null, 200).path("data").path("totalPages").asInt());
    }

    @Test void concurrentCheckoutsCannotOversellLastUnit() throws Exception {
        jdbc.update("delete from cart_items"); jdbc.update("update inventory set stock_quantity=1 where product_id=1");
        String other = login("hoangnam");
        for (var token : new String[]{customer, other})
            call(post("/api/cart/items"), token, Map.of("productId", 1, "quantity", 1), 200);
        var pool = Executors.newFixedThreadPool(2); var start = new CountDownLatch(1);
        try {
            var tasks = new java.util.ArrayList<Future<Integer>>();
            for (var token : new String[]{customer, other}) tasks.add(pool.submit(() -> {
                start.await();
                return mvc.perform(post("/api/orders/checkout").header("Authorization", "Bearer "+token)
                    .contentType("application/json").content(json.writeValueAsString(checkout))).andReturn().getResponse().getStatus();
            }));
            start.countDown();
            var statuses = new java.util.ArrayList<Integer>();
            for (var task : tasks) statuses.add(task.get(20, TimeUnit.SECONDS));
            java.util.Collections.sort(statuses); assertEquals(java.util.List.of(200, 400), statuses);
            assertEquals(0, stock(1));
            assertEquals(3, jdbc.queryForObject("select count(*) from orders", Integer.class));
        } finally { pool.shutdownNow(); }
    }
}
