package com.ecommerce.api_gateway.security;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import jakarta.servlet.http.HttpServletRequest;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockFilterChain;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import tools.jackson.databind.ObjectMapper;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

import static org.junit.jupiter.api.Assertions.*;

class JwtAuthenticationFilterTest {

    private static final String SECRET =
            "this-is-a-temporary-secret-key-for-development-only-change-in-production";
    private final SecretKey key = Keys.hmacShaKeyFor(SECRET.getBytes(StandardCharsets.UTF_8));

    private String token(String subject) {
        return token(subject, "USER");
    }

    private String token(String subject, String role) {
        return Jwts.builder()
                .subject(subject)
                .claim("role", role)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + 3600000))
                .signWith(key)
                .compact();
    }

    private String tokenNoRole(String subject) {
        return Jwts.builder()
                .subject(subject)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + 3600000))
                .signWith(key)
                .compact();
    }

    private JwtAuthenticationFilter filter() {
        return new JwtAuthenticationFilter(new JwtUtil(), new ObjectMapper());
    }

    private MockHttpServletResponse run(String method, String path, String authHeader) throws Exception {
        MockHttpServletRequest request = new MockHttpServletRequest(method, path);
        if (authHeader != null) {
            request.addHeader("Authorization", authHeader);
        }
        MockHttpServletResponse response = new MockHttpServletResponse();
        MockFilterChain chain = new MockFilterChain();
        filter().doFilter(request, response, chain);
        return response;
    }

    @Test
    void validTokenInjectsXUserEmail() throws Exception {
        MockHttpServletRequest request = new MockHttpServletRequest("GET", "/api/v1/users");
        request.addHeader("Authorization", "Bearer " + token("alice@example.com"));
        MockHttpServletResponse response = new MockHttpServletResponse();
        MockFilterChain chain = new MockFilterChain();
        filter().doFilter(request, response, chain);
        assertEquals(200, response.getStatus());
        HttpServletRequest forwarded = (HttpServletRequest) chain.getRequest();
        assertEquals("alice@example.com", forwarded.getHeader("X-User-Email"));
    }

    @Test
    void protectedRouteWithoutTokenReturns401() throws Exception {
        MockHttpServletResponse response = run("GET", "/api/v1/users", null);
        assertEquals(401, response.getStatus());
        assertTrue(response.getContentAsString().contains("\"status\":401"));
    }

    @Test
    void malformedTokenReturns401() throws Exception {
        MockHttpServletResponse response = run("GET", "/api/v1/users", "Bearer not.a.jwt");
        assertEquals(401, response.getStatus());
    }

    @Test
    void publicProductGetPassesWithoutToken() throws Exception {
        MockHttpServletResponse response = run("GET", "/api/v1/products/1", null);
        assertEquals(200, response.getStatus());
    }

    @Test
    void productPostRequiresToken() throws Exception {
        MockHttpServletResponse response = run("POST", "/api/v1/products", null);
        assertEquals(401, response.getStatus());
    }

    @Test
    void authLoginPassesWithoutToken() throws Exception {
        MockHttpServletResponse response = run("POST", "/api/v1/auth/login", null);
        assertEquals(200, response.getStatus());
    }

    @Test
    void userCannotWriteProducts() throws Exception {
        MockHttpServletResponse response = run("POST", "/api/v1/products",
                "Bearer " + token("user@example.com"));
        assertEquals(403, response.getStatus());
        assertTrue(response.getContentAsString().contains("\"status\":403"));
    }

    @Test
    void adminCanWriteProducts() throws Exception {
        MockHttpServletResponse response = run("POST", "/api/v1/products",
                "Bearer " + token("admin@example.com", "ADMIN"));
        assertEquals(200, response.getStatus());
    }

    @Test
    void userCannotWriteCategories() throws Exception {
        MockHttpServletResponse response = run("POST", "/api/v1/categories",
                "Bearer " + token("user@example.com"));
        assertEquals(403, response.getStatus());
    }

    @Test
    void userCannotWriteInventory() throws Exception {
        MockHttpServletResponse response = run("POST", "/api/v1/inventory",
                "Bearer " + token("user@example.com"));
        assertEquals(403, response.getStatus());
    }

    @Test
    void userCanPlaceOrder() throws Exception {
        MockHttpServletResponse response = run("POST", "/api/v1/orders",
                "Bearer " + token("user@example.com"));
        assertEquals(200, response.getStatus());
    }

    @Test
    void tokenWithoutRoleOnAdminPathReturns403() throws Exception {
        MockHttpServletResponse response = run("POST", "/api/v1/products",
                "Bearer " + tokenNoRole("legacy@example.com"));
        assertEquals(403, response.getStatus());
    }

    @Test
    void validTokenInjectsXUserRole() throws Exception {
        MockHttpServletRequest request = new MockHttpServletRequest("GET", "/api/v1/users");
        request.addHeader("Authorization", "Bearer " + token("admin@example.com", "ADMIN"));
        MockHttpServletResponse response = new MockHttpServletResponse();
        MockFilterChain chain = new MockFilterChain();
        filter().doFilter(request, response, chain);
        assertEquals(200, response.getStatus());
        HttpServletRequest forwarded = (HttpServletRequest) chain.getRequest();
        assertEquals("ADMIN", forwarded.getHeader("X-User-Role"));
    }

    @Test
    void defaultUserTokenInjectsUserRole() throws Exception {
        MockHttpServletRequest request = new MockHttpServletRequest("GET", "/api/v1/users");
        request.addHeader("Authorization", "Bearer " + token("user@example.com"));
        MockHttpServletResponse response = new MockHttpServletResponse();
        MockFilterChain chain = new MockFilterChain();
        filter().doFilter(request, response, chain);
        assertEquals(200, response.getStatus());
        HttpServletRequest forwarded = (HttpServletRequest) chain.getRequest();
        assertEquals("USER", forwarded.getHeader("X-User-Role"));
    }

    @Test
    void tokenWithoutRoleLeavesXUserRoleAbsent() throws Exception {
        MockHttpServletRequest request = new MockHttpServletRequest("GET", "/api/v1/users");
        request.addHeader("Authorization", "Bearer " + tokenNoRole("legacy@example.com"));
        MockHttpServletResponse response = new MockHttpServletResponse();
        MockFilterChain chain = new MockFilterChain();
        filter().doFilter(request, response, chain);
        assertEquals(200, response.getStatus());
        HttpServletRequest forwarded = (HttpServletRequest) chain.getRequest();
        assertNull(forwarded.getHeader("X-User-Role"));
    }
}
