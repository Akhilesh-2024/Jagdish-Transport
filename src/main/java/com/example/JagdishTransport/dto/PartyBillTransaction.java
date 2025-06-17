package com.example.JagdishTransport.dto;

import com.example.JagdishTransport.model.PartyBill;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "party_bill_transactions")
public class PartyBillTransaction {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "mr_no")
    private String mrNo;
    
    @Column(name = "transaction_date", nullable = false)
    private LocalDate transactionDate;
    
    @Column(name = "from_location")
    private String fromLocation;
    
    @Column(name = "to_location")
    private String toLocation;
    
    @Column(name = "payment_type")
    private String paymentType;
    
    private Integer trips;
    
    private Double advance;
    
    @Column(name = "lorry_commission")
    private Double lorryCommission;
    
    @Column(name = "lorry_extra")
    private Double lorryExtra;
    
    @Column(name = "lorry_freight")
    private Double lorryFreight;
    
    private Double amount;
    
    @Column(name = "voucher_id")
    private Long voucherId;  // Reference to original trip voucher
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "party_bill_id")
    @JsonIgnore
    private PartyBill partyBill;
    
    // Constructors
    public PartyBillTransaction() {
    }
    
    // Getters and Setters
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

    public LocalDate getTransactionDate() {
        return transactionDate;
    }

    public void setTransactionDate(LocalDate transactionDate) {
        this.transactionDate = transactionDate;
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

    public String getPaymentType() {
        return paymentType;
    }

    public void setPaymentType(String paymentType) {
        this.paymentType = paymentType;
    }

    public Integer getTrips() {
        return trips;
    }

    public void setTrips(Integer trips) {
        this.trips = trips;
    }

    public Double getAdvance() {
        return advance;
    }

    public void setAdvance(Double advance) {
        this.advance = advance;
    }

    public Double getLorryCommission() {
        return lorryCommission;
    }

    public void setLorryCommission(Double lorryCommission) {
        this.lorryCommission = lorryCommission;
    }

    public Double getLorryExtra() {
        return lorryExtra;
    }

    public void setLorryExtra(Double lorryExtra) {
        this.lorryExtra = lorryExtra;
    }

    public Double getLorryFreight() {
        return lorryFreight;
    }

    public void setLorryFreight(Double lorryFreight) {
        this.lorryFreight = lorryFreight;
    }

    public Double getAmount() {
        return amount;
    }

    public void setAmount(Double amount) {
        this.amount = amount;
    }

    public Long getVoucherId() {
        return voucherId;
    }

    public void setVoucherId(Long voucherId) {
        this.voucherId = voucherId;
    }

    public PartyBill getPartyBill() {
        return partyBill;
    }

    public void setPartyBill(PartyBill partyBill) {
        this.partyBill = partyBill;
    }
}