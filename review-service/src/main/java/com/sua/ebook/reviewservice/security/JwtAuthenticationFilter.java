package com.sua.ebook.reviewservice.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.ArrayList;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    
    private static final Logger logger = LoggerFactory.getLogger(JwtAuthenticationFilter.class);
    
    @Autowired
    private JwtTokenProvider jwtTokenProvider;
    
    @Override
    protected void doFilterInternal(HttpServletRequest request, 
                                    HttpServletResponse response, 
                                    FilterChain filterChain) throws ServletException, IOException {
        
        String header = request.getHeader("Authorization");
        String token = null;
        
        logger.debug("Processing request: {} {}", request.getMethod(), request.getRequestURI());
        logger.debug("Authorization header: {}", header != null ? "present" : "missing");
        
        if (header != null && header.startsWith("Bearer ")) {
            token = header.substring(7);
            logger.debug("Extracted token: {}...", token.substring(0, Math.min(20, token.length())));
            
            try {
                String userId = jwtTokenProvider.getUserIdFromToken(token);
                String role = jwtTokenProvider.getRoleFromToken(token);
                String email = jwtTokenProvider.getEmailFromToken(token);
                
                if (userId != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                    // Ustvari authentication objekt
                    UsernamePasswordAuthenticationToken authToken = 
                        new UsernamePasswordAuthenticationToken(userId, null, new ArrayList<>());
                    
                    // Dodaj dodatne podatke v authentication
                    authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    
                    // Shrani dodatne podatke v request atribute
                    request.setAttribute("userId", userId);
                    request.setAttribute("userRole", role);
                    request.setAttribute("userEmail", email);
                    
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                }
            } catch (Exception e) {
                // Če token ni veljaven, ne nastavi authentication
                logger.error("JWT token validation failed: " + e.getMessage());
            }
        }
        
        filterChain.doFilter(request, response);
    }
    
    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) throws ServletException {
        String path = request.getRequestURI();
        String method = request.getMethod();
        
        logger.debug("shouldNotFilter check: {} {}", method, path);
        
        // Izključi health check in dokumentacijo iz avtentikacije
        if (path.startsWith("/actuator") || 
            path.startsWith("/v3/api-docs") || 
            path.startsWith("/swagger-ui") ||
            path.equals("/health")) {
            logger.debug("Skipping filter for health/docs endpoint: {}", path);
            return true;
        }
        
        // Izključi GET zahteve za branje reviews iz avtentikacije
        if ("GET".equals(method) && 
            (path.equals("/reviews") || path.startsWith("/reviews/book/"))) {
            logger.debug("Skipping filter for public GET endpoint: {}", path);
            return true;
        }
        
        logger.debug("Filter will run for: {} {}", method, path);
        return false;
    }
}
