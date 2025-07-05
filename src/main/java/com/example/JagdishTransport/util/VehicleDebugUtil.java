package com.example.JagdishTransport.util;

import java.util.List;
import java.util.Map;
import java.util.HashMap;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import com.example.JagdishTransport.model.VehicleMaster;
import com.example.JagdishTransport.service.VehicleMasterService;

@Component
public class VehicleDebugUtil {
    
    @Autowired
    private VehicleMasterService vehicleMasterService;
    
    public Map<String, Object> diagnoseVehicleIssue(String vehicleNumber) {
        Map<String, Object> diagnosis = new HashMap<>();
        
        if (vehicleNumber == null || vehicleNumber.trim().isEmpty()) {
            diagnosis.put("error", "Vehicle number is null or empty");
            return diagnosis;
        }
        
        String original = vehicleNumber;
        String trimmed = vehicleNumber.trim();
        String upper = vehicleNumber.toUpperCase();
        String normalized = vehicleNumber.trim().toUpperCase();
        
        diagnosis.put("input", original);
        diagnosis.put("inputTrimmed", trimmed);
        diagnosis.put("inputUpper", upper);
        diagnosis.put("inputNormalized", normalized);
        
        // Check existence with various forms
        diagnosis.put("existsOriginal", vehicleMasterService.existsByVehicleNumber(original));
        diagnosis.put("existsTrimmed", vehicleMasterService.existsByVehicleNumber(trimmed));
        diagnosis.put("existsUpper", vehicleMasterService.existsByVehicleNumber(upper));
        diagnosis.put("existsNormalized", vehicleMasterService.existsByVehicleNumber(normalized));
        
        // Get all vehicles for comparison
        List<VehicleMaster> allVehicles = vehicleMasterService.getAllVehicles();
        diagnosis.put("totalVehiclesInDB", allVehicles.size());
        
        // Check for exact matches
        Map<String, Object> matches = new HashMap<>();
        for (VehicleMaster vehicle : allVehicles) {
            String dbNumber = vehicle.getVehicleNumber();
            String dbNormalized = dbNumber.trim().toUpperCase();
            
            Map<String, Object> vehicleInfo = new HashMap<>();
            vehicleInfo.put("id", vehicle.getId());
            vehicleInfo.put("number", dbNumber);
            vehicleInfo.put("normalized", dbNormalized);
            vehicleInfo.put("matchesOriginal", dbNumber.equals(original));
            vehicleInfo.put("matchesTrimmed", dbNumber.equals(trimmed));
            vehicleInfo.put("matchesUpper", dbNumber.equals(upper));
            vehicleInfo.put("matchesNormalized", dbNormalized.equals(normalized));
            vehicleInfo.put("matchesIgnoreCase", dbNumber.equalsIgnoreCase(original));
            
            matches.put("vehicle_" + vehicle.getId(), vehicleInfo);
        }
        diagnosis.put("vehicleMatches", matches);
        
        return diagnosis;
    }
    
    public Map<String, Object> getVehicleStatistics() {
        Map<String, Object> stats = new HashMap<>();
        
        List<VehicleMaster> allVehicles = vehicleMasterService.getAllVehicles();
        stats.put("totalVehicles", allVehicles.size());
        
        // Group by normalized number to find duplicates
        Map<String, Integer> normalizedCounts = new HashMap<>();
        Map<String, java.util.List<Long>> duplicateIds = new HashMap<>();
        
        for (VehicleMaster vehicle : allVehicles) {
            String normalized = vehicle.getVehicleNumber().trim().toUpperCase();
            normalizedCounts.put(normalized, normalizedCounts.getOrDefault(normalized, 0) + 1);
            
            duplicateIds.computeIfAbsent(normalized, k -> new java.util.ArrayList<>()).add(vehicle.getId());
        }
        
        // Find duplicates
        Map<String, Object> duplicates = new HashMap<>();
        int totalDuplicates = 0;
        for (Map.Entry<String, Integer> entry : normalizedCounts.entrySet()) {
            if (entry.getValue() > 1) {
                duplicates.put(entry.getKey(), Map.of(
                    "count", entry.getValue(),
                    "ids", duplicateIds.get(entry.getKey())
                ));
                totalDuplicates += entry.getValue() - 1; // Don't count the original
            }
        }
        
        stats.put("duplicates", duplicates);
        stats.put("totalDuplicates", totalDuplicates);
        stats.put("uniqueNumbers", normalizedCounts.size());
        
        return stats;
    }
}