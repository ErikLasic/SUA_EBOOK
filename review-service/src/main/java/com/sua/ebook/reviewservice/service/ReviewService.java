package com.sua.ebook.reviewservice.service;

import com.sua.ebook.reviewservice.dto.QuickRatingDTO;
import com.sua.ebook.reviewservice.dto.ReviewCreateDTO;
import com.sua.ebook.reviewservice.dto.ReviewUpdateDTO;
import com.sua.ebook.reviewservice.exception.ReviewServiceException;
import com.sua.ebook.reviewservice.model.Review;
import com.sua.ebook.reviewservice.repository.ReviewRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class ReviewService {
    
    @Autowired
    private ReviewRepository reviewRepository;
    
    public List<Review> getAllReviews() {
        return reviewRepository.findAllByOrderByCreatedAtDesc();
    }
    
    public List<Review> getReviewsByBookId(String bookId) {
        return reviewRepository.findByBookIdOrderByCreatedAtDesc(bookId);
    }
    
    public List<Review> getReviewsByUserId(String userId) {
        return reviewRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }
    
    public Review createReview(ReviewCreateDTO reviewCreateDTO, String userId) {
        Optional<Review> existingReview = reviewRepository.findByBookIdAndUserId(
            reviewCreateDTO.getBookId(), userId);
        
        if (existingReview.isPresent()) {
            throw ReviewServiceException.conflict("User has already reviewed this book");
        }
        
        // Check if this is user's first review
        long userReviewCount = reviewRepository.countByUserId(userId);
        boolean isFirstReview = userReviewCount == 0;
        
        Review review = new Review();
        review.setBookId(reviewCreateDTO.getBookId());
        review.setUserId(userId);
        review.setRating(reviewCreateDTO.getRating());
        review.setReviewText(reviewCreateDTO.getReviewText());
        review.setCreatedAt(LocalDateTime.now());
        review.setUpdatedAt(LocalDateTime.now());
        
        Review savedReview = reviewRepository.save(review);
        
    // Notification sending disabled (notification-service removed)
        
        return savedReview;
    }
    
    public Review createQuickRating(String bookId, QuickRatingDTO quickRatingDTO, String userId) {
        Optional<Review> existingReview = reviewRepository.findByBookIdAndUserId(bookId, userId);
        
        if (existingReview.isPresent()) {
            throw ReviewServiceException.conflict("User has already reviewed this book");
        }
        
        Review review = new Review();
        review.setBookId(bookId);
        review.setUserId(userId);
        review.setRating(quickRatingDTO.getRating());
        review.setCreatedAt(LocalDateTime.now());
        review.setUpdatedAt(LocalDateTime.now());
        
        return reviewRepository.save(review);
    }
    
    public Review updateReview(String reviewId, ReviewUpdateDTO reviewUpdateDTO, String userId) {
        Review review = reviewRepository.findById(reviewId)
            .orElseThrow(() -> ReviewServiceException.notFound("Review not found"));
        
        if (!review.getUserId().equals(userId)) {
            throw ReviewServiceException.unauthorized("You can only update your own reviews");
        }
        
        if (reviewUpdateDTO.getRating() != null) {
            review.setRating(reviewUpdateDTO.getRating());
        }
        if (reviewUpdateDTO.getReviewText() != null) {
            review.setReviewText(reviewUpdateDTO.getReviewText());
        }
        review.setUpdatedAt(LocalDateTime.now());
        
        return reviewRepository.save(review);
    }
    
    public Review updateRating(String reviewId, QuickRatingDTO ratingDTO, String userId) {
        Review review = reviewRepository.findById(reviewId)
            .orElseThrow(() -> ReviewServiceException.notFound("Review not found"));
        
        if (!review.getUserId().equals(userId)) {
            throw ReviewServiceException.unauthorized("You can only update your own reviews");
        }
        
        review.setRating(ratingDTO.getRating());
        review.setUpdatedAt(LocalDateTime.now());
        
        return reviewRepository.save(review);
    }
    
    public void deleteReview(String reviewId, String userId, String userRole) {
        Review review = reviewRepository.findById(reviewId)
            .orElseThrow(() -> ReviewServiceException.notFound("Review not found"));
        
        if (!review.getUserId().equals(userId) && !"admin".equals(userRole)) {
            throw ReviewServiceException.unauthorized("You can only delete your own reviews");
        }
        
        reviewRepository.delete(review);
    }
    
    public void deleteAllReviewsForBook(String bookId, String userRole) {
        if (!"admin".equals(userRole)) {
            throw ReviewServiceException.unauthorized("Only admins can delete all reviews for a book");
        }
        
        reviewRepository.deleteByBookId(bookId);
    }
    
    public Map<String, Object> getBookReviewStats(String bookId) {
        List<Review> reviews = reviewRepository.findByBookIdOrderByCreatedAtDesc(bookId);
        
        if (reviews.isEmpty()) {
            Map<String, Object> stats = new HashMap<>();
            stats.put("totalReviews", 0);
            stats.put("averageRating", 0.0);
            return stats;
        }
        
        double averageRating = reviews.stream()
            .mapToInt(Review::getRating)
            .average()
            .orElse(0.0);
        
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalReviews", reviews.size());
        stats.put("averageRating", Math.round(averageRating * 100.0) / 100.0);
        
        return stats;
    }
    
    private void sendNotificationAsync(Review review, boolean isFirstReview) {
        // Run notification sending in separate thread to avoid blocking
        new Thread(() -> {
            try {
                String notificationUrl = "https://sua-dukens-projects-866eede9.vercel.app/api/review-created";
                
                // Create JSON payload
                String jsonPayload = String.format(
                    "{ \"userId\": \"%s\", \"bookId\": \"%s\", \"reviewId\": \"%s\", \"rating\": %d, \"isFirstReview\": %b }",
                    review.getUserId(), review.getBookId(), review.getId(), review.getRating(), isFirstReview
                );
                
                System.out.println("Sending notification to: " + notificationUrl);
                System.out.println("Payload: " + jsonPayload);
                
                // Send actual HTTP request
                try {
                    java.net.http.HttpClient client = java.net.http.HttpClient.newHttpClient();
                    java.net.http.HttpRequest request = java.net.http.HttpRequest.newBuilder()
                            .uri(java.net.URI.create(notificationUrl))
                            .header("Content-Type", "application/json")
                            .POST(java.net.http.HttpRequest.BodyPublishers.ofString(jsonPayload))
                            .timeout(java.time.Duration.ofSeconds(5))
                            .build();
                    
                    java.net.http.HttpResponse<String> response = client.send(request, 
                            java.net.http.HttpResponse.BodyHandlers.ofString());
                    
                    if (response.statusCode() >= 200 && response.statusCode() < 300) {
                        System.out.println("✅ Notification sent successfully: " + response.statusCode());
                    } else {
                        System.out.println("⚠️ Notification service returned: " + response.statusCode());
                    }
                } catch (Exception httpEx) {
                    System.err.println("❌ HTTP request failed: " + httpEx.getMessage());
                }
                
            } catch (Exception e) {
                System.err.println("❌ Failed to send notification: " + e.getMessage());
                // Don't fail the review creation if notification fails
            }
        }).start();
    }
}
