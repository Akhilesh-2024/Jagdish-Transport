package com.example.JagdishTransport.Controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.ResponseStatus;

import com.example.JagdishTransport.model.Location;
import com.example.JagdishTransport.service.LocationService;

@Controller
@RequestMapping("/location-master")
public class LocationMasterController {

    private final LocationService locationService;

    @Autowired
    public LocationMasterController(LocationService locationService) {
        this.locationService = locationService;
    }

    @GetMapping
    public String showLocationMasterPage(Model model) {
        return "location-master";
    }

    @GetMapping("/all")
    @ResponseBody
    public List<Location> getAllLocations() {
        return locationService.getAllLocations();
    }

    @PostMapping("/add")
    @ResponseBody
    public Location addLocation(@RequestBody Location location) {
        return locationService.addLocation(location);
    }

    @PutMapping("/update/{id}")
    @ResponseBody
    public Location updateLocation(@PathVariable Long id, @RequestBody Location location) {
        return locationService.updateLocation(id, location);
    }

    @DeleteMapping("/delete/{id}")
    @ResponseBody
    public ResponseEntity<Void> deleteLocation(@PathVariable Long id) {
        locationService.deleteLocation(id);
        return ResponseEntity.ok().build();
    }
    
    @DeleteMapping("/delete-multiple")
    @ResponseBody
    public ResponseEntity<Void> deleteMultipleLocations(@RequestBody List<Long> locationIds) {
        locationService.deleteMultipleLocations(locationIds);
        return ResponseEntity.ok().build();
    }
    
    @GetMapping("/search")
    @ResponseBody
    public List<Location> searchLocations(String query) {
        return locationService.searchLocations(query);
    }

    @ExceptionHandler(RuntimeException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    @ResponseBody
    public String handleRuntimeException(RuntimeException ex) {
        return ex.getMessage();
    }
}