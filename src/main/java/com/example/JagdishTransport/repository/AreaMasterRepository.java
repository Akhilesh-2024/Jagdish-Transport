package com.example.JagdishTransport.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.example.JagdishTransport.model.AreaMaster;
import java.util.List;

@Repository
public interface AreaMasterRepository extends JpaRepository<AreaMaster, Long>{
    
    // Find area rates by vehicle type and area name using custom query
    @Query("SELECT a FROM AreaMaster a WHERE a.vehicleType = :vehicleType AND a.areaName = :areaName")
    List<AreaMaster> findByVehicleTypeAndAreaName(@Param("vehicleType") String vehicleType, @Param("areaName") String areaName);
    
    // Find area rates by vehicle type and area name using method name
    List<AreaMaster> findByVehicleTypeAndAreaNameIgnoreCase(String vehicleType, String areaName);
    
    // Search method for areas
    Page<AreaMaster> findByAreaNameContainingIgnoreCase(String query, Pageable pageable);
    
    // Search method for areas without pagination
    List<AreaMaster> findByAreaNameContainingIgnoreCase(String query);
}
