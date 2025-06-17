package com.example.JagdishTransport.service.impl;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.JagdishTransport.model.PartyBill;
import com.example.JagdishTransport.model.PartyBillDetail;
import com.example.JagdishTransport.repository.PartyBillDetailRepository;
import com.example.JagdishTransport.repository.PartyBillRepository;
import com.example.JagdishTransport.service.PartyBillService;
import com.example.JagdishTransport.service.PartyBillService.PartyBillRequest;
import com.example.JagdishTransport.service.PartyBillService.TransactionRequest;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;

@Service
public class PartyBillServiceImpl implements PartyBillService {
    
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd");
    
    @Autowired
    private PartyBillRepository partyBillRepository;
    
    @Autowired
    private PartyBillDetailRepository partyBillDetailRepository;
    
    @PersistenceContext
    private EntityManager entityManager;
    
    @Override
    @Transactional
    public PartyBill processBillData(PartyBillRequest request) {
        // Create the main bill
        PartyBill bill = new PartyBill();
        bill.setBillNo(request.getBillNo());
        bill.setPartyName(request.getPartyName());
        
        // Handle partyId properly - explicitly set to null if no value provided
        bill.setPartyId(request.getPartyId());
        
        // Check if we have a direct billDate or need to parse from date string
        LocalDate billDate;
        if (request.getBillDate() != null) {
            billDate = request.getBillDate();
        } else {
            // Parse date string to LocalDate
            try {
                if (request.getDate() != null && !request.getDate().isEmpty()) {
                    // Handle ISO date format from frontend
                    if (request.getDate().contains("T")) {
                        billDate = LocalDate.parse(request.getDate().split("T")[0]);
                    } else {
                        billDate = LocalDate.parse(request.getDate(), DATE_FORMATTER);
                    }
                } else {
                    // Default to today if no date provided
                    billDate = LocalDate.now();
                }
            } catch (Exception e) {
                // Default to today if date parsing fails
                billDate = LocalDate.now();
            }
        }
        
        bill.setBillDate(billDate);
        
        // Handle direct details if they exist
        if (request.getDetails() != null && !request.getDetails().isEmpty()) {
            List<PartyBillDetail> details = new ArrayList<>();
            for (PartyBillDetail detailRequest : request.getDetails()) {
                PartyBillDetail detail = new PartyBillDetail();
                detail.setMrNo(detailRequest.getMrNo());
                detail.setLorryNo(detailRequest.getLorryNo());
                detail.setFromLocation(detailRequest.getFromLocation());
                detail.setToLocation(detailRequest.getToLocation());
                detail.setVehicleType(detailRequest.getVehicleType());
                detail.setTripDate(detailRequest.getTripDate());
                detail.setTrips(detailRequest.getTrips());
                detail.setFreight(detailRequest.getFreight());
                detail.setExtra(detailRequest.getExtra());
                detail.setAmount(detailRequest.getAmount());
                detail.setTripVoucherId(detailRequest.getTripVoucherId());
                detail.setPartyBill(bill);
                details.add(detail);
            }
            bill.setDetails(details);
        }
        // Process each transaction into a bill detail if transactions exist
        else if (request.getTransactions() != null && !request.getTransactions().isEmpty()) {
            List<PartyBillDetail> details = new ArrayList<>();
            for (TransactionRequest tx : request.getTransactions()) {
                PartyBillDetail detail = new PartyBillDetail();
                
                // Set basic info
                detail.setMrNo(tx.getMrNo());
                
                // Parse transaction date
                try {
                    if (tx.getTimestamp() != null && !tx.getTimestamp().isEmpty()) {
                        // Handle ISO date format
                        if (tx.getTimestamp().contains("T")) {
                            detail.setTripDate(LocalDate.parse(tx.getTimestamp().split("T")[0]));
                        } else {
                            detail.setTripDate(LocalDate.parse(tx.getTimestamp(), DATE_FORMATTER));
                        }
                    } else {
                        // Default to bill date if no transaction date
                        detail.setTripDate(billDate);
                    }
                } catch (Exception e) {
                    // Default to bill date if parsing fails
                    detail.setTripDate(billDate);
                }
                
                // Set other fields from transaction
                detail.setLorryNo(tx.getLorryNo());
                detail.setFromLocation(tx.getFromLocation());
                detail.setToLocation(tx.getToLocation());
                detail.setTrips(tx.getTrips() != null ? tx.getTrips() : 1);
                detail.setVehicleType(tx.getVehicleType());
                detail.setExtra(tx.getExtra() != null ? tx.getExtra() : 0.0);
                detail.setFreight(tx.getFreight() != null ? tx.getFreight() : 0.0);
                detail.setAmount(tx.getAmount() != null ? tx.getAmount() : 0.0);
                
                // If amount is not provided, calculate it
                if (detail.getAmount() == 0.0) {
                    detail.calculateAmount();
                }
                
                // Set original trip voucher ID if available
                if (tx.getId() != null) {
                    detail.setTripVoucherId(tx.getId());
                }
                
                // Set relationship with parent
                detail.setPartyBill(bill);
                details.add(detail);
            }
            bill.setDetails(details);
        }
        
        // Calculate total amount
        bill.calculateTotalAmount();
        
        return bill;
    }
    
    @Override
    @Transactional
    public PartyBill saveBill(PartyBill bill) {
        // Check if bill number already exists
        if (partyBillRepository.existsByBillNo(bill.getBillNo())) {
            throw new RuntimeException("Bill number already exists: " + bill.getBillNo());
        }
        
        // Calculate total amount to ensure it's correct
        bill.calculateTotalAmount();
        
        PartyBill savedBill = partyBillRepository.save(bill);
        entityManager.flush(); // Force immediate persistence
        
        // Clear entity manager cache to force fresh load
        entityManager.clear();
        
        return savedBill;
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<PartyBill> getAllBills() {
        return partyBillRepository.findAll();
    }
    
    @Override
    @Transactional(readOnly = true)
    public Optional<PartyBill> findById(Long id) {
        return partyBillRepository.findById(id);
    }
    
    @Override
    @Transactional
    public PartyBill updateBill(Long id, PartyBill updatedBill) {
        Optional<PartyBill> existingBillOpt = partyBillRepository.findById(id);
        
        if (!existingBillOpt.isPresent()) {
            throw new RuntimeException("Bill not found with id: " + id);
        }
        
        PartyBill existingBill = existingBillOpt.get();
        
        // Update bill fields
        existingBill.setBillNo(updatedBill.getBillNo());
        existingBill.setPartyName(updatedBill.getPartyName());
        existingBill.setBillDate(updatedBill.getBillDate());
        
        // Explicitly set partyId, even if null
        existingBill.setPartyId(updatedBill.getPartyId());
        
        // Clear existing details and add new ones
        if (existingBill.getDetails() != null) {
            for (PartyBillDetail detail : existingBill.getDetails()) {
                detail.setPartyBill(null);  // Detach from parent
            }
            existingBill.getDetails().clear();
        }
        
        // Add updated details
        if (updatedBill.getDetails() != null) {
            for (PartyBillDetail detail : updatedBill.getDetails()) {
                detail.setPartyBill(existingBill);
                existingBill.getDetails().add(detail);
            }
        }
        
        // Recalculate total amount
        existingBill.calculateTotalAmount();
        
        PartyBill saved = partyBillRepository.save(existingBill);
        entityManager.flush(); // Force immediate persistence
        entityManager.clear(); // Clear cache to force fresh load
        
        return saved;
    }
    
    @Override
    @Transactional(readOnly = true)
    public Optional<PartyBill> findByBillNo(String billNo) {
        return partyBillRepository.findByBillNo(billNo);
    }
    
    @Override
    @Transactional(readOnly = true)
    public boolean existsByBillNo(String billNo) {
        return partyBillRepository.existsByBillNo(billNo);
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<PartyBill> findByPartyName(String partyName) {
        return partyBillRepository.findByPartyNameContainingIgnoreCase(partyName);
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<PartyBill> findByDateRange(LocalDate fromDate, LocalDate toDate) {
        return partyBillRepository.findByBillDateBetween(fromDate, toDate);
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<PartyBill> findByPartyNameAndDateRange(String partyName, LocalDate fromDate, LocalDate toDate) {
        return partyBillRepository.findByPartyNameContainingIgnoreCaseAndBillDateBetween(partyName, fromDate, toDate);
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<PartyBillDetail> findDetailsByPartyAndDate(String partyName, LocalDate fromDate, LocalDate toDate) {
        return partyBillDetailRepository.findByPartyBill_PartyNameAndTripDateBetween(partyName, fromDate, toDate);
    }
    
    @Override
    @Transactional
    public void deleteBill(Long id) {
        // First delete details to avoid orphaned records
        partyBillDetailRepository.deleteByPartyBillId(id);
        // Then delete the bill
        partyBillRepository.deleteById(id);
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<PartyBill> getMostRecentBill() {
        return partyBillRepository.findMostRecentBill();
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<String> getAllPartyNames() {
        return partyBillRepository.findAll()
                .stream()
                .map(PartyBill::getPartyName)
                .distinct()
                .toList();
    }
}