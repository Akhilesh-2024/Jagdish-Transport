package com.example.JagdishTransport.model;

import jakarta.persistence.*;
import java.util.Date;

@Entity
@Table(name = "bill_settings")
public class BillSettings {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = true) // Can be NULL when autoGenerate is OFF
    private String prefix;

    @Column(nullable = true) // Can be NULL when autoGenerate is OFF
    private Integer startNumber;

    @Column(nullable = false)
    private boolean autoGenerate;

    @Temporal(TemporalType.TIMESTAMP)
    @Column(nullable = false, updatable = false)
    private Date createdAt;

    // Default constructor
    public BillSettings() {}

    // Parameterized constructor
    public BillSettings(String prefix, Integer startNumber, boolean autoGenerate) {
        this.prefix = prefix;
        this.startNumber = startNumber;
        this.autoGenerate = autoGenerate;
    }

    @PrePersist
    protected void onCreate() {
        this.createdAt = new Date(); // Set timestamp when record is created
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public String getPrefix() {
        return prefix;
    }

    public void setPrefix(String prefix) {
        this.prefix = prefix;
    }

    public Integer getStartNumber() {
        return startNumber;
    }

    public void setStartNumber(Integer startNumber) {
        this.startNumber = startNumber;
    }

    public boolean isAutoGenerate() {
        return autoGenerate;
    }

    public void setAutoGenerate(boolean autoGenerate) {
        this.autoGenerate = autoGenerate;
    }

    public Date getCreatedAt() {
        return createdAt;
    }

    @Override
    public String toString() {
        return "BillSettings{" +
                "id=" + id +
                ", prefix='" + prefix + '\'' +
                ", startNumber=" + startNumber +
                ", autoGenerate=" + autoGenerate +
                ", createdAt=" + createdAt +
                '}';
    }
}
