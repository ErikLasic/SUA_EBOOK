package com.sua.ebook.reviewservice.repository;

import com.sua.ebook.reviewservice.model.Review;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ReviewRepository extends MongoRepository<Review, String> {
    
    List<Review> findAllByOrderByCreatedAtDesc();
    List<Review> findByBookIdOrderByCreatedAtDesc(String bookId);
    List<Review> findByUserIdOrderByCreatedAtDesc(String userId);
    Optional<Review> findByBookIdAndUserId(String bookId, String userId);
    void deleteByBookId(String bookId);
    long countByBookId(String bookId);
    long countByUserId(String userId);
}
