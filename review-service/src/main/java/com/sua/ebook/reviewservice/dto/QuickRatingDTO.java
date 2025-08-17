package com.sua.ebook.reviewservice.dto;

import jakarta.validation.constraints.*;

public class QuickRatingDTO {
    @Min(value = 1, message = "Rating must be between 1 and 5")
    @Max(value = 5, message = "Rating must be between 1 and 5")
    @NotNull(message = "Rating is required")
    private Integer rating;
    
    // Constructors
    public QuickRatingDTO() {}
    
    public QuickRatingDTO(Integer rating) {
        this.rating = rating;
    }
    
    // Getters and Setters
    public Integer getRating() {
        return rating;
    }
    
    public void setRating(Integer rating) {
        this.rating = rating;
    }
}
