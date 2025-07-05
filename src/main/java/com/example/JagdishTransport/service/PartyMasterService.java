package com.example.JagdishTransport.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.JagdishTransport.model.PartyMaster;
import com.example.JagdishTransport.repository.PartyMasterRepository;

@Service
public class PartyMasterService {
	
	@Autowired
	private PartyMasterRepository partyMasterRepository;

    public List<PartyMaster> getAllParties() {
        return partyMasterRepository.findAll();
    }
    
    public PartyMaster getPartyById(Long id) {
        return partyMasterRepository.findById(id).orElse(null);
    }
    
    public PartyMaster addParty(PartyMaster party) {
        // Ensure GST number is not null before saving
        if (party.getGstNo() == null || party.getGstNo().trim().isEmpty()) {
            String uniqueGstNo = "NA-" + System.currentTimeMillis() + "-" + Math.round(Math.random() * 1000000);
            party.setGstNo(uniqueGstNo);
            System.out.println("Generated unique GST No in service: " + uniqueGstNo);
        }
        
        try {
            return partyMasterRepository.save(party);
        } catch (Exception e) {
            System.err.println("Error in addParty: " + e.getMessage());
            throw e; // Re-throw to be handled by controller
        }
    }
    
    public PartyMaster updateParty(Long id, PartyMaster updatedParty) {
        PartyMaster existingParty = partyMasterRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Party not found"));

        existingParty.setCompanyName(updatedParty.getCompanyName());
        existingParty.setGstNo(updatedParty.getGstNo());
        existingParty.setAddress(updatedParty.getAddress());

        return partyMasterRepository.save(existingParty);
    }


    public void deleteParty(Long id) {
        partyMasterRepository.deleteById(id);
    }
    
    public void deleteMultipleParties(List<Long> partyIds) {
        if (partyIds == null || partyIds.isEmpty()) {
            return;
        }
        
        // Check if all parties exist before deleting any
        for (Long id : partyIds) {
            if (!partyMasterRepository.existsById(id)) {
                throw new RuntimeException("Party not found with id: " + id);
            }
        }
        
        // Delete all parties
        partyMasterRepository.deleteAllById(partyIds);
    }
    
    public PartyMaster getPartyByName(String name) {
        return partyMasterRepository.findByCompanyName(name);
    }
    
    public List<PartyMaster> searchParties(String query) {
        if (query == null || query.trim().isEmpty()) {
            return getAllParties();
        }
        
        return partyMasterRepository.findByCompanyNameContainingIgnoreCase(query.trim());
    }
    
    // Check if GST number already exists
    public boolean isGstNoExists(String gstNo) {
        if (gstNo == null || gstNo.trim().isEmpty()) {
            System.out.println("GST number is empty, returning false");
            return false;
        }
        
        String trimmedGstNo = gstNo.trim();
        System.out.println("Checking if GST number exists in database: " + trimmedGstNo);
        
        // First try the repository method
        boolean exists = partyMasterRepository.existsByGstNo(trimmedGstNo);
        System.out.println("Repository check result: " + exists);
        
        // If that doesn't work, try a manual check
        if (!exists) {
            System.out.println("Performing manual check for GST number");
            List<PartyMaster> allParties = partyMasterRepository.findAll();
            
            for (PartyMaster party : allParties) {
                System.out.println("Comparing with party: " + party.getId() + ", GST: " + party.getGstNo());
                if (trimmedGstNo.equals(party.getGstNo())) {
                    System.out.println("Found matching GST number in party ID: " + party.getId());
                    return true;
                }
            }
        }
        
        return exists;
    }
    
    // Get party by GST number
    public PartyMaster getPartyByGstNo(String gstNo) {
        if (gstNo == null || gstNo.trim().isEmpty()) {
            return null;
        }
        return partyMasterRepository.findByGstNo(gstNo.trim());
    }
}
