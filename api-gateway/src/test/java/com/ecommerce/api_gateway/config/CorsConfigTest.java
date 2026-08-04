package com.ecommerce.api_gateway.config;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.mock.web.MockFilterChain;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.web.filter.CorsFilter;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;

class CorsConfigTest {

    private CorsFilter corsFilter;

    @BeforeEach
    void setUp() {
        CorsProperties properties = new CorsProperties();
        properties.setAllowedOrigins(List.of("http://localhost:4200", "http://127.0.0.1:4200"));
        FilterRegistrationBean<CorsFilter> bean = new CorsConfig().corsFilter(properties);
        corsFilter = bean.getFilter();
    }

    @Test
    void preflightFromAllowedOriginReturns200AndShortCircuits() throws Exception {
        MockHttpServletRequest request = new MockHttpServletRequest("OPTIONS", "/api/v1/orders");
        request.addHeader("Origin", "http://localhost:4200");
        request.addHeader("Access-Control-Request-Method", "POST");
        MockHttpServletResponse response = new MockHttpServletResponse();
        MockFilterChain chain = new MockFilterChain();

        corsFilter.doFilter(request, response, chain);

        assertEquals(200, response.getStatus());
        assertEquals("http://localhost:4200", response.getHeader("Access-Control-Allow-Origin"));
        assertNull(chain.getRequest());
    }

    @Test
    void actualGetFromAllowedOriginPassesThroughWithCorsHeader() throws Exception {
        MockHttpServletRequest request = new MockHttpServletRequest("GET", "/api/v1/products");
        request.addHeader("Origin", "http://127.0.0.1:4200");
        MockHttpServletResponse response = new MockHttpServletResponse();
        MockFilterChain chain = new MockFilterChain();

        corsFilter.doFilter(request, response, chain);

        assertNotNull(chain.getRequest());
        assertEquals("http://127.0.0.1:4200", response.getHeader("Access-Control-Allow-Origin"));
    }

    @Test
    void preflightFromDisallowedOriginReturns403() throws Exception {
        MockHttpServletRequest request = new MockHttpServletRequest("OPTIONS", "/api/v1/products");
        request.addHeader("Origin", "http://evil.example");
        request.addHeader("Access-Control-Request-Method", "GET");
        MockHttpServletResponse response = new MockHttpServletResponse();
        MockFilterChain chain = new MockFilterChain();

        corsFilter.doFilter(request, response, chain);

        assertEquals(403, response.getStatus());
        assertNull(chain.getRequest());
    }

    @Test
    void nonCorsRequestPassesThroughUnchanged() throws Exception {
        MockHttpServletRequest request = new MockHttpServletRequest("GET", "/api/v1/products");
        MockHttpServletResponse response = new MockHttpServletResponse();
        MockFilterChain chain = new MockFilterChain();

        corsFilter.doFilter(request, response, chain);

        assertNotNull(chain.getRequest());
        assertNull(response.getHeader("Access-Control-Allow-Origin"));
    }
}
