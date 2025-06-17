package com.example.JagdishTransport.model;

import java.time.LocalDate;

import com.fasterxml.jackson.annotation.JsonBackReference;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;


@Entity
@Table(name = "party_bill_details")
public class PartyBillDetail {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "party_bill_id")
    @JsonBackReference
    private PartyBill partyBill;

    @Column(name = "mr_no")
    private String mrNo;

    @Column(name = "lorry_no")
    private String lorryNo;

    @Column(name = "from_location")
    private String fromLocation;

    @Column(name = "to_location")
    private String toLocation;

    @Column(name = "vehicle_type")
    private String vehicleType;

    @Column(name = "trip_date")
    private LocalDate tripDate;

    @Column(name = "trips")
    private Integer trips;

    @Column(name = "freight")
    private Double freight;

    @Column(name = "extra")
    private Double extra;

    @Column(name = "amount")
    private Double amount;

    @Column(name = "trip_voucher_id", nullable = true)
    private Long tripVoucherId;

    // Default constructor with initializations
    public PartyBillDetail() {
        this.trips = 1;
        this.freight = 0.0;
        this.extra = 0.0;
        this.amount = 0.0;
    }

    // Getters and setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public PartyBill getPartyBill() {
        return partyBill;
    }

    public void setPartyBill(PartyBill partyBill) {
        this.partyBill = partyBill;
    }

    public String getMrNo() {
        return mrNo;
    }

    public void setMrNo(String mrNo) {
        this.mrNo = mrNo;
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

    public String getVehicleType() {
        return vehicleType;
    }

    public void setVehicleType(String vehicleType) {
        this.vehicleType = vehicleType;
    }

    public LocalDate getTripDate() {
        return tripDate;
    }

    public void setTripDate(LocalDate tripDate) {
        this.tripDate = tripDate;
    }

    public Integer getTrips() {
        return trips;
    }

    public void setTrips(Integer trips) {
        this.trips = trips != null ? trips : 1;
    }

    public Double getFreight() {
        return freight;
    }

    public void setFreight(Double freight) {
        this.freight = freight != null ? freight : 0.0;
    }

    public Double getExtra() {
        return extra;
    }

    public void setExtra(Double extra) {
        this.extra = extra != null ? extra : 0.0;
    }

    public Double getAmount() {
        return amount;
    }

    public void setAmount(Double amount) {
        this.amount = amount != null ? amount : 0.0;
    }

    public Long getTripVoucherId() {
        return tripVoucherId;
    }

    public void setTripVoucherId(Long tripVoucherId) {
        this.tripVoucherId = tripVoucherId;
    }

    // Calculate amount based on freight and extra
    @PrePersist
    @PreUpdate
    public void calculateAmount() {
        if (freight == null) freight = 0.0;
        if (extra == null) extra = 0.0;
        if (trips == null) trips = 1;

        amount = (freight + extra) * trips;
    }
}