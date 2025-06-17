package com.example.JagdishTransport.Controller;
import com.example.JagdishTransport.model.otherRate;
import com.example.JagdishTransport.service.OtherRateService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

@RestController
@RequestMapping("/cdwt-rates")
@CrossOrigin(origins = "*")
public class CDWTRateController {

    private final OtherRateService rateService;

    public CDWTRateController(OtherRateService rateService) {
        this.rateService = rateService;
    }

    @GetMapping("/fetch")
    public ResponseEntity<?> getCDWTRates(@RequestParam("type") String type) {
        try {
            System.out.println("Fetching CD/WT rates for type: " + type);
            
            // Get all rates for this vehicle type
            List<otherRate> allRates = rateService.getOtherRatesByType(type);
            
            if (allRates.isEmpty()) {
                return ResponseEntity.ok(Collections.emptyList());
            }
            
            // Create a new rate object with the CD/WT rates
            otherRate cdwtRate = new otherRate();
            cdwtRate.setType(type);
            cdwtRate.setCategory("cdwt");
            
            // Use the first rate found
            otherRate firstRate = allRates.get(0);
            cdwtRate.setCompanyRate(firstRate.getCdCompRate());
            cdwtRate.setLorryRate(firstRate.getCdLorryRate());
            
            // For debugging
            System.out.println("Returning CD/WT rates - Type: " + type + 
                              ", Company Rate: " + cdwtRate.getCompanyRate() + 
                              ", Lorry Rate: " + cdwtRate.getLorryRate());
            
            return ResponseEntity.ok(Collections.singletonList(cdwtRate));
        } catch (Exception e) {
            System.err.println("Error fetching CD/WT rates: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity
                .status(500)
                .body("Error fetching CD/WT rates: " + e.getMessage());
        }
    }
}