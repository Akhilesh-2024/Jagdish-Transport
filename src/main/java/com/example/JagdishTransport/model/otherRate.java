package com.example.JagdishTransport.model;

import jakarta.persistence.*;
import java.util.Date;

@Entity
@Table(name = "other_rate")
public class otherRate {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String type;
    private String category;  // Added category field
    private double companyRate;  // Generic rate field for company
    private double lorryRate;    // Generic rate field for lorry
    
    // Keeping these for backward compatibility
    private double cdCompRate;
    private double cdLorryRate;
    private double waitingCompRate;
    private double waitingLorryRate;

    @Temporal(TemporalType.TIMESTAMP) // Stores date & time
    @Column(name = "created_at", updatable = false)
    private Date createdAt;

    // Automatically set timestamp before persisting
    @PrePersist
    protected void onCreate() {
        this.createdAt = new Date();
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    
    public double getCompanyRate() { return companyRate; }
    public void setCompanyRate(double companyRate) { this.companyRate = companyRate; }
    
    public double getLorryRate() { return lorryRate; }
    public void setLorryRate(double lorryRate) { this.lorryRate = lorryRate; }

    public double getCdCompRate() { return cdCompRate; }
    public void setCdCompRate(double cdCompRate) { this.cdCompRate = cdCompRate; }

    public double getCdLorryRate() { return cdLorryRate; }
    public void setCdLorryRate(double cdLorryRate) { this.cdLorryRate = cdLorryRate; }

    public double getWaitingCompRate() { return waitingCompRate; }
    public void setWaitingCompRate(double waitingCompRate) { this.waitingCompRate = waitingCompRate; }

    public double getWaitingLorryRate() { return waitingLorryRate; }
    public void setWaitingLorryRate(double waitingLorryRate) { this.waitingLorryRate = waitingLorryRate; }

    public Date getCreatedAt() { return createdAt; }
    public void setCreatedAt(Date createdAt) { this.createdAt = createdAt; }
}
