package com.example.JagdishTransport.dto;

import com.example.JagdishTransport.model.UserProfile;
import java.util.Date;

public class UserProfileDTO {
    private Long id;
    private String businessName;
    private String ownerName;
    private String email;
    private String contactNumber;
    private String address;
    private String country;
    private String description;
    private Date createdAt; // ✅ Corrected name and used consistently

    // No logo field to avoid sending binary data via JSON

    // ✅ Default constructor
    public UserProfileDTO() {}

    // ✅ Constructor from UserProfile entity
    public UserProfileDTO(UserProfile userProfile) {
        this.id = userProfile.getId();
        this.businessName = userProfile.getBusinessName();
        this.ownerName = userProfile.getOwnerName();
        this.email = userProfile.getEmail();
        this.contactNumber = userProfile.getContactNumber();
        this.address = userProfile.getAddress();
        this.country = userProfile.getCountry();
        this.description = userProfile.getDescription();
        this.createdAt = userProfile.getCreatedAt(); 
    }

    // ✅ Convert DTO to Entity
    public UserProfile toEntity() {
        UserProfile profile = new UserProfile();
        profile.setId(this.id);
        profile.setBusinessName(this.businessName);
        profile.setOwnerName(this.ownerName);
        profile.setEmail(this.email);
        profile.setContactNumber(this.contactNumber);
        profile.setAddress(this.address);
        profile.setCountry(this.country);
        profile.setDescription(this.description);
        profile.setCreatedAt(this.createdAt != null ? this.createdAt : new Date()); // fallback to now
        return profile;
    }

    // ✅ Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getBusinessName() { return businessName; }
    public void setBusinessName(String businessName) { this.businessName = businessName; }

    public String getOwnerName() { return ownerName; }
    public void setOwnerName(String ownerName) { this.ownerName = ownerName; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getContactNumber() { return contactNumber; }
    public void setContactNumber(String contactNumber) { this.contactNumber = contactNumber; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public String getCountry() { return country; }
    public void setCountry(String country) { this.country = country; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Date getCreatedAt() { return createdAt; }
    public void setCreatedAt(Date createdAt) { this.createdAt = createdAt; }
}
