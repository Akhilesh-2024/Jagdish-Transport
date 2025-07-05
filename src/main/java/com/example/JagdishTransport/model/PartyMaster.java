package com.example.JagdishTransport.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "party_master")
public class PartyMaster {
	
	
	@Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;
	
	 @Column(nullable = false)
	private String companyName;
	
	 @Column(unique = true)
	private String gstNo;
	
	 @Column(nullable = false)
	 private String address;
	 
	 public PartyMaster() {
	    }
	
	public PartyMaster(Long id, String companyName, String gstNo, String address) {
		super();
		this.id = id;
		this.companyName = companyName;
		this.gstNo = gstNo;
		this.address = address;
	}


	public Long getId() {
		return id;
	}


	public void setId(Long id) {
		this.id = id;
	}


	public String getCompanyName() {
		return companyName;
	}


	public void setCompanyName(String companyName) {
		this.companyName = companyName;
	}


	public String getGstNo() {
		return gstNo;
	}


	public void setGstNo(String gstNo) {
		this.gstNo = gstNo;
	}


	public String getAddress() {
		return address;
	}


	public void setAddress(String address) {
		this.address = address;
	}

}
