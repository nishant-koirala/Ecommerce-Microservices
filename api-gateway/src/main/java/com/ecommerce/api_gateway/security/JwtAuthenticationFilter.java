package com.ecommerce.api_gateway.security;

import tools.jackson.databind.ObjectMapper;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.util.AntPathMatcher;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.Map;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    public static final String X_USER_EMAIL_HEADER = "X-User-Email";
    public static final String X_USER_ROLE_HEADER = "X-User-Role";

    private static final AntPathMatcher PATH_MATCHER = new AntPathMatcher();
    private static final String BEARER_PREFIX = "Bearer ";

    private final JwtUtil jwtUtil;
    private final ObjectMapper objectMapper;

    public JwtAuthenticationFilter(JwtUtil jwtUtil, ObjectMapper objectMapper) {
        this.jwtUtil = jwtUtil;
        this.objectMapper = objectMapper;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        String path = request.getRequestURI().substring(request.getContextPath().length());

        if (PATH_MATCHER.match("/actuator/**", path) || !path.startsWith("/api/v1")) {
            filterChain.doFilter(request, response);
            return;
        }

        if (isPublic(path, request.getMethod())) {
            filterChain.doFilter(request, response);
            return;
        }

        String token = resolveToken(request);
        if (token == null) {
            writeUnauthorized(response, "Missing Authorization header");
            return;
        }

        String email = jwtUtil.extractEmail(token);
        if (email == null) {
            writeUnauthorized(response, "Invalid or expired token");
            return;
        }

        String role = jwtUtil.extractRole(token);
        if (requiresAdmin(path, request.getMethod()) && !"ADMIN".equals(role)) {
            writeForbidden(response);
            return;
        }

        filterChain.doFilter(new XUserEmailRequestWrapper(request, email, role), response);
    }

    private boolean requiresAdmin(String path, String method) {
        if (!isWrite(method)) {
            return false;
        }
        return PATH_MATCHER.match("/api/v1/products/**", path)
                || PATH_MATCHER.match("/api/v1/categories/**", path)
                || PATH_MATCHER.match("/api/v1/inventory/**", path)
                || PATH_MATCHER.match("/api/v1/uploads/**", path);
    }

    private boolean isWrite(String method) {
        return "POST".equals(method) || "PUT".equals(method)
                || "DELETE".equals(method) || "PATCH".equals(method);
    }

    private boolean isPublic(String path, String method) {
        if ("OPTIONS".equals(method)) {
            return true;
        }
        if ("POST".equals(method)) {
            if (PATH_MATCHER.match("/api/v1/auth/**", path)) {
                return true;
            }
            return PATH_MATCHER.match("/api/v1/users", path);
        }
        if ("GET".equals(method)) {
            return PATH_MATCHER.match("/api/v1/products/**", path)
                    || PATH_MATCHER.match("/api/v1/reviews/**", path);
        }
        return false;
    }

    private String resolveToken(HttpServletRequest request) {
        String header = request.getHeader("Authorization");
        if (header == null || !header.startsWith(BEARER_PREFIX)) {
            return null;
        }
        return header.substring(BEARER_PREFIX.length()).trim();
    }

    private void writeUnauthorized(HttpServletResponse response, String message) throws IOException {
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        objectMapper.writeValue(response.getWriter(),
                Map.of("status", 401, "message", message, "timestamp", LocalDateTime.now().toString()));
    }

    private void writeForbidden(HttpServletResponse response) throws IOException {
        response.setStatus(HttpServletResponse.SC_FORBIDDEN);
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        objectMapper.writeValue(response.getWriter(),
                Map.of("status", 403, "message", "Insufficient privileges: ADMIN role required",
                        "timestamp", LocalDateTime.now().toString()));
    }
}
