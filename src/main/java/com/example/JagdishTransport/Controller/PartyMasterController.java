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
	        try {
	            // If GST number is not provided, generate a unique one
	            if (party.getGstNo() == null || party.getGstNo().trim().isEmpty()) {
	                party.setGstNo("NA-" + System.currentTimeMillis());
	            }
	            
	            // Ensure address is not null
	            if (party.getAddress() == null || party.getAddress().trim().isEmpty()) {
	                party.setAddress("Default Address");
	            }
	            
	            PartyMaster savedParty = partyMasterService.addParty(party);
	            return ResponseEntity.ok(savedParty);
	        } catch (Exception e) {
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
	   
}
