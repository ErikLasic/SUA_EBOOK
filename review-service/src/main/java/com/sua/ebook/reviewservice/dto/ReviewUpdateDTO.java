package com.sua.ebook.reviewservice.dto;

import jakarta.validation.constraints.*;

public class ReviewUpdateDTO {
    @Min(value = 1, message = "Rating must be between 1 and 5")
    @Max(value = 5, message = "Rating must be between 1 and 5")
    private Integer rating;
    
    @Size(max = 1000, message = "Review text cannot exceed 1000 characters")
    private String reviewText;
    
    // Constructors
    public ReviewUpdateDTO() {}
    
    public ReviewUpdateDTO(Integer rating, String reviewText) {
        this.rating = rating;
        this.reviewText = reviewText;
    }
    
    // Getters and Setters
    public Integer getRating() {
        return rating;
    }
    
    public void setRating(Integer rating) {
        this.rating = rating;
    }
    
    public String getReviewText() {
        return reviewText;
    }
    
    public void setReviewText(String reviewText) {
        this.reviewText = reviewText;
    }
}
