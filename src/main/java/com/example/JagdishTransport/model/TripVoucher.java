package com.example.JagdishTransport.model;

import jakarta.persistence.*;
import lombok.*;

import java.io.Serializable;
import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "trip_vouchers")
public class TripVoucher implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, updatable = false)
    private LocalDateTime timestamp;
    
    private String mrNo;
    private String vehicleNo;
    private String vehicleType;
    private String paymentType;
    private String fromLocation;
    private String toLocation;
    private String toBeBilled;
    private String areaName;
    private Double waitingHrs;
    private Double cdwt;
    private Integer trips;
    private Double freight;
    private Double companyWaiting;
    private Double companyCDWT;
    private Double khoti;
    private Double hamali;
    private Double extra;
    private Double serviceTax;
    private Double totalAmount;
    private Double lorryFreight;
    private Double lorryWaiting;
    private Double lorryCDWT;
    // New fields
    private Double lorryAmount;
    private Double lorryCommission;
    private Double lorryExtra;
    private Double advance;
    private String billNumber;

    // Automatically set timestamp before saving to database only if it's not already set
    @PrePersist
    protected void onCreate() {
        if (this.timestamp == null) {
            this.timestamp = LocalDateTime.now();
        }
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }


    public String getVehicleNo() {
        return vehicleNo;
    }

    public void setVehicleNo(String vehicleNo) {
        this.vehicleNo = vehicleNo;
    }

    public String getVehicleType() {
        return vehicleType;
    }

    public void setVehicleType(String vehicleType) {
        this.vehicleType = vehicleType;
    }

    public String getPaymentType() {
        return paymentType;
    }

    public void setPaymentType(String paymentType) {
        this.paymentType = paymentType;
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

    public String getToBeBilled() {
        return toBeBilled;
    }

    public void setToBeBilled(String toBeBilled) {
        this.toBeBilled = toBeBilled;
    }

    public String getAreaName() {
        return areaName;
    }

    public void setAreaName(String areaName) {
        this.areaName = areaName;
    }

    public Double getWaitingHrs() {
        return waitingHrs;
    }

    public void setWaitingHrs(Double waitingHrs) {
        this.waitingHrs = waitingHrs;
    }

    public Double getCdwt() {
        return cdwt;
    }

    public void setCdwt(Double cdwt) {
        this.cdwt = cdwt;
    }

    public Integer getTrips() {
        return trips;
    }

    public void setTrips(Integer trips) {
        this.trips = trips;
    }

    public Double getFreight() {
        return freight;
    }

    public void setFreight(Double freight) {
        this.freight = freight;
    }

    public Double getCompanyWaiting() {
        return companyWaiting;
    }

    public void setCompanyWaiting(Double companyWaiting) {
        this.companyWaiting = companyWaiting;
    }

    public Double getCompanyCDWT() {
        return companyCDWT;
    }

    public void setCompanyCDWT(Double companyCDWT) {
        this.companyCDWT = companyCDWT;
    }

    public Double getKhoti() {
        return khoti;
    }

    public void setKhoti(Double khoti) {
        this.khoti = khoti;
    }

    public Double getHamali() {
        return hamali;
    }

    public void setHamali(Double hamali) {
        this.hamali = hamali;
    }

    public Double getExtra() {
        return extra;
    }

    public void setExtra(Double extra) {
        this.extra = extra;
    }

    public Double getLorryFreight() {
        return lorryFreight;
    }

    public void setLorryFreight(Double lorryFreight) {
        this.lorryFreight = lorryFreight;
    }

    public Double getLorryWaiting() {
        return lorryWaiting;
    }

    public void setLorryWaiting(Double lorryWaiting) {
        this.lorryWaiting = lorryWaiting;
    }

    public Double getLorryCDWT() {
        return lorryCDWT;
    }

    public void setLorryCDWT(Double lorryCDWT) {
        this.lorryCDWT = lorryCDWT;
    }

    // New getter and setter methods
    public Double getLorryAmount() {
        return lorryAmount;
    }

    public void setLorryAmount(Double lorryAmount) {
        this.lorryAmount = lorryAmount;
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
    
    public Double getAdvance() {
        return advance;
    }

    public void setAdvance(Double advance) {
        this.advance = advance;
    }

    public String getInvoiceNumber() {
        return billNumber;
    }

    public void setInvoiceNumber(String invoiceNumber) {
        this.billNumber = invoiceNumber;
    }

	public Double getServiceTax() {
		return serviceTax;
	}

	public void setServiceTax(Double serviceTax) {
		this.serviceTax = serviceTax;
	}

	public Double getTotalAmount() {
		return totalAmount;
	}

	public void setTotalAmount(Double totalAmount) {
		this.totalAmount = totalAmount;
	}

	public String getBillNumber() {
		return billNumber;
	}

	public void setBillNumber(String billNumber) {
		this.billNumber = billNumber;
	}

	public String getMrNo() {
		return mrNo;
	}

	public void setMrNo(String mrNo) {
		this.mrNo = mrNo;
	}
}