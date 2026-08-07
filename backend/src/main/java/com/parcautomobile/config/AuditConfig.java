package com.parcautomobile.config;

import java.util.Optional;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.domain.AuditorAware;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;

@Configuration
public class AuditConfig {

    @Bean
    AuditorAware<String> auditorProvider() {
        return () -> Optional.ofNullable(SecurityContextHolder.getContext().getAuthentication())
                .filter(Authentication::isAuthenticated)
                .map(authentication -> authentication instanceof JwtAuthenticationToken jwt
                        ? Optional.ofNullable(jwt.getToken().getClaimAsString("preferred_username"))
                                .orElse(jwt.getName())
                        : authentication.getName())
                .or(() -> Optional.of("system"));
    }
}
