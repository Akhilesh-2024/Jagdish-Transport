package com.example.JagdishTransport.Controller;

import com.example.JagdishTransport.model.otherRate;
import com.example.JagdishTransport.service.OtherRateService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

@RestController
@RequestMapping("/waiting-rates")
@CrossOrigin(origins = "*")
public class WaitingRateController {

    private final OtherRateService rateService;

    public WaitingRateController(OtherRateService rateService) {
        this.rateService = rateService;
    }

    @GetMapping("/fetch")
    public ResponseEntity<?> getWaitingRates(@RequestParam("type") String type) {
        try {
            System.out.println("Fetching waiting rates for type: " + type);
            
            // Get all rates for this vehicle type
            List<otherRate> allRates = rateService.getOtherRatesByType(type);
            
            if (allRates.isEmpty()) {
                return ResponseEntity.ok(Collections.emptyList());
            }
            
            // Create a new rate object with the waiting rates
            otherRate waitingRate = new otherRate();
            waitingRate.setType(type);
            waitingRate.setCategory("waiting");
            
            // Use the first rate found
            otherRate firstRate = allRates.get(0);
            waitingRate.setCompanyRate(firstRate.getWaitingCompRate());
            waitingRate.setLorryRate(firstRate.getWaitingLorryRate());
            
            // For debugging
            System.out.println("Returning waiting rates - Type: " + type + 
                              ", Company Rate: " + waitingRate.getCompanyRate() + 
                              ", Lorry Rate: " + waitingRate.getLorryRate());
            
            return ResponseEntity.ok(Collections.singletonList(waitingRate));
        } catch (Exception e) {
            System.err.println("Error fetching waiting rates: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity
                .status(500)
                .body("Error fetching waiting rates: " + e.getMessage());
        }
    }
}