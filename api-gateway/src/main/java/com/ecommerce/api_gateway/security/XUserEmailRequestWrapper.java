package com.ecommerce.api_gateway.security;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletRequestWrapper;

import java.security.Principal;
import java.util.Collections;
import java.util.Enumeration;
import java.util.List;

public class XUserEmailRequestWrapper extends HttpServletRequestWrapper {

    private final String email;

    public XUserEmailRequestWrapper(HttpServletRequest request, String email) {
        super(request);
        this.email = email;
    }

    @Override
    public String getHeader(String name) {
        return JwtAuthenticationFilter.X_USER_EMAIL_HEADER.equalsIgnoreCase(name)
                ? email
                : super.getHeader(name);
    }

    @Override
    public Enumeration<String> getHeaders(String name) {
        if (JwtAuthenticationFilter.X_USER_EMAIL_HEADER.equalsIgnoreCase(name)) {
            return Collections.enumeration(List.of(email));
        }
        return super.getHeaders(name);
    }

    @Override
    public Enumeration<String> getHeaderNames() {
        List<String> names = Collections.list(super.getHeaderNames());
        if (names.stream().noneMatch(n -> n.equalsIgnoreCase(JwtAuthenticationFilter.X_USER_EMAIL_HEADER))) {
            names.add(JwtAuthenticationFilter.X_USER_EMAIL_HEADER);
        }
        return Collections.enumeration(names);
    }

    @Override
    public Principal getUserPrincipal() {
        return () -> email;
    }
}
