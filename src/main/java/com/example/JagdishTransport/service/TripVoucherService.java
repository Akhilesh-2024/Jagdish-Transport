package com.example.JagdishTransport.service;

import com.example.JagdishTransport.model.TripVoucher;
import com.example.JagdishTransport.repository.TripVoucherRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;
import java.util.logging.Logger;

@Service
public class TripVoucherService {
    private static final Logger logger = Logger.getLogger(TripVoucherService.class.getName());
    
    @Autowired
    private TripVoucherRepository repository;

    // Create or update a single voucher
    @Transactional
    public TripVoucher saveVoucher(TripVoucher voucher) {
        try {
            logger.info("Saving voucher with timestamp: " + voucher.getTimestamp());
            logger.info("Voucher details: " + 
                      "ID=" + voucher.getId() + 
                      ", Vehicle=" + voucher.getVehicleNo() + 
                      ", Type=" + voucher.getVehicleType() + 
                      ", Payment=" + voucher.getPaymentType());
            
            TripVoucher savedVoucher = repository.save(voucher);
            logger.info("Voucher saved successfully with ID: " + savedVoucher.getId());
            return savedVoucher;
        } catch (Exception e) {
            logger.severe("Error saving voucher: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }


    // Create or update multiple vouchers
    @Transactional
    public List<TripVoucher> saveAllVouchers(List<TripVoucher> vouchers) {
        return repository.saveAll(vouchers);
    }

    // Get all vouchers
    public List<TripVoucher> getAllVouchers() {
        return repository.findAll();
    }

    // Get voucher by ID
    public Optional<TripVoucher> getVoucherById(Long id) {
        return repository.findById(id);
    }

    // Delete a voucher by ID
    @Transactional
    public void deleteVoucher(Long id) {
        repository.deleteById(id);
    }

    // Delete all vouchers
    @Transactional
    public void deleteAllVouchers() {
        repository.deleteAll();
    }

    // Find vouchers between date range
    public List<TripVoucher> getVouchersByDateRange(LocalDateTime startDate, LocalDateTime endDate) {
        logger.info("Finding vouchers between " + startDate + " and " + endDate);
        return repository.findByDateBetween(startDate, endDate);
    }

    // Find vouchers by party name
    public List<TripVoucher> getVouchersByPartyName(String partyName) {
        // Trim party name to handle extra spaces and ensure it's not empty
        if (partyName == null || partyName.trim().isEmpty()) {
            return getAllVouchers();
        }
        logger.info("Finding vouchers for party: " + partyName.trim());
        return repository.findByToBeBilledContainingIgnoreCase(partyName.trim());
    }

    // Find vouchers by party name and date range
    public List<TripVoucher> getVouchersByDateRangeAndPartyName(
            LocalDate fromDate, LocalDate toDate, String partyName) {

        // Convert LocalDate to LocalDateTime (start of day for fromDate, end of day for toDate)
        LocalDateTime startDate = fromDate.atStartOfDay();
        LocalDateTime endDate = toDate.atTime(LocalTime.MAX);
        
        logger.info("Finding vouchers between " + startDate + " and " + endDate + " for party: " + partyName);

        // If party name is empty or null, just filter by date range
        if (partyName == null || partyName.trim().isEmpty()) {
            return repository.findByDateBetween(startDate, endDate);
        }

        String trimmedPartyName = partyName.trim();
        
        // Try exact match first for better performance
        List<TripVoucher> exactMatches = repository.findByDateRangeAndExactPartyName(startDate, endDate, trimmedPartyName);
        
        if (!exactMatches.isEmpty()) {
            logger.info("Found " + exactMatches.size() + " vouchers with exact party name match");
            return exactMatches;
        }
        
        // Fall back to partial match if no exact matches found
        logger.info("No exact matches found, trying partial matches for party name: " + trimmedPartyName);
        return repository.findByDateRangeAndPartyName(startDate, endDate, trimmedPartyName);
    }

    // Find vouchers by search term and date range
    public List<TripVoucher> getVouchersByDateRangeAndSearchTerm(
            LocalDateTime startDate, LocalDateTime endDate, String searchTerm) {
        if (searchTerm == null || searchTerm.trim().isEmpty()) {
            return repository.findByDateBetween(startDate, endDate);
        }
        return repository.findByDateRangeAndSearchTerm(startDate, endDate, searchTerm);
    }

    // Get all unique vehicle numbers
    public List<String> getAllUniqueVehicleNumbers() {
        return repository.findDistinctVehicleNumbers();
    }

    // Get all distinct party names
    public List<String> getAllDistinctPartyNames() {
        List<String> partyNames = repository.findDistinctPartyNames();
        logger.info("Found " + partyNames.size() + " distinct party names");
        return partyNames;
    }

    // Search for vehicle suggestions
    public List<String> searchVehicleNumbers(String searchTerm) {
        if (searchTerm == null || searchTerm.trim().isEmpty()) {
            return repository.findDistinctVehicleNumbers();
        }
        return repository.findVehicleNumbersContaining(searchTerm.trim());
    }
}