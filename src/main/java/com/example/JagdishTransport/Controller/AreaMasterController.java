        package com.example.JagdishTransport.Controller;
        
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;
import com.example.JagdishTransport.model.AreaMaster;
import com.example.JagdishTransport.service.AreaMasterService;
import com.example.JagdishTransport.service.PartyMasterService;
import com.example.JagdishTransport.service.VehicleTypeService;

import java.util.stream.Collectors;
        
        @Controller
        @RequestMapping("/area-master")
        public class AreaMasterController {
                 @Autowired
                private AreaMasterService areaMasterService;
                 @Autowired
                 private VehicleTypeService vehicleTypeService;
                 @Autowired
                 private PartyMasterService partyMasterService;
                   
                    @GetMapping
                    public String showAreaMasterPage(Model model) {
                        List<AreaMaster> areas = areaMasterService.getAllAreas();
                        List<String> vehicleTypes = vehicleTypeService.getAllVehicleTypes()
                                .stream()
                                .map(v -> v.getVehicleType()) // ✅ correct method
                                .collect(Collectors.toList()); // if using Java 16+, else use collect(Collectors.toList())
                        
                        List<String> partyNames = partyMasterService.getAllParties()
                                .stream()
                                .map(p -> p.getCompanyName())
                                .collect(Collectors.toList());

                        model.addAttribute("areas", areas);
                        model.addAttribute("vehicleTypes", vehicleTypes);
                        model.addAttribute("partyNames", partyNames);

                        return "area-master";
                    }
                    
                    @GetMapping("/all")
                    @ResponseBody
                    public List<AreaMaster> getAllAreas() {
                        return areaMasterService.getAllAreas();
                    }
                    
                    // New endpoint to get area rates by vehicle type and area name
                    @GetMapping("/rates")
                    @ResponseBody
                    public ResponseEntity<List<AreaMaster>> getAreaRates(
                            @RequestParam("vehicleType") String vehicleType,
                            @RequestParam("areaName") String areaName) {
                        List<AreaMaster> rates = areaMasterService.getAreaRatesByVehicleTypeAndAreaName(vehicleType, areaName);
                        return ResponseEntity.ok(rates);
                    }
        
                    @PostMapping("/add")
                    @ResponseBody
                    public AreaMaster addArea(@RequestBody AreaMaster areaMaster) {
                        return areaMasterService.addArea(areaMaster);
                    }
                    
                    @PostMapping("/save")
                    public ResponseEntity<AreaMaster> saveArea(@RequestBody AreaMaster areaMaster) {
                        AreaMaster savedArea = areaMasterService.saveArea(areaMaster);
                        return ResponseEntity.ok(savedArea);
                    }
                    
                    @PutMapping("/update/{id}")
                    public ResponseEntity<AreaMaster> updateArea(@PathVariable Long id, @RequestBody AreaMaster updatedArea) {
                        AreaMaster area = areaMasterService.updateArea(id, updatedArea);
                        return ResponseEntity.ok(area);
                    }
                    
                    @DeleteMapping("/delete/{id}")
                    public ResponseEntity<String> deleteArea(@PathVariable Long id) {
                        areaMasterService.deleteArea(id);  // ✅ Call deleteArea() instead of deleteById()
                        return ResponseEntity.ok("Area deleted successfully");
                    }
            
            @DeleteMapping("/delete-multiple")
            @ResponseBody
            public ResponseEntity<String> deleteMultipleAreas(@RequestBody List<Long> areaIds) {
                try {
                    areaMasterService.deleteMultipleAreas(areaIds);
                    int count = areaIds.size();
                    String message = count == 1 ? 
                        "1 area deleted successfully" : 
                        count + " areas deleted successfully";
                    return ResponseEntity.ok(message);
                } catch (RuntimeException e) {
                    return ResponseEntity.badRequest().body(e.getMessage());
                }
            }
                    
                    @GetMapping("/search")
                    @ResponseBody
                    public List<AreaMaster> searchAreas(String query) {
                        return areaMasterService.searchAreas(query);
                    }
        }