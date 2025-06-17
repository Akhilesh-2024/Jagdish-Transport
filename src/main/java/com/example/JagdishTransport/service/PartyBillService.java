package com.example.JagdishTransport.service;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import com.example.JagdishTransport.model.PartyBill;
import com.example.JagdishTransport.model.PartyBillDetail;

public interface PartyBillService {
    
    /**
     * Request class for bill data from frontend
     */
    public static class PartyBillRequest {
        private String billNo;
        private String partyName;
        private String date;
        private Long partyId;
        private LocalDate billDate;
        private List<PartyBillDetail> details;
        private List<TransactionRequest> transactions;
        private Double totalAmount;
        
        // Getters and setters
        public String getBillNo() {
            return billNo;
        }
        
        public void setBillNo(String billNo) {
            this.billNo = billNo;
        }
        
        public String getPartyName() {
            return partyName;
        }
        
        public void setPartyName(String partyName) {
            this.partyName = partyName;
        }
        
        public String getDate() {
            return date;
        }
        
        public void setDate(String date) {
            this.date = date;
        }
        
        public Long getPartyId() {
            return partyId;
        }
        
        public void setPartyId(Long partyId) {
            this.partyId = partyId;
        }
        
        public LocalDate getBillDate() {
            return billDate;
        }
        
        public void setBillDate(LocalDate billDate) {
            this.billDate = billDate;
        }
        
        public List<PartyBillDetail> getDetails() {
            return details;
        }
        
        public void setDetails(List<PartyBillDetail> details) {
            this.details = details;
        }
        
        public List<TransactionRequest> getTransactions() {
            return transactions;
        }
        
        public void setTransactions(List<TransactionRequest> transactions) {
            this.transactions = transactions;
        }
        
        public Double getTotalAmount() {
            return totalAmount;
        }
        
        public void setTotalAmount(Double totalAmount) {
            this.totalAmount = totalAmount;
        }
    }
    
    /**
     * Request class for transaction data from frontend
     */
    public static class TransactionRequest {
        private Long id;
        private String mrNo;
        private String timestamp;
        private String lorryNo;
        private String fromLocation;
        private String toLocation;
        private String partyName;
        private Integer trips;
        private String vehicleType;
        private Double extra;
        private Double freight;
        private Double amount;
        
        // Getters and setters
        public Long getId() {
            return id;
        }
        
        public void setId(Long id) {
            this.id = id;
        }
        
        public String getMrNo() {
            return mrNo;
        }
        
        public void setMrNo(String mrNo) {
            this.mrNo = mrNo;
        }
        
        public String getTimestamp() {
            return timestamp;
        }
        
        public void setTimestamp(String timestamp) {
            this.timestamp = timestamp;
        }
        
        public String getLorryNo() {
            return lorryNo;
        }
        
        public void setLorryNo(String lorryNo) {
            this.lorryNo = lorryNo;
        }
        
        public String getFromLocation() {
            return fromLocation;
        }
        
        public void setFromLocation(String fromLocation) {
            this.fromLocation = fromLocation;
        }
        
        public String getToLocation() {
            return toLocation;
        }
        
        public void setToLocation(String toLocation) {
            this.toLocation = toLocation;
        }
        
        public String getPartyName() {
            return partyName;
        }
        
        public void setPartyName(String partyName) {
            this.partyName = partyName;
        }
        
        public Integer getTrips() {
            return trips;
        }
        
        public void setTrips(Integer trips) {
            this.trips = trips;
        }
        
        public String getVehicleType() {
            return vehicleType;
        }
        
        public void setVehicleType(String vehicleType) {
            this.vehicleType = vehicleType;
        }
        
        public Double getExtra() {
            return extra;
        }
        
        public void setExtra(Double extra) {
            this.extra = extra;
        }
        
        public Double getFreight() {
            return freight;
        }
        
        public void setFreight(Double freight) {
            this.freight = freight;
        }
        
        public Double getAmount() {
            return amount;
        }
        
        public void setAmount(Double amount) {
            this.amount = amount;
        }
    }
    
    /**
     * Process bill request data into entity
     */
    PartyBill processBillData(PartyBillRequest billRequest);
    
    /**
     * Save a new party bill
     */
    PartyBill saveBill(PartyBill bill);
    
    /**
     * Get all bills
     */
    List<PartyBill> getAllBills();
    
    /**
     * Find bill by ID
     */
    Optional<PartyBill> findById(Long id);
    
    /**
     * Find bill by bill number
     */
    Optional<PartyBill> findByBillNo(String billNo);
    
    /**
     * Check if bill number exists
     */
    boolean existsByBillNo(String billNo);
    
    /**
     * Find bills by party name
     */
    List<PartyBill> findByPartyName(String partyName);
    
    /**
     * Find bills by date range
     */
    List<PartyBill> findByDateRange(LocalDate fromDate, LocalDate toDate);
    
    /**
     * Find bills by party name and date range
     */
    List<PartyBill> findByPartyNameAndDateRange(String partyName, LocalDate fromDate, LocalDate toDate);
    
    /**
     * Find bill details by party and date
     */
    List<PartyBillDetail> findDetailsByPartyAndDate(String partyName, LocalDate fromDate, LocalDate toDate);
    
    /**
     * Update an existing bill
     */
    PartyBill updateBill(Long id, PartyBill bill);
    
    /**
     * Delete a bill
     */
    void deleteBill(Long id);
    
    /**
     * Get most recent bill
     */
    List<PartyBill> getMostRecentBill();
	
	List<String> getAllPartyNames();

}