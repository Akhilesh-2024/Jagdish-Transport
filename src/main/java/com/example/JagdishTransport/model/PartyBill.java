package com.example.JagdishTransport.model;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonManagedReference;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.NamedEntityGraph;
import jakarta.persistence.NamedAttributeNode;
import jakarta.persistence.OneToMany;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;


@Entity
@Table(name = "party_bills")
@NamedEntityGraph(
    name = "PartyBill.withDetails",
    attributeNodes = @NamedAttributeNode("details")
)
public class PartyBill {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "bill_no", unique = true)
    private String billNo;

    @Column(name = "party_name")
    private String partyName;

    // Updated to explicitly allow null values and initialize it to null
    @Column(name = "party_id", nullable = true)
    private Long partyId = null;

    @Column(name = "bill_date")
    private LocalDate billDate;

    // Changed to use JsonManagedReference to properly handle serialization
    @OneToMany(mappedBy = "partyBill", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @JsonManagedReference
    private List<PartyBillDetail> details = new ArrayList<>();

    @Column(name = "total_amount")
    private Double totalAmount;

    // Default constructor explicitly initializing fields
    public PartyBill() {
        this.partyId = null;
        this.totalAmount = 0.0;
    }

    // Getters and setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

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

    public Double getTotalAmount() {
        return totalAmount;
    }

    public void setTotalAmount(Double totalAmount) {
        this.totalAmount = totalAmount;
    }

    // Helper method to calculate total amount from details
    @PrePersist
    @PreUpdate
    public void calculateTotalAmount() {
        if (details != null && !details.isEmpty()) {
            totalAmount = details.stream()
                .mapToDouble(PartyBillDetail::getAmount)
                .sum();
        } else {
            totalAmount = 0.0;
        }
    }
}