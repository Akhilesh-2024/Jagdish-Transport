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
    
    // Search method for vehicles
    Page<VehicleMaster> findByVehicleNumberContainingIgnoreCase(String query, Pageable pageable);
    
    // Search method for vehicles without pagination
    List<VehicleMaster> findByVehicleNumberContainingIgnoreCase(String query);
}