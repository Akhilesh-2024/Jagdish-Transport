package com.example.JagdishTransport.Controller;

import com.example.JagdishTransport.model.AreaMaster;
import com.example.JagdishTransport.model.Location;
import com.example.JagdishTransport.model.PartyMaster;
import com.example.JagdishTransport.model.VehicleMaster;
import com.example.JagdishTransport.model.VehicleType;
import com.example.JagdishTransport.repository.AreaMasterRepository;
import com.example.JagdishTransport.repository.LocationRepository;
import com.example.JagdishTransport.repository.PartyMasterRepository;
import com.example.JagdishTransport.repository.VehicleMasterRepository;
import com.example.JagdishTransport.repository.VehicleTypeRepository;
import com.example.JagdishTransport.service.LocationService;
import com.example.JagdishTransport.service.PartyMasterService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Controller for handling search functionality across different entities
 */
@RestController
@RequestMapping("/api")
@CrossOrigin("*")
public class SearchController {

    @Autowired
    private VehicleMasterRepository vehicleMasterRepository;

    @Autowired
    private VehicleTypeRepository vehicleTypeRepository;

    @Autowired
    private LocationRepository locationRepository;

    @Autowired
    private PartyMasterRepository partyMasterRepository;

    @Autowired
    private AreaMasterRepository areaMasterRepository;
    
    @Autowired
    private LocationService locationService;
    
    @Autowired
    private PartyMasterService partyMasterService;

    /**
     * Search for vehicles by vehicle number
     * @param query The search query
     * @return List of matching vehicles
     */
    @GetMapping("/vehicles/search")
    public ResponseEntity<List<VehicleMaster>> searchVehicles(@RequestParam String query) {
        List<VehicleMaster> results = vehicleMasterRepository.findByVehicleNumberContainingIgnoreCase(query, PageRequest.of(0, 20))
                .getContent();
        return ResponseEntity.ok(results);
    }

    /**
     * Search for vehicle types by type name
     * @param query The search query
     * @return List of matching vehicle types
     */
    @GetMapping("/vehicle-types/search")
    public ResponseEntity<List<VehicleType>> searchVehicleTypes(@RequestParam String query) {
        List<VehicleType> results = vehicleTypeRepository.findByVehicleTypeContainingIgnoreCase(query, PageRequest.of(0, 20))
                .getContent();
        return ResponseEntity.ok(results);
    }

    /**
     * Search for locations by location name
     * @param query The search query
     * @return List of matching locations
     */
    @GetMapping("/locations/search")
    public ResponseEntity<List<Location>> searchLocations(@RequestParam String query) {
        List<Location> results = locationRepository.findByLocationNameContainingIgnoreCase(query, PageRequest.of(0, 20))
                .getContent();
        return ResponseEntity.ok(results);
    }

    /**
     * Search for parties by party name
     * @param query The search query
     * @return List of matching parties
     */
    @GetMapping("/parties/search")
    public ResponseEntity<List<PartyMaster>> searchParties(@RequestParam String query) {
        List<PartyMaster> results = partyMasterRepository.findByCompanyNameContainingIgnoreCase(query, PageRequest.of(0, 20))
                .getContent();
        return ResponseEntity.ok(results);
    }

    /**
     * Search for areas by area name
     * @param query The search query
     * @return List of matching areas
     */
    @GetMapping("/areas/search")
    public ResponseEntity<List<AreaMaster>> searchAreas(@RequestParam String query) {
        List<AreaMaster> results = areaMasterRepository.findByAreaNameContainingIgnoreCase(query, PageRequest.of(0, 20))
                .getContent();
        return ResponseEntity.ok(results);
    }
    
    /**
     * Add a new location
     * @param locationData Map containing location data (name and type)
     * @return The newly created location
     */
    @PostMapping("/locations/add")
    public ResponseEntity<Location> addLocation(@RequestBody Map<String, String> locationData) {
        String locationName = locationData.get("name");
        String locationType = locationData.get("type"); // From or To
        
        if (locationName == null || locationName.trim().isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        
        Location location = new Location();
        location.setLocationName(locationName);
        
        Location savedLocation = locationService.addLocation(location);
        return ResponseEntity.ok(savedLocation);
    }
    
    /**
     * Add a new party
     * @param partyData Map containing party data
     * @return The newly created party
     */
    @PostMapping("/parties/add")
    public ResponseEntity<PartyMaster> addParty(@RequestBody Map<String, String> partyData) {
        String partyName = partyData.get("name");
        
        if (partyName == null || partyName.trim().isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        
        PartyMaster party = new PartyMaster();
        party.setCompanyName(partyName);
        
        // Set default values for required fields
        party.setGstNo("NA-" + System.currentTimeMillis()); // Generate a unique GST number
        party.setAddress("Default Address");
        
        PartyMaster savedParty = partyMasterService.addParty(party);
        return ResponseEntity.ok(savedParty);
    }
}