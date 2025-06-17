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

import com.example.JagdishTransport.model.VehicleType;
import com.example.JagdishTransport.service.VehicleTypeService;

@Controller
@RequestMapping("/vehicle-type-master")
public class VehicleTypeMasterController {

    private final VehicleTypeService vehicleTypeService;
    
    @Autowired
    public VehicleTypeMasterController(VehicleTypeService vehicleTypeService) {
        this.vehicleTypeService = vehicleTypeService;
    }
    
    @GetMapping
    public String showVehicleTypeMasterPage(Model model) {
        return "vehicle-type-master";
    }
    
    @GetMapping("/all")
    @ResponseBody
    public List<VehicleType> getAllVehicleTypes() {
        return vehicleTypeService.getAllVehicleTypes();
    }
    
    @PostMapping("/add")
    @ResponseBody
    public VehicleType addVehicleType(@RequestBody VehicleType vehicleType) {
        return vehicleTypeService.addVehicleType(vehicleType);
    }
    
    @PutMapping("/update/{id}")
    @ResponseBody
    public VehicleType updateVehicleType(@PathVariable Long id, @RequestBody VehicleType vehicleType) {
        return vehicleTypeService.updateVehicleType(id, vehicleType);
    }
    
    @DeleteMapping("/delete/{id}")
    @ResponseBody
    public ResponseEntity<Void> deleteVehicleType(@PathVariable Long id) {
        vehicleTypeService.deleteVehicleType(id);
        return ResponseEntity.ok().build();
    }
    
    @GetMapping("/search")
    @ResponseBody
    public List<VehicleType> searchVehicleTypes(String query) {
        return vehicleTypeService.searchVehicleTypes(query);
    }
    
    @ExceptionHandler(RuntimeException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    @ResponseBody
    public String handleRuntimeException(RuntimeException ex) {
        return ex.getMessage();
    }
}