package com.example.JagdishTransport.Controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;

import com.example.JagdishTransport.model.VehicleMaster;
import com.example.JagdishTransport.service.VehicleMasterService;

@Controller
@RequestMapping("/vehicle-master")
public class VehicleMasterController {
    
    @Autowired
    private VehicleMasterService vehicleMasterService;
    
    @GetMapping
    public String showVehicleMasterPage(Model model) {
        model.addAttribute("vehicles", vehicleMasterService.getAllVehicles());
        return "vehicle-master";
    }
    
    @GetMapping("/all")
    @ResponseBody
    public List<VehicleMaster> getAllVehicles() {
        return vehicleMasterService.getAllVehicles();
    }
    
    @PostMapping("/add")
    @ResponseBody
    public VehicleMaster addVehicle(@RequestBody VehicleMaster vehicle) {
        if (vehicle.getVehicleNumber() == null || vehicle.getVehicleNumber().isEmpty()) {
            throw new RuntimeException("Vehicle number cannot be empty!");
        }
        
        // Convert to uppercase before saving
        vehicle.setVehicleNumber(vehicle.getVehicleNumber().toUpperCase());
        
        // Save to database
        return vehicleMasterService.addVehicle(vehicle);
    }
    
    @PutMapping("/update/{id}")
    @ResponseBody
    public VehicleMaster updateVehicle(@PathVariable Long id, @RequestBody VehicleMaster vehicle) {
        // Convert to uppercase before saving
        vehicle.setVehicleNumber(vehicle.getVehicleNumber().toUpperCase());
        
        // Update in database
        return vehicleMasterService.updateVehicle(id, vehicle);
    }
    
    @DeleteMapping("/delete/{id}")
    @ResponseBody
    public void deleteVehicle(@PathVariable Long id) {
        // Delete from database
        vehicleMasterService.deleteVehicle(id);
    }
    
    @DeleteMapping("/delete-multiple")
    @ResponseBody
    public void deleteMultipleVehicles(@RequestBody List<Long> vehicleIds) {
        // Delete multiple vehicles from database
        vehicleMasterService.deleteMultipleVehicles(vehicleIds);
    }
    
    @GetMapping("/search")
    @ResponseBody
    public List<VehicleMaster> searchVehicles(String query) {
        return vehicleMasterService.searchVehicles(query);
    }
}