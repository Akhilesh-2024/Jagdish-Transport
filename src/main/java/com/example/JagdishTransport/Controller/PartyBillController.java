package com.example.JagdishTransport.Controller;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.JagdishTransport.model.PartyBill;
import com.example.JagdishTransport.model.PartyBillDetail;
import com.example.JagdishTransport.service.PartyBillService;
import com.example.JagdishTransport.service.PartyBillService.PartyBillRequest;

@RestController
@RequestMapping("/api/party-bills")
public class PartyBillController {
    
    @Autowired
    private PartyBillService partyBillService;
    
    /**
     * Save a new party bill
     */
    @PostMapping("/save")
    public ResponseEntity<?> saveBill(@RequestBody PartyBillRequest billRequest) {
        try {
            // Convert request to entity
            PartyBill bill = partyBillService.processBillData(billRequest);
            
            // Save the bill
            PartyBill savedBill = partyBillService.saveBill(bill);
            
            // Refresh the entity to ensure all fields are loaded
            savedBill = partyBillService.findById(savedBill.getId()).orElse(savedBill);
            
            return ResponseEntity.ok(savedBill);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("message", "Failed to save bill: " + e.getMessage());
            errorResponse.put("status", "error");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
    
    /**
     * Get all bills with details eagerly fetched
     */
    @GetMapping
    public ResponseEntity<List<PartyBill>> getAllBills() {
        List<PartyBill> bills = partyBillService.getAllBills();
        return ResponseEntity.ok(bills);
    }
    
    /**
     * Get all unique party names
     */
    @GetMapping("/parties")
    public ResponseEntity<List<String>> getAllParties() {
        List<String> partyNames = partyBillService.getAllPartyNames();
        return ResponseEntity.ok(partyNames);
    }
    
    /**
     * Get bill by ID with details eagerly fetched
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> getBillById(@PathVariable Long id) {
        Optional<PartyBill> bill = partyBillService.findById(id);
        
        if (bill.isPresent()) {
            return ResponseEntity.ok(bill.get());
        } else {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("message", "Bill not found with id: " + id);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResponse);
        }
    }
    
    /**
     * Filter bills by party name and/or date range
     * Ensures details are eagerly fetched
     */
    @GetMapping("/filter")
    public ResponseEntity<List<PartyBill>> filterBills(
            @RequestParam(required = false) String partyName,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate) {
        
        List<PartyBill> bills;
        
        if (partyName != null && !partyName.trim().isEmpty()) {
            if (fromDate != null && toDate != null) {
                bills = partyBillService.findByPartyNameAndDateRange(partyName, fromDate, toDate);
            } else {
                bills = partyBillService.findByPartyName(partyName);
            }
        } else if (fromDate != null && toDate != null) {
            bills = partyBillService.findByDateRange(fromDate, toDate);
        } else {
            bills = partyBillService.getAllBills();
        }
        
        return ResponseEntity.ok(bills);
    }
    
    /**
     * Update an existing bill
     */
    @PutMapping("/{id}")
    public ResponseEntity<?> updateBill(@PathVariable Long id, @RequestBody PartyBillRequest billRequest) {
        try {
            // Convert request to entity
            PartyBill bill = partyBillService.processBillData(billRequest);
            
            // Update the bill
            PartyBill updatedBill = partyBillService.updateBill(id, bill);
            
            // Refresh the entity to ensure all fields are loaded
            updatedBill = partyBillService.findById(updatedBill.getId()).orElse(updatedBill);
            
            return ResponseEntity.ok(updatedBill);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("message", "Failed to update bill: " + e.getMessage());
            errorResponse.put("status", "error");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
}
