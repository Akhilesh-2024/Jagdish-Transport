package com.example.JagdishTransport.service;

import com.example.JagdishTransport.model.InvoiceSettings;
import com.example.JagdishTransport.repository.InvoiceSettingsRepository;
import java.util.Optional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class InvoiceService {

    @Autowired
    private InvoiceSettingsRepository invoiceSettingsRepository;

    // Fetch latest settings (if autoGenerate true record exists, return that; otherwise latest record)
    public InvoiceSettings getInvoiceSettings() {
        // Simply return the most recent settings record
        return invoiceSettingsRepository.findTopByOrderByIdDesc()
            .orElse(new InvoiceSettings("INV", 1000, false));
    }

    // Generate next invoice number dynamically
    public String getNextInvoiceNumber() {
        Optional<InvoiceSettings> latestSettings = invoiceSettingsRepository.findTopByOrderByIdDesc();
        if (latestSettings.isPresent()) {
            InvoiceSettings settings = latestSettings.get();
            String prefix = settings.getPrefix() != null ? settings.getPrefix() : "INV";
            int lastNumber = settings.getStartNumber() != null ? settings.getStartNumber() : 1000;
            int newNumber = lastNumber + 1;
            return prefix + newNumber;
        }
        return "INV1001"; // Default invoice number
    }

    // Save Invoice Settings
    public void saveInvoiceSettings(InvoiceSettings settings) {
        invoiceSettingsRepository.save(settings);
    }

    // Reset Invoice Settings: ONLY clear all records (truncate the table)
    public void resetInvoiceSettings() {
        invoiceSettingsRepository.deleteAllInBatch();
    }
    
    // Check if auto mode is ON (returns true if a record with autoGenerate=true exists)
    public boolean isAutoModeOn() {
        return invoiceSettingsRepository.findFirstByAutoGenerateTrueOrderByIdDesc().isPresent();
    }
}
