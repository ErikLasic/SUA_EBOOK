package com.sua.ebook.reviewservice.exception;

import org.springframework.http.HttpStatus;

public class ReviewServiceException extends RuntimeException {
    private final HttpStatus status;
    
    public ReviewServiceException(String message, HttpStatus status) {
        super(message);
        this.status = status;
    }
    
    public HttpStatus getStatus() {
        return status;
    }
    
    // Static factory methods
    public static ReviewServiceException notFound(String message) {
        return new ReviewServiceException(message, HttpStatus.NOT_FOUND);
    }
    
    public static ReviewServiceException unauthorized(String message) {
        return new ReviewServiceException(message, HttpStatus.UNAUTHORIZED);
    }
    
    public static ReviewServiceException conflict(String message) {
        return new ReviewServiceException(message, HttpStatus.CONFLICT);
    }
}
