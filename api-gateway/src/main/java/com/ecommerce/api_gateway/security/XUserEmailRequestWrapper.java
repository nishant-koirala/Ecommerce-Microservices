package com.ecommerce.api_gateway.security;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletRequestWrapper;

import java.security.Principal;
import java.util.Collections;
import java.util.Enumeration;
import java.util.List;

public class XUserEmailRequestWrapper extends HttpServletRequestWrapper {

    private final String email;
    private final String role;

    public XUserEmailRequestWrapper(HttpServletRequest request, String email, String role) {
        super(request);
        this.email = email;
        this.role = role;
    }

    @Override
    public String getHeader(String name) {
        if (JwtAuthenticationFilter.X_USER_EMAIL_HEADER.equalsIgnoreCase(name)) {
            return email;
        }
        if (JwtAuthenticationFilter.X_USER_ROLE_HEADER.equalsIgnoreCase(name)) {
            return role;
        }
        return super.getHeader(name);
    }

    @Override
    public Enumeration<String> getHeaders(String name) {
        if (JwtAuthenticationFilter.X_USER_EMAIL_HEADER.equalsIgnoreCase(name)) {
            return Collections.enumeration(List.of(email));
        }
        if (JwtAuthenticationFilter.X_USER_ROLE_HEADER.equalsIgnoreCase(name)) {
            return role == null ? Collections.emptyEnumeration() : Collections.enumeration(List.of(role));
        }
        return super.getHeaders(name);
    }

    @Override
    public Enumeration<String> getHeaderNames() {
        List<String> names = Collections.list(super.getHeaderNames());
        if (names.stream().noneMatch(n -> n.equalsIgnoreCase(JwtAuthenticationFilter.X_USER_EMAIL_HEADER))) {
            names.add(JwtAuthenticationFilter.X_USER_EMAIL_HEADER);
        }
        if (role != null
                && names.stream().noneMatch(n -> n.equalsIgnoreCase(JwtAuthenticationFilter.X_USER_ROLE_HEADER))) {
            names.add(JwtAuthenticationFilter.X_USER_ROLE_HEADER);
        }
        return Collections.enumeration(names);
    }

    @Override
    public Principal getUserPrincipal() {
        return () -> email;
    }
}
