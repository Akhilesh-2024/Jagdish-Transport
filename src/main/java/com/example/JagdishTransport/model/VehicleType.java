package com.example.JagdishTransport.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "vehicle_types")
public class VehicleType {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "vehicle_type", nullable = false, unique = true)
    private String vehicleType;

    // Default constructor
    public VehicleType() {
    }
    
    // Constructor with fields
    public VehicleType(String vehicleType) {
        this.vehicleType = vehicleType;
    }
    
    // Getters and setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getVehicleType() {
        return vehicleType;
    }

    public void setVehicleType(String vehicleType) {
        this.vehicleType = vehicleType;
    }
    
    @Override
    public String toString() {
        return "VehicleType{" +
                "id=" + id +
                ", vehicleType='" + vehicleType + '\'' +
                '}';
    }
}