package com.ecommerce.api_gateway.config;

import org.springframework.cloud.gateway.server.mvc.filter.BeforeFilterFunctions;
import org.springframework.cloud.gateway.server.mvc.handler.GatewayRouterFunctions;
import org.springframework.cloud.gateway.server.mvc.handler.HandlerFunctions;
import org.springframework.cloud.gateway.server.mvc.predicate.GatewayRequestPredicates;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.function.RequestPredicate;
import org.springframework.web.servlet.function.RouterFunction;
import org.springframework.web.servlet.function.ServerResponse;

@Configuration
public class GatewayConfig {

    @Bean
    public RouterFunction<ServerResponse> gatewayRoutes() {
        return GatewayRouterFunctions.route("api-gateway")
                .add(serviceRoute("user_route", "http://localhost:8081",
                        GatewayRequestPredicates.path("/api/v1/users/**", "/api/v1/auth/**")))
                .add(serviceRoute("product_route", "http://localhost:8082",
                        GatewayRequestPredicates.path("/api/v1/products/**", "/api/v1/categories/**")))
                .add(serviceRoute("inventory_route", "http://localhost:8083",
                        GatewayRequestPredicates.path("/api/v1/inventory/**")))
                .add(serviceRoute("cart_route", "http://localhost:8084",
                        GatewayRequestPredicates.path("/api/v1/cart/**")))
                .add(serviceRoute("order_route", "http://localhost:8085",
                        GatewayRequestPredicates.path("/api/v1/orders/**")))
                .add(serviceRoute("payment_route", "http://localhost:8086",
                        GatewayRequestPredicates.path("/api/v1/payments/**")))
                .add(serviceRoute("notification_route", "http://localhost:8087",
                        GatewayRequestPredicates.path("/api/v1/notifications/**")))
                .build();
    }

    private RouterFunction<ServerResponse> serviceRoute(String routeId, String targetUri, RequestPredicate predicate) {
        return GatewayRouterFunctions.route(routeId)
                .route(predicate, HandlerFunctions.http())
                .before(BeforeFilterFunctions.uri(targetUri))
                .build();
    }
}
