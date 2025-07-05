package com.example.JagdishTransport.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.JagdishTransport.model.AreaMaster;
import com.example.JagdishTransport.repository.AreaMasterRepository;

@Service
public class AreaMasterService {
	@Autowired
	private AreaMasterRepository areaMasterRepository;

   
    public List<AreaMaster> getAllAreas() {
        return areaMasterRepository.findAll();
    }

    public AreaMaster saveArea(AreaMaster areaMaster) {
        return areaMasterRepository.save(areaMaster);
    }
    
    public AreaMaster addArea(AreaMaster areaMaster) {
        return areaMasterRepository.save(areaMaster);
    }
    
    public AreaMaster getAreaById(Long id) {
        return areaMasterRepository.findById(id).orElse(null);
    }
    
    // Get area rates by vehicle type and area name
    public List<AreaMaster> getAreaRatesByVehicleTypeAndAreaName(String vehicleType, String areaName) {
        System.out.println("Searching for area rates with vehicleType: " + vehicleType + ", areaName: " + areaName);
        
        // First, let's try to find all areas to see if they exist
        List<AreaMaster> allAreas = areaMasterRepository.findAll();
        System.out.println("Total areas in database: " + allAreas.size());
        
        // Print all areas for debugging
        for (AreaMaster area : allAreas) {
            System.out.println("Area: " + area.getAreaName() + ", Vehicle Type: " + area.getVehicleType());
        }
        
        try {
            // Try the method name based query which is more reliable
            List<AreaMaster> result = areaMasterRepository.findByVehicleTypeAndAreaNameIgnoreCase(vehicleType, areaName);
            System.out.println("Found " + result.size() + " matching areas using method name query");
            return result;
        } catch (Exception e) {
            System.err.println("Error using method name query: " + e.getMessage());
            e.printStackTrace();
            
            // Fallback to manual filtering
            System.out.println("Falling back to manual filtering");
            return allAreas.stream()
                .filter(area -> area.getVehicleType().equalsIgnoreCase(vehicleType) && 
                               area.getAreaName().equalsIgnoreCase(areaName))
                .toList();
        }
    }
    
    public AreaMaster updateArea(Long id, AreaMaster updatedArea) {
        AreaMaster existingArea = areaMasterRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Area not found"));

        existingArea.setAreaName(updatedArea.getAreaName());
        existingArea.setFromLocation(updatedArea.getFromLocation());
        existingArea.setToLocation(updatedArea.getToLocation());
        existingArea.setVehicleType(updatedArea.getVehicleType());
        existingArea.setPartyName(updatedArea.getPartyName());
        existingArea.setCompanyRate(updatedArea.getCompanyRate());
        existingArea.setLorryRate(updatedArea.getLorryRate());
        existingArea.setAreaDate(updatedArea.getAreaDate());

        return areaMasterRepository.save(existingArea);
    }
    
    public void deleteArea(Long id) {
        areaMasterRepository.deleteById(id);
    }
    
    public void deleteMultipleAreas(List<Long> areaIds) {
        if (areaIds == null || areaIds.isEmpty()) {
            return;
        }
        
        // Check if all areas exist before deleting any
        for (Long id : areaIds) {
            if (!areaMasterRepository.existsById(id)) {
                throw new RuntimeException("Area not found with id: " + id);
            }
        }
        
        // Delete all areas
        areaMasterRepository.deleteAllById(areaIds);
    }
    
    public List<AreaMaster> searchAreas(String query) {
        if (query == null || query.trim().isEmpty()) {
            return getAllAreas();
        }
        
        return areaMasterRepository.findByAreaNameContainingIgnoreCase(query.trim());
    }
}
