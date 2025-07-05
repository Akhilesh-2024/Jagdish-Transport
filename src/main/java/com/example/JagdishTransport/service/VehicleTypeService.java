package com.example.JagdishTransport.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.JagdishTransport.model.VehicleType;
import com.example.JagdishTransport.repository.VehicleTypeRepository;

@Service
public class VehicleTypeService {
    
    private final VehicleTypeRepository vehicleTypeRepository;
    
    @Autowired
    public VehicleTypeService(VehicleTypeRepository vehicleTypeRepository) {
        this.vehicleTypeRepository = vehicleTypeRepository;
    }
    
    public List<VehicleType> getAllVehicleTypes() {
        return vehicleTypeRepository.findAll();
    }
    
    public VehicleType getVehicleTypeById(Long id) {
        return vehicleTypeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Vehicle type not found with id: " + id));
    }
    
    public VehicleType addVehicleType(VehicleType vehicleType) {
        if (vehicleTypeRepository.existsByVehicleTypeIgnoreCase(vehicleType.getVehicleType())) {
            throw new RuntimeException("Vehicle type already exists");
        }
        return vehicleTypeRepository.save(vehicleType);
    }
    
    public VehicleType updateVehicleType(Long id, VehicleType vehicleType) {
        // Check if vehicle type exists
        VehicleType existingVehicleType = getVehicleTypeById(id);
        
        // Check if name conflicts with another existing type
        if (vehicleTypeRepository.existsByVehicleTypeIgnoreCaseAndIdNot(
                vehicleType.getVehicleType(), id)) {
            throw new RuntimeException("Vehicle type already exists");
        }
        
        // Update the vehicle type
        existingVehicleType.setVehicleType(vehicleType.getVehicleType());
        return vehicleTypeRepository.save(existingVehicleType);
    }
    
    public void deleteVehicleType(Long id) {
        // Check if vehicle type exists
        if (!vehicleTypeRepository.existsById(id)) {
            throw new RuntimeException("Vehicle type not found with id: " + id);
        }
        vehicleTypeRepository.deleteById(id);
    }
    
    public void deleteMultipleVehicleTypes(List<Long> vehicleTypeIds) {
        if (vehicleTypeIds == null || vehicleTypeIds.isEmpty()) {
            return;
        }
        
        // Check if all vehicle types exist before deleting any
        for (Long id : vehicleTypeIds) {
            if (!vehicleTypeRepository.existsById(id)) {
                throw new RuntimeException("Vehicle type not found with id: " + id);
            }
        }
        
        // Delete all vehicle types
        vehicleTypeRepository.deleteAllById(vehicleTypeIds);
    }
    
    public List<VehicleType> searchVehicleTypes(String query) {
        if (query == null || query.trim().isEmpty()) {
            return getAllVehicleTypes();
        }
        
        return vehicleTypeRepository.findByVehicleTypeContainingIgnoreCase(query.trim());
    }
}