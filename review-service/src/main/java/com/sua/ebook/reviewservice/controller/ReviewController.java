package com.sua.ebook.reviewservice.controller;

import com.sua.ebook.reviewservice.dto.*;
import com.sua.ebook.reviewservice.model.Review;
import com.sua.ebook.reviewservice.service.ReviewService;
import com.sua.ebook.reviewservice.exception.ReviewServiceException;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/reviews")
@Tag(name = "Reviews", description = "Review and Rating Management API")
public class ReviewController {
    
    @Autowired
    private ReviewService reviewService;
    
    @GetMapping("/book/{bookId}")
    @Operation(summary = "Get all reviews for a book")
    public ResponseEntity<List<Review>> getBookReviews(@PathVariable String bookId) {
        List<Review> reviews = reviewService.getReviewsByBookId(bookId);
        return ResponseEntity.ok(reviews);
    }
    
    @GetMapping("/user/{userId}")
    @Operation(summary = "Get all reviews by user")
    public ResponseEntity<List<Review>> getUserReviews(@PathVariable String userId) {
        List<Review> reviews = reviewService.getReviewsByUserId(userId);
        return ResponseEntity.ok(reviews);
    }
    
    @PostMapping
    @Operation(summary = "Create a new review")
    public ResponseEntity<?> createReview(
            @Valid @RequestBody ReviewCreateDTO reviewCreateDTO,
            HttpServletRequest request) {
        
        System.out.println("=== CREATE REVIEW ENDPOINT HIT ===");
        System.out.println("Request body: " + reviewCreateDTO);
        
        // Preveri, če je user avtenticiran preko JWT
        String userId = (String) request.getAttribute("userId");
        System.out.println("User ID from JWT: " + userId);
        
        if (userId == null || userId.trim().isEmpty()) {
            // Vrni jasno sporočilo, če JWT ni veljaven
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Authentication required");
            errorResponse.put("message", "You must be logged in to create a review. Please provide a valid JWT token.");
            errorResponse.put("timestamp", java.time.LocalDateTime.now());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(errorResponse);
        }
        
        try {
            Review review = reviewService.createReview(reviewCreateDTO, userId);
            System.out.println("Review created successfully: " + review.getId());
            return new ResponseEntity<>(review, HttpStatus.CREATED);
        } catch (ReviewServiceException ex) {
            // Za duplicate review ali druge business logic errore
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", ex.getStatus().getReasonPhrase());
            errorResponse.put("message", ex.getMessage());
            errorResponse.put("timestamp", java.time.LocalDateTime.now());
            return ResponseEntity.status(ex.getStatus()).body(errorResponse);
        }
    }
    
    @PostMapping("/book/{bookId}/quick")
    @Operation(summary = "Quick rating for a book")
    public ResponseEntity<Review> createQuickRating(
            @PathVariable String bookId,
            @Valid @RequestBody QuickRatingDTO quickRatingDTO,
            HttpServletRequest request) {
        
        String userId = (String) request.getAttribute("userId");
        Review review = reviewService.createQuickRating(bookId, quickRatingDTO, userId);
        return new ResponseEntity<>(review, HttpStatus.CREATED);
    }
    
    @PutMapping("/{reviewId}")
    @Operation(summary = "Update a review")
    public ResponseEntity<Review> updateReview(
            @PathVariable String reviewId,
            @Valid @RequestBody ReviewUpdateDTO reviewUpdateDTO,
            HttpServletRequest request) {
        
        String userId = (String) request.getAttribute("userId");
        Review updatedReview = reviewService.updateReview(reviewId, reviewUpdateDTO, userId);
        return ResponseEntity.ok(updatedReview);
    }
    
    @PutMapping("/{reviewId}/rating")
    @Operation(summary = "Update only rating")
    public ResponseEntity<Review> updateRating(
            @PathVariable String reviewId,
            @Valid @RequestBody QuickRatingDTO ratingDTO,
            HttpServletRequest request) {
        
        String userId = (String) request.getAttribute("userId");
        Review updatedReview = reviewService.updateRating(reviewId, ratingDTO, userId);
        return ResponseEntity.ok(updatedReview);
    }
    
    @DeleteMapping("/{reviewId}")
    @Operation(summary = "Delete a review")
    public ResponseEntity<Void> deleteReview(
            @PathVariable String reviewId,
            HttpServletRequest request) {
        
        String userId = (String) request.getAttribute("userId");
        String userRole = (String) request.getAttribute("userRole");
        reviewService.deleteReview(reviewId, userId, userRole);
        return ResponseEntity.noContent().build();
    }
    
    @DeleteMapping("/book/{bookId}")
    @Operation(summary = "Delete all reviews for a book")
    public ResponseEntity<Void> deleteAllBookReviews(
            @PathVariable String bookId,
            HttpServletRequest request) {
        
        String userRole = (String) request.getAttribute("userRole");
        reviewService.deleteAllReviewsForBook(bookId, userRole);
        return ResponseEntity.noContent().build();
    }
    
    @GetMapping("/book/{bookId}/stats")
    @Operation(summary = "Get review statistics for a book")
    public ResponseEntity<Map<String, Object>> getBookReviewStats(@PathVariable String bookId) {
        Map<String, Object> stats = reviewService.getBookReviewStats(bookId);
        return ResponseEntity.ok(stats);
    }
}
