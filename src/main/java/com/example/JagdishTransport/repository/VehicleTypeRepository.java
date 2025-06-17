package com.example.JagdishTransport.repository;

import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.JagdishTransport.model.VehicleType;

@Repository
public interface VehicleTypeRepository extends JpaRepository<VehicleType, Long> {
    
    boolean existsByVehicleTypeIgnoreCase(String vehicleType);
    
    boolean existsByVehicleTypeIgnoreCaseAndIdNot(String vehicleType, Long id);
    
    // Search method for vehicle types
    Page<VehicleType> findByVehicleTypeContainingIgnoreCase(String query, Pageable pageable);
    
    // Search method for vehicle types without pagination
    List<VehicleType> findByVehicleTypeContainingIgnoreCase(String query);
}