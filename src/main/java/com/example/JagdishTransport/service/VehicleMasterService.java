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
    
    public boolean existsByVehicleNumber(String vehicleNumber) {
        if (vehicleNumber == null || vehicleNumber.trim().isEmpty()) {
            return false;
        }
        
        // Normalize the input (trim and uppercase)
        String normalizedInput = vehicleNumber.trim().toUpperCase();
        
        // Manual check to ensure accuracy
        List<VehicleMaster> allVehicles = vehicleMasterRepository.findAll();
        for (VehicleMaster vehicle : allVehicles) {
            if (vehicle.getVehicleNumber() != null) {
                String dbNormalized = vehicle.getVehicleNumber().trim().toUpperCase();
                if (normalizedInput.equals(dbNormalized)) {
                    return true;
                }
            }
        }
        
        return false;
    }
    
    public boolean existsByVehicleNumberForUpdate(String vehicleNumber, Long id) {
        if (vehicleNumber == null || vehicleNumber.trim().isEmpty()) {
            return false;
        }
        
        String normalizedInput = vehicleNumber.trim().toUpperCase();
        
        // Manual check for update (excluding current vehicle)
        List<VehicleMaster> allVehicles = vehicleMasterRepository.findAll();
        for (VehicleMaster vehicle : allVehicles) {
            if (!vehicle.getId().equals(id) && vehicle.getVehicleNumber() != null) {
                String dbNormalized = vehicle.getVehicleNumber().trim().toUpperCase();
                if (normalizedInput.equals(dbNormalized)) {
                    return true;
                }
            }
        }
        
        return false;
    }
    
    public VehicleMaster addVehicle(VehicleMaster vehicle) {
        // Normalize the vehicle number before saving
        if (vehicle.getVehicleNumber() != null) {
            String normalizedNumber = vehicle.getVehicleNumber().trim().toUpperCase();
            vehicle.setVehicleNumber(normalizedNumber);
        }
        return vehicleMasterRepository.save(vehicle);
    }
    
    public VehicleMaster updateVehicle(Long id, VehicleMaster vehicle) {
        // Check if vehicle exists
        if (!vehicleMasterRepository.existsById(id)) {
            throw new RuntimeException("Vehicle not found with id: " + id);
        }
        
        // Set ID to ensure we're updating the right record
        vehicle.setId(id);
        
        // Normalize the vehicle number before saving
        if (vehicle.getVehicleNumber() != null) {
            String normalizedNumber = vehicle.getVehicleNumber().trim().toUpperCase();
            vehicle.setVehicleNumber(normalizedNumber);
        }
        
        return vehicleMasterRepository.save(vehicle);
    }
    
    public void deleteVehicle(Long id) {
        // Check if vehicle exists
        if (!vehicleMasterRepository.existsById(id)) {
            throw new RuntimeException("Vehicle not found with id: " + id);
        }
        
        vehicleMasterRepository.deleteById(id);
    }
    
    public void deleteMultipleVehicles(List<Long> vehicleIds) {
        if (vehicleIds == null || vehicleIds.isEmpty()) {
            return;
        }
        
        // Check if all vehicles exist before deleting any
        for (Long id : vehicleIds) {
            if (!vehicleMasterRepository.existsById(id)) {
                throw new RuntimeException("Vehicle not found with id: " + id);
            }
        }
        
        // Delete all vehicles
        vehicleMasterRepository.deleteAllById(vehicleIds);
    }
    
    public List<VehicleMaster> searchVehicles(String query) {
        if (query == null || query.trim().isEmpty()) {
            return getAllVehicles();
        }
        
        // No need to add % characters, the repository method already does a "containing" search
        return vehicleMasterRepository.findByVehicleNumberContainingIgnoreCase(query.trim());
    }
}