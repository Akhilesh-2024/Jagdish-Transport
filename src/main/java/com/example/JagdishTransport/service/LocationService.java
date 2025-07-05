package com.example.JagdishTransport.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.JagdishTransport.model.Location;
import com.example.JagdishTransport.repository.LocationRepository;

@Service
public class LocationService {
    
    private final LocationRepository locationRepository;
    
    @Autowired
    public LocationService(LocationRepository locationRepository) {
        this.locationRepository = locationRepository;
    }
    
    public List<Location> getAllLocations() {
        return locationRepository.findAll();
    }
    
    public Location addLocation(Location location) {
        // Check if location already exists
        if (locationRepository.findByLocationNameIgnoreCase(location.getLocationName()).isPresent()) {
            throw new RuntimeException("Location already exists");
        }
        return locationRepository.save(location);
    }
    
    public Location updateLocation(Long id, Location location) {
        // Check if location exists
        Location existingLocation = locationRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Location not found"));
        
        // Check if new name already exists for another location
        locationRepository.findByLocationNameIgnoreCase(location.getLocationName())
            .ifPresent(l -> {
                if (!l.getId().equals(id)) {
                    throw new RuntimeException("Location name already exists");
                }
            });
        
        // Update location
        existingLocation.setLocationName(location.getLocationName());
        return locationRepository.save(existingLocation);
    }
    
    public void deleteLocation(Long id) {
        // Check if location exists
        if (!locationRepository.existsById(id)) {
            throw new RuntimeException("Location not found");
        }
        
        // Delete location
        locationRepository.deleteById(id);
    }
    
    public void deleteMultipleLocations(List<Long> locationIds) {
        if (locationIds == null || locationIds.isEmpty()) {
            return;
        }
        
        // Check if all locations exist before deleting any
        for (Long id : locationIds) {
            if (!locationRepository.existsById(id)) {
                throw new RuntimeException("Location not found with id: " + id);
            }
        }
        
        // Delete all locations
        locationRepository.deleteAllById(locationIds);
    }
    
    public List<Location> searchLocations(String query) {
        if (query == null || query.trim().isEmpty()) {
            return getAllLocations();
        }
        
        return locationRepository.findByLocationNameContainingIgnoreCase(query.trim());
    }
}