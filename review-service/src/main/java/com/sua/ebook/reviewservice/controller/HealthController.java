package com.sua.ebook.reviewservice.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.Map;

@RestController
public class HealthController {
    
    @GetMapping("/health")
    public Map<String, Object> health() {
        return Map.of(
            "status", "ok",
            "service", "review-service",
            "timestamp", LocalDateTime.now(),
            "version", "1.0.0"
        );
    }
    
    @GetMapping("/")
    public Map<String, Object> root() {
        return Map.of(
            "message", "Review Service API",
            "documentation", "/swagger-ui.html",
            "health", "/health"
        );
    }
}
