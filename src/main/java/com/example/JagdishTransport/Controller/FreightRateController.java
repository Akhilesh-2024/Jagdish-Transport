package com.example.JagdishTransport.Controller;

import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import com.example.JagdishTransport.model.AreaMaster;
import com.example.JagdishTransport.service.AreaMasterService;

@RestController
@RequestMapping("/freight-rates")
public class FreightRateController {
    
    @Autowired
    private AreaMasterService areaMasterService;
    
    @GetMapping("/fetch")
    public ResponseEntity<?> getFreightRates(
            @RequestParam("vehicleType") String vehicleType,
            @RequestParam("areaName") String areaName) {
        try {
            System.out.println("Received request for freight rates with vehicleType: " + vehicleType + ", areaName: " + areaName);
            List<AreaMaster> rates = areaMasterService.getAreaRatesByVehicleTypeAndAreaName(vehicleType, areaName);
            return ResponseEntity.ok(rates);
        } catch (Exception e) {
            System.err.println("Error in getFreightRates endpoint: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity
                .status(500)
                .body("Error fetching freight rates: " + e.getMessage());
        }
    }
}