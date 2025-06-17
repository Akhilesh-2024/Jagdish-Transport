package com.example.JagdishTransport.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.JagdishTransport.model.Location;

@Repository
public interface LocationRepository extends JpaRepository<Location, Long> {
    Optional<Location> findByLocationNameIgnoreCase(String locationName);
    
    // Search method for locations
    Page<Location> findByLocationNameContainingIgnoreCase(String query, Pageable pageable);
    
    // Search method for locations without pagination
    List<Location> findByLocationNameContainingIgnoreCase(String query);
}