package com.example.JagdishTransport.model;

import java.time.LocalDate;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "area_master")
public class AreaMaster {
	@Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;
	
	@Column(name = "area_name", nullable = false)
	private String areaName;
	private String vehicleType;
    private String partyName;
    private Double companyRate;
    private Double lorryRate;
    private LocalDate areaDate;
    private String fromLocation;
    private String toLocation;
    
    
    public AreaMaster() {}

    public AreaMaster(String areaName, String vehicleType, String partyName, Double companyRate, Double lorryRate, LocalDate areaDate, String fromLocation, String toLocation) {
        this.areaName = areaName;
        this.vehicleType = vehicleType;
        this.partyName = partyName;
        this.companyRate = companyRate;
        this.lorryRate = lorryRate;
        this.areaDate = areaDate;
        this.fromLocation = fromLocation;
        this.toLocation = toLocation;
    }
	
    public Long getId() {
		return id;
	}
	public void setId(Long id) {
		this.id = id;
	}
	public String getAreaName() {
		return areaName;
	}
	public void setAreaName(String areaName) {
		this.areaName = areaName;
	}
	public String getVehicleType() {
		return vehicleType;
	}
	public void setVehicleType(String vehicleType) {
		this.vehicleType = vehicleType;
	}
	public String getPartyName() {
		return partyName;
	}
	public void setPartyName(String partyName) {
		this.partyName = partyName;
	}
	public Double getCompanyRate() {
		return companyRate;
	}
	public void setCompanyRate(Double companyRate) {
		this.companyRate = companyRate;
	}
	public Double getLorryRate() {
		return lorryRate;
	}
	public void setLorryRate(Double lorryRate) {
		this.lorryRate = lorryRate;
	}

	public LocalDate getAreaDate() {
		return areaDate;
	}

	public void setAreaDate(LocalDate areaDate) {
		this.areaDate = areaDate;
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

}
