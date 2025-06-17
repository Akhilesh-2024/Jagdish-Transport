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
        return partyMasterRepository.save(party);
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
    
    public PartyMaster getPartyByName(String name) {
        return partyMasterRepository.findByCompanyName(name);
    }
    
    public List<PartyMaster> searchParties(String query) {
        if (query == null || query.trim().isEmpty()) {
            return getAllParties();
        }
        
        return partyMasterRepository.findByCompanyNameContainingIgnoreCase(query.trim());
    }
}
