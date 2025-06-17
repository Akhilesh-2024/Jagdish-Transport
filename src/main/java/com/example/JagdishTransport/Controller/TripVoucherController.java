package com.example.JagdishTransport.Controller;

import com.example.JagdishTransport.model.TripVoucher;

import com.example.JagdishTransport.service.TripVoucherService;

import ch.qos.logback.core.model.Model;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.logging.Level;
import java.util.logging.Logger;

@RestController
@RequestMapping("/api/trip-vouchers")
@CrossOrigin("*")
public class TripVoucherController {
    
    private static final Logger logger = Logger.getLogger(TripVoucherController.class.getName());

    @Autowired
    private TripVoucherService tripVoucherService;
   

    // Create a new voucher
    @PostMapping
    public ResponseEntity<TripVoucher> createVoucher(@RequestBody TripVoucher voucher) {
        logger.info("Creating new voucher");
        logger.info("Voucher data: " + voucher);
        
        try {
            // Ensure timestamp is preserved if it's set in the request
            if (voucher.getTimestamp() == null) {
                voucher.setTimestamp(LocalDateTime.now());
            }
            
            TripVoucher savedVoucher = tripVoucherService.saveVoucher(voucher);
            logger.info("Voucher created successfully with ID: " + savedVoucher.getId());
            return new ResponseEntity<>(savedVoucher, HttpStatus.CREATED);
        } catch (Exception e) {
            logger.severe("Error creating voucher: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    // Get all vouchers
    @GetMapping
    public ResponseEntity<List<TripVoucher>> getAllVouchers() {
        List<TripVoucher> vouchers = tripVoucherService.getAllVouchers();
        return new ResponseEntity<>(vouchers, HttpStatus.OK);
    }

    // Get voucher by ID
    @GetMapping("/{id}")
    public ResponseEntity<TripVoucher> getVoucherById(@PathVariable Long id) {
        Optional<TripVoucher> voucher = tripVoucherService.getVoucherById(id);
        return voucher.map(value -> new ResponseEntity<>(value, HttpStatus.OK))
                .orElseGet(() -> new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    // Update voucher
    @PutMapping("/{id}")
    public ResponseEntity<TripVoucher> updateVoucher(@PathVariable Long id, @RequestBody TripVoucher voucher) {
        logger.info("Updating voucher with ID: " + id);
        logger.info("Voucher data: " + voucher);
        
        Optional<TripVoucher> existingVoucherOpt = tripVoucherService.getVoucherById(id);
        if (existingVoucherOpt.isPresent()) {
            TripVoucher existingVoucher = existingVoucherOpt.get();
            
            // Set the ID
            voucher.setId(id);
            
            // Preserve the original timestamp if the new one is not provided
            if (voucher.getTimestamp() == null) {
                voucher.setTimestamp(existingVoucher.getTimestamp());
            }
            
            TripVoucher updatedVoucher = tripVoucherService.saveVoucher(voucher);
            logger.info("Voucher updated successfully: " + updatedVoucher);
            return new ResponseEntity<>(updatedVoucher, HttpStatus.OK);
        } else {
            logger.warning("Voucher with ID " + id + " not found");
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    // Delete voucher
    @DeleteMapping("/{id}")
    public ResponseEntity<HttpStatus> deleteVoucher(@PathVariable Long id) {
        try {
            tripVoucherService.deleteVoucher(id);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Filter endpoint for date range and party name with improved error handling
    @GetMapping("/filter")
    public ResponseEntity<?> filterVouchers(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate,
            @RequestParam(required = false) String partyName) {

        try {
            // Enhanced logging for debugging
            logger.info("Filter request received with parameters:");
            logger.info("- fromDate: " + fromDate);
            logger.info("- toDate: " + toDate);
            logger.info("- partyName: " + (partyName != null ? "'" + partyName + "'" : "null"));
            
            // Set default dates if not provided
            if (fromDate == null) {
                fromDate = LocalDate.now().minusMonths(1);
                logger.info("Using default fromDate: " + fromDate);
            }
            
            if (toDate == null) {
                toDate = LocalDate.now();
                logger.info("Using default toDate: " + toDate);
            }
            
            // Validate that fromDate is not after toDate
            if (fromDate.isAfter(toDate)) {
                logger.warning("Invalid date range: fromDate " + fromDate + " is after toDate " + toDate);
                return new ResponseEntity<>(
                    Collections.singletonMap("error", "From date cannot be after To date"), 
                    HttpStatus.BAD_REQUEST
                );
            }

            List<TripVoucher> filteredVouchers;
            
            // Handle party name filtering
            if (partyName != null && !partyName.trim().isEmpty()) {
                // Filter by date range and party name
                logger.info("Filtering by date range and party name: '" + partyName.trim() + "'");
                filteredVouchers = tripVoucherService.getVouchersByDateRangeAndPartyName(
                        fromDate, toDate, partyName.trim());
            } else {
                // Filter by date range only
                logger.info("Filtering by date range only");
                filteredVouchers = tripVoucherService.getVouchersByDateRange(
                        fromDate.atStartOfDay(), toDate.atTime(LocalTime.MAX));
            }
            
            logger.info("Found " + filteredVouchers.size() + " vouchers matching the criteria");
            return new ResponseEntity<>(filteredVouchers, HttpStatus.OK);
            
        } catch (Exception e) {
            logger.log(Level.SEVERE, "Error in filterVouchers: " + e.getMessage(), e);
            return new ResponseEntity<>(
                Collections.singletonMap("error", "An error occurred while filtering vouchers: " + e.getMessage()), 
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    // Get all distinct vehicle numbers
    @GetMapping("/vehicles")
    public ResponseEntity<List<String>> getAllVehicleNumbers() {
        List<String> vehicleNumbers = tripVoucherService.getAllUniqueVehicleNumbers();
        return new ResponseEntity<>(vehicleNumbers, HttpStatus.OK);
    }
    
    // Get all distinct party names
    @GetMapping("/parties")
    public ResponseEntity<List<String>> getAllPartyNames() {
        try {
            logger.info("Request received for all distinct party names");
            List<String> partyNames = tripVoucherService.getAllDistinctPartyNames();
            logger.info("Returning " + partyNames.size() + " party names");
            return new ResponseEntity<>(partyNames, HttpStatus.OK);
        } catch (Exception e) {
            logger.log(Level.SEVERE, "Error fetching party names: " + e.getMessage(), e);
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Search for vehicle numbers
    @GetMapping("/vehicles/search")
    public ResponseEntity<List<String>> searchVehicleNumbers(@RequestParam String term) {
        List<String> vehicleNumbers = tripVoucherService.searchVehicleNumbers(term);
        return new ResponseEntity<>(vehicleNumbers, HttpStatus.OK);
    }
}