package com.example.JagdishTransport.service;

import com.example.JagdishTransport.model.UserProfile;
import com.example.JagdishTransport.repository.UserProfileRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Optional;

@Service
public class UserProfileService {

    @Autowired
    private UserProfileRepository userProfileRepository;

    /**
     * Gets the single user profile or creates a new one if none exists
     */
    public UserProfile getOrCreateProfile() {
        UserProfile profile = userProfileRepository.findFirstByOrderByIdAsc();
        if (profile == null) {
            profile = new UserProfile();
            profile = userProfileRepository.save(profile);
        }
        return profile;
    }

    /**
     * Updates the existing profile or creates a new one if none exists
     */
    public UserProfile saveProfile(UserProfile profileData, MultipartFile logoFile) throws IOException {
        UserProfile existingProfile = userProfileRepository.findFirstByOrderByIdAsc();
        
        if (existingProfile != null) {
            // Update existing profile
            updateExistingProfile(existingProfile, profileData);
            
            // Handle logo upload if provided
            if (logoFile != null && !logoFile.isEmpty()) {
                existingProfile.setProfileLogo(logoFile.getBytes());
            }
            
            return userProfileRepository.save(existingProfile);
        } else {
            // Create new profile
            if (logoFile != null && !logoFile.isEmpty()) {
                profileData.setProfileLogo(logoFile.getBytes());
            }
            return userProfileRepository.save(profileData);
        }
    }
    
    /**
     * Update profile without changing the logo
     */
    public UserProfile updateProfileWithoutLogo(UserProfile profileData) {
        UserProfile existingProfile = userProfileRepository.findFirstByOrderByIdAsc();
        
        if (existingProfile != null) {
            // Update existing profile while preserving the logo
            updateExistingProfile(existingProfile, profileData);
            return userProfileRepository.save(existingProfile);
        } else {
            return userProfileRepository.save(profileData);
        }
    }
    
    /**
     * Helper method to update existing profile with new data
     */
    private void updateExistingProfile(UserProfile existingProfile, UserProfile newData) {
        existingProfile.setBusinessName(newData.getBusinessName());
        existingProfile.setOwnerName(newData.getOwnerName());
        existingProfile.setEmail(newData.getEmail());
        existingProfile.setContactNumber(newData.getContactNumber());
        existingProfile.setAddress(newData.getAddress());
        existingProfile.setCountry(newData.getCountry());
        existingProfile.setDescription(newData.getDescription());
    }
}