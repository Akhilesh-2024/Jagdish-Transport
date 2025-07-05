package com.example.JagdishTransport.Controller;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

import com.example.JagdishTransport.model.PartyMaster;
import com.example.JagdishTransport.service.PartyMasterService;
import com.example.JagdishTransport.service.TripVoucherService;

@Controller	
@RequestMapping("/party-master")
@CrossOrigin("*")
public class PartyMasterController {
	
	 @Autowired
	    private PartyMasterService partyMasterService;
	 
	 @GetMapping
	    public String showPartyMasterPage(Model model) {
		 List<PartyMaster> parties = partyMasterService.getAllParties();
	        model.addAttribute("parties", parties);
	        return "party-master"; // Must be inside src/main/resources/templates/
	    }

	 @GetMapping("/all")
	  @ResponseBody
	    public List<PartyMaster> getAllParties() {
	        return partyMasterService.getAllParties();
	    }

	    @PostMapping("/add")
	    @ResponseBody 
	    public ResponseEntity<?> addParty(@RequestBody PartyMaster party) {
	        System.out.println("Received party add request: " + party.getCompanyName() + ", GST: " + party.getGstNo());
	        
	        try {
	            // Validate company name
	            if (party.getCompanyName() == null || party.getCompanyName().trim().isEmpty()) {
	                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
	                    .body("Company name is required");
	            }
	            
	            if (party.getCompanyName().trim().length() < 2) {
	                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
	                    .body("Company name must be at least 2 characters");
	            }
	            
	            // Validate address
	            if (party.getAddress() == null || party.getAddress().trim().isEmpty()) {
	                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
	                    .body("Address is required");
	            }
	            
	            if (party.getAddress().trim().length() < 5) {
	                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
	                    .body("Address must be at least 5 characters");
	            }
	            
	            // If GST number is not provided, generate a unique one with timestamp to ensure uniqueness
	            if (party.getGstNo() == null || party.getGstNo().trim().isEmpty()) {
	                // Generate a truly unique GST number
	                String timestamp = String.valueOf(System.currentTimeMillis());
	                String random = String.valueOf(Math.round(Math.random() * 1000000));
	                String uniqueGstNo = "NA-" + timestamp + "-" + random;
	                
	                party.setGstNo(uniqueGstNo);
	                System.out.println("Generated unique GST No: " + uniqueGstNo);
	            } else {
	                // Check if GST number already exists
	                if (partyMasterService.isGstNoExists(party.getGstNo())) {
	                    return ResponseEntity.status(HttpStatus.BAD_REQUEST)
	                        .body("GST number '" + party.getGstNo() + "' already exists. Please use a different GST number.");
	                }
	                
	                // Validate GST number format if it's not system-generated
	                if (!party.getGstNo().startsWith("NA-")) {
	                    // For numeric-only GST, it should be at least 5 digits
	                    if (party.getGstNo().matches("^\\d+$") && party.getGstNo().length() < 5) {
	                        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
	                            .body("Numeric GST number must be at least 5 digits");
	                    }
	                    
	                    // For standard GST format (optional validation)
	                    // String gstRegex = "^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$";
	                    // if (!party.getGstNo().matches(gstRegex)) {
	                    //     return ResponseEntity.status(HttpStatus.BAD_REQUEST)
	                    //         .body("Invalid GST number format. Expected format: 27AAPFU0939F1ZV");
	                    // }
	                }
	            }
	            
	            // Trim values before saving
	            party.setCompanyName(party.getCompanyName().trim());
	            party.setAddress(party.getAddress().trim());
	            if (party.getGstNo() != null) {
	                party.setGstNo(party.getGstNo().trim());
	            }
	            
	            System.out.println("Saving party with GST: " + party.getGstNo());
	            PartyMaster savedParty = partyMasterService.addParty(party);
	            System.out.println("Party saved successfully with ID: " + savedParty.getId());
	            
	            return ResponseEntity.ok(savedParty);
	        } catch (Exception e) {
	            System.err.println("Error saving party: " + e.getMessage());
	            e.printStackTrace(); // Log the full stack trace
	            
	            // Check for duplicate key error
	            String errorMessage = e.getMessage();
	            if (errorMessage != null && (errorMessage.contains("Duplicate entry") || errorMessage.contains("duplicate key"))) {
	                System.err.println("Detected duplicate key error");
	                
	                // Try to extract the duplicate value from the error message
	                String duplicateValue = "unknown";
	                if (errorMessage.contains("Duplicate entry '")) {
	                    int start = errorMessage.indexOf("Duplicate entry '") + 17;
	                    int end = errorMessage.indexOf("'", start);
	                    if (end > start) {
	                        duplicateValue = errorMessage.substring(start, end);
	                    }
	                }
	                
	                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
	                    .body("GST number '" + duplicateValue + "' already exists. Please use a different GST number.");
	            }
	            
	            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
	                .body("Error saving party: " + e.getMessage());
	        }
	    }

	    @PutMapping("/update/{id}")
	    @ResponseBody
	    public PartyMaster updateParty(@PathVariable Long id, @RequestBody PartyMaster updatedParty) {
	        return partyMasterService.updateParty(id, updatedParty);
	    }

	    @DeleteMapping("/delete/{id}")
	    @ResponseBody
	    public void deleteParty(@PathVariable Long id) {
	        partyMasterService.deleteParty(id);
	    }
	    
	    @DeleteMapping("/delete-multiple")
	    @ResponseBody
	    public ResponseEntity<String> deleteMultipleParties(@RequestBody List<Long> partyIds) {
	        try {
	            partyMasterService.deleteMultipleParties(partyIds);
	            int count = partyIds.size();
	            String message = count == 1 ? 
	                "1 party deleted successfully" : 
	                count + " parties deleted successfully";
	            return ResponseEntity.ok(message);
	        } catch (RuntimeException e) {
	            return ResponseEntity.badRequest().body(e.getMessage());
	        }
	    }
	    
	    @GetMapping("/by-name/{name}")
	    public ResponseEntity<PartyMaster> getPartyByName(@PathVariable String name) {
	        PartyMaster party = partyMasterService.getPartyByName(name);
	        if (party != null) {
	            return ResponseEntity.ok(party);
	        }
	        return ResponseEntity.notFound().build();
	    }
	    
	    @GetMapping("/search")
	    @ResponseBody
	    public List<PartyMaster> searchParties(@RequestParam String query) {
	        return partyMasterService.searchParties(query);
	    }
	    
	    @GetMapping("/check-gst")
	    @ResponseBody
	    public ResponseEntity<?> checkGstExists(@RequestParam String gstNo) {
	        System.out.println("Checking if GST exists: " + gstNo);
	        boolean exists = partyMasterService.isGstNoExists(gstNo);
	        System.out.println("GST exists: " + exists);
	        
	        return ResponseEntity.ok(Map.of(
	            "exists", exists,
	            "gstNo", gstNo
	        ));
	    }
	   
}
