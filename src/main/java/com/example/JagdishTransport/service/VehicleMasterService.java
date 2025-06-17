package com.example.JagdishTransport.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.JagdishTransport.model.VehicleMaster;
import com.example.JagdishTransport.repository.VehicleMasterRepository;

@Service
public class VehicleMasterService {
    
    @Autowired
    private VehicleMasterRepository vehicleMasterRepository;
    
    public List<VehicleMaster> getAllVehicles() {
        return vehicleMasterRepository.findAll();
    }
    
    public VehicleMaster addVehicle(VehicleMaster vehicle) {
        // Convert to uppercase before saving
        vehicle.setVehicleNumber(vehicle.getVehicleNumber().toUpperCase());
        
        return vehicleMasterRepository.save(vehicle);
    }
    
    public VehicleMaster updateVehicle(Long id, VehicleMaster vehicle) {
        // Check if vehicle exists
        if (!vehicleMasterRepository.existsById(id)) {
            throw new RuntimeException("Vehicle not found with id: " + id);
        }
        
        // Set ID to ensure we're updating the right record
        vehicle.setId(id);
        
        // Convert to uppercase before saving
        vehicle.setVehicleNumber(vehicle.getVehicleNumber().toUpperCase());
        
        return vehicleMasterRepository.save(vehicle);
    }
    
    public void deleteVehicle(Long id) {
        // Check if vehicle exists
        if (!vehicleMasterRepository.existsById(id)) {
            throw new RuntimeException("Vehicle not found with id: " + id);
        }
        
        vehicleMasterRepository.deleteById(id);
    }
    
    public List<VehicleMaster> searchVehicles(String query) {
        if (query == null || query.trim().isEmpty()) {
            return getAllVehicles();
        }
        
        // No need to add % characters, the repository method already does a "containing" search
        return vehicleMasterRepository.findByVehicleNumberContainingIgnoreCase(query.trim());
    }
}