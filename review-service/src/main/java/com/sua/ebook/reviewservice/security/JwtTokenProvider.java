package com.sua.ebook.reviewservice.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;

@Component
public class JwtTokenProvider {
    
    @Value("${jwt.secret}")
    private String jwtSecret;
    
    private SecretKey getSigningKey() {
        byte[] keyBytes = jwtSecret.getBytes(StandardCharsets.UTF_8);
        return Keys.hmacShaKeyFor(keyBytes);
    }
    
    public Claims validateToken(String token) {
        try {
            System.out.println("=== JWT Validation Debug ===");
            System.out.println("Full token: " + token);
            System.out.println("JWT Secret length: " + jwtSecret.length());
            System.out.println("JWT Secret: " + jwtSecret);
            System.out.println("First 10 chars of secret: " + jwtSecret.substring(0, Math.min(10, jwtSecret.length())));
            
            Claims claims = Jwts.parserBuilder()
                    .setSigningKey(getSigningKey())
                    .build()
                    .parseClaimsJws(token)
                    .getBody();
                    
            System.out.println("JWT validation SUCCESS!");
            System.out.println("Subject: " + claims.getSubject());
            System.out.println("Email: " + claims.get("email"));
            System.out.println("Role: " + claims.get("role"));
            System.out.println("Issued at: " + claims.getIssuedAt());
            System.out.println("Expires at: " + claims.getExpiration());
            return claims;
            
        } catch (Exception e) {
            System.err.println("=== JWT Validation FAILED ===");
            System.err.println("JWT validation error: " + e.getMessage());
            System.err.println("Exception class: " + e.getClass().getSimpleName());
            e.printStackTrace();
            throw new RuntimeException("Invalid JWT token", e);
        }
    }
    
    public String getUserIdFromToken(String token) {
        Claims claims = validateToken(token);
        return claims.getSubject();
    }
    
    public String getRoleFromToken(String token) {
        Claims claims = validateToken(token);
        return claims.get("role", String.class);
    }
    
    public String getEmailFromToken(String token) {
        Claims claims = validateToken(token);
        return claims.get("email", String.class);
    }
}
