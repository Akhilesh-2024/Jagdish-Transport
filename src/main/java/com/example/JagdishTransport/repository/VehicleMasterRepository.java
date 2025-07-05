package com.example.JagdishTransport.repository;

import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.JagdishTransport.model.VehicleMaster;

@Repository
public interface VehicleMasterRepository extends JpaRepository<VehicleMaster, Long> {
    // Spring Data JPA will implement basic CRUD operations
    
    // Custom method to check if a vehicle number already exists
    boolean existsByVehicleNumberIgnoreCase(String vehicleNumber);
    
    // Additional method for exact match (for debugging)
    boolean existsByVehicleNumber(String vehicleNumber);
    
    // Custom method to check if a vehicle number exists for a different vehicle (excluding current ID)
    boolean existsByVehicleNumberIgnoreCaseAndIdNot(String vehicleNumber, Long id);
    
    // Search method for vehicles
    Page<VehicleMaster> findByVehicleNumberContainingIgnoreCase(String query, Pageable pageable);
    
    // Search method for vehicles without pagination
    List<VehicleMaster> findByVehicleNumberContainingIgnoreCase(String query);
}