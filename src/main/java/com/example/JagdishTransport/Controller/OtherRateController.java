package com.example.JagdishTransport.Controller;

import com.example.JagdishTransport.model.otherRate;
import com.example.JagdishTransport.service.OtherRateService;

import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

@Controller
@RequestMapping("/otherRate")
@CrossOrigin(origins = "*") // Allow frontend requests
public class OtherRateController {

    private final OtherRateService rateService;

    public OtherRateController(OtherRateService rateService) {
        this.rateService = rateService;
    }

    // === HTML View Endpoint ===
    // This method returns the Thymeleaf template for displaying the other rate page.
    @GetMapping
    public String showOtherRatePage(Model model) {
        List<otherRate> rates = rateService.getAllOtherRates();
        model.addAttribute("rates", rates.isEmpty() ? Collections.emptyList() : rates);
        return "otherRate";  // Thymeleaf template name (otherRate.html)
    }

    // === API Endpoints ===

    // API to fetch all other rates as JSON
    @GetMapping("/all")
    @ResponseBody
    public List<otherRate> getAllRates() {
        return rateService.getAllOtherRates();
    }
    
    // API to fetch rates by type
    @GetMapping("/by-type")
    @ResponseBody
    public ResponseEntity<?> getRatesByType(@RequestParam("type") String type) {
        try {
            System.out.println("Fetching other rates for type: " + type);
            List<otherRate> rates = rateService.getOtherRatesByType(type);
            
            if (rates.isEmpty()) {
                return ResponseEntity.ok(Collections.emptyList());
            }
            
            return ResponseEntity.ok(rates);
        } catch (Exception e) {
            System.err.println("Error fetching other rates: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity
                .status(500)
                .body("Error fetching other rates: " + e.getMessage());
        }
    }
    
    // API to fetch rates by type and category
    @GetMapping("/by-type-category")
    @ResponseBody
    public ResponseEntity<?> getRatesByTypeAndCategory(
            @RequestParam("type") String type, 
            @RequestParam("category") String category) {
        try {
            System.out.println("Fetching other rates for type: " + type + ", category: " + category);
            
            // First try to find by type and category
            List<otherRate> rates = new ArrayList<>();
            try {
                rates = rateService.getOtherRatesByTypeAndCategory(type, category);
            } catch (Exception e) {
                System.out.println("Error using new method, falling back to old method: " + e.getMessage());
            }
            
            // If no results or error, fall back to the old method
            if (rates.isEmpty()) {
                List<otherRate> oldRates = rateService.getOtherRatesByType(type);
                
                // Convert old rates to new format
                for (otherRate rate : oldRates) {
                    // Create a copy with the category and appropriate rates
                    otherRate newRate = new otherRate();
                    newRate.setId(rate.getId());
                    newRate.setType(rate.getType());
                    newRate.setCategory(category);
                    
                    if ("waiting".equalsIgnoreCase(category)) {
                        newRate.setCompanyRate(rate.getWaitingCompRate());
                        newRate.setLorryRate(rate.getWaitingLorryRate());
                        System.out.println("Setting waiting rates - Company: " + rate.getWaitingCompRate() + ", Lorry: " + rate.getWaitingLorryRate());
                    } else if ("cdwt".equalsIgnoreCase(category)) {
                        newRate.setCompanyRate(rate.getCdCompRate());
                        newRate.setLorryRate(rate.getCdLorryRate());
                        System.out.println("Setting CDWT rates - Company: " + rate.getCdCompRate() + ", Lorry: " + rate.getCdLorryRate());
                    }
                    
                    rates.add(newRate);
                }
            }
            
            if (rates.isEmpty()) {
                return ResponseEntity.ok(Collections.emptyList());
            }
            
            return ResponseEntity.ok(rates);
        } catch (Exception e) {
            System.err.println("Error fetching other rates: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity
                .status(500)
                .body("Error fetching other rates: " + e.getMessage());
        }
    }

    // API to save other rates (accepts a list of OtherRate objects)
    @PostMapping("/save")
    @ResponseBody
    public ResponseEntity<String> saveOtherRates(@RequestBody List<otherRate> rates) {
        rateService.saveAllOtherRates(rates);
        return ResponseEntity.ok("Rates saved successfully!");
    }
    
 // API to delete an otherRate entry by ID
    @DeleteMapping("/delete/{id}")
    @ResponseBody
    public ResponseEntity<String> deleteRate(@PathVariable Long id) {
        if (rateService.getOtherRateById(id).isPresent()) {
            rateService.deleteOtherRate(id);
            return ResponseEntity.ok("Rate deleted successfully!");
        } else {
            return ResponseEntity.status(404).body("Rate not found");
        }
    }

}
