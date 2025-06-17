package com.example.JagdishTransport.repository;

import com.example.JagdishTransport.model.otherRate;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface OtherRateRepository extends JpaRepository<otherRate, Long> {
    // Find rates by type and category
    List<otherRate> findByTypeIgnoreCaseAndCategoryIgnoreCase(String type, String category);
    List<otherRate> findByTypeIgnoreCase(String type);
}
