package com.example.JagdishTransport.service;

import com.example.JagdishTransport.repository.OtherRateRepository;
import org.springframework.stereotype.Service;
import com.example.JagdishTransport.model.otherRate;
import java.util.List;
import java.util.Optional;

@Service
public class OtherRateService {

    private final OtherRateRepository otherRateRepository;

    public OtherRateService(OtherRateRepository otherRateRepository) {
        this.otherRateRepository = otherRateRepository;
    }

    public List<otherRate> getAllOtherRates() {
        return otherRateRepository.findAll();
    }
    
    public List<otherRate> getOtherRatesByType(String type) {
        return otherRateRepository.findByTypeIgnoreCase(type);
    }
    
    public List<otherRate> getOtherRatesByTypeAndCategory(String type, String category) {
        return otherRateRepository.findByTypeIgnoreCaseAndCategoryIgnoreCase(type, category);
    }

    public Optional<otherRate> getOtherRateById(Long id) {
        return otherRateRepository.findById(id);
    }

    public void saveAllOtherRates(List<otherRate> rates) {
        otherRateRepository.saveAll(rates);
    }

    public otherRate updateOtherRate(Long id, otherRate newOtherRate) {
        return otherRateRepository.findById(id)
            .map(rate -> {
                rate.setType(newOtherRate.getType());
                
                // Update new fields if they exist
                if (newOtherRate.getCategory() != null) {
                    rate.setCategory(newOtherRate.getCategory());
                }
                
                // Update rates based on category
                if ("waiting".equalsIgnoreCase(rate.getCategory())) {
                    rate.setCompanyRate(newOtherRate.getWaitingCompRate());
                    rate.setLorryRate(newOtherRate.getWaitingLorryRate());
                } else if ("cdwt".equalsIgnoreCase(rate.getCategory())) {
                    rate.setCompanyRate(newOtherRate.getCdCompRate());
                    rate.setLorryRate(newOtherRate.getCdLorryRate());
                }
                
                // Always update the old fields for backward compatibility
                rate.setCdCompRate(newOtherRate.getCdCompRate());
                rate.setCdLorryRate(newOtherRate.getCdLorryRate());
                rate.setWaitingCompRate(newOtherRate.getWaitingCompRate());
                rate.setWaitingLorryRate(newOtherRate.getWaitingLorryRate());
                
                return otherRateRepository.save(rate);
            }).orElseThrow(() -> new RuntimeException("OtherRate not found"));
    }

    public void deleteOtherRate(Long id) {
        otherRateRepository.deleteById(id);
    }
}
