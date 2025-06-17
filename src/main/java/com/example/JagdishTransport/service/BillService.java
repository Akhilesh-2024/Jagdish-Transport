package com.example.JagdishTransport.service;

import com.example.JagdishTransport.model.BillSettings;
import com.example.JagdishTransport.repository.BillSettingsRepository;
import java.util.Optional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class BillService {

    @Autowired
    private BillSettingsRepository billSettingsRepository;

    /**
     * Get the current bill settings
     * Returns the most recent settings record, or a default if none exists
     */
    public BillSettings getBillSettings() {
        return billSettingsRepository.findTopByOrderByIdDesc()
                .orElse(new BillSettings("BILL", 1000, false));
    }

    /**
     * Generate the next bill number based on current settings
     */
    public String getNextBillNumber() {
        BillSettings settings = getBillSettings();
        String prefix = settings.getPrefix() != null ? settings.getPrefix() : "BILL";
        int number = settings.getStartNumber() != null ? settings.getStartNumber() : 1000;
        
        return prefix + number;
    }

    /**
     * Save bill settings
     */
    @Transactional
    public void saveBillSettings(BillSettings settings) {
        // If we're turning on auto-generate, make sure we have a valid prefix and number
        if (settings.isAutoGenerate()) {
            if (settings.getPrefix() == null || settings.getPrefix().trim().isEmpty()) {
                settings.setPrefix("BILL");
            }
            if (settings.getStartNumber() == null || settings.getStartNumber() < 1000) {
                settings.setStartNumber(1000);
            }
        }
        
        billSettingsRepository.save(settings);
    }

    /**
     * Reset bill settings to default
     */
    @Transactional
    public void resetBillSettings() {
        billSettingsRepository.deleteAll();
        // Create default settings
        billSettingsRepository.save(new BillSettings("BILL", 1000, false));
    }

    /**
     * Check if auto mode is enabled
     */
    public boolean isAutoModeOn() {
        return getBillSettings().isAutoGenerate();
    }

    /**
     * Increment the bill number if auto-generate is enabled
     * Returns the updated bill number
     */
    @Transactional
    public String incrementBillNumber() {
        BillSettings settings = getBillSettings();
        
        if (settings.isAutoGenerate()) {
            settings.setStartNumber(settings.getStartNumber() + 1);
            billSettingsRepository.save(settings);
        }
        
        return getNextBillNumber();
    }

    /**
     * Decrement the bill number if possible
     */
    @Transactional
    public void decrementBillNumber() {
        BillSettings settings = getBillSettings();
        
        // Only allow decrement if number is greater than 1000
        if (settings.getStartNumber() > 1000) {
            settings.setStartNumber(settings.getStartNumber() - 1);
            billSettingsRepository.save(settings);
        }
    }
}