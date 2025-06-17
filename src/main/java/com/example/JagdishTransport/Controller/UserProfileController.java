package com.example.JagdishTransport.Controller;

import com.example.JagdishTransport.model.UserProfile;
import com.example.JagdishTransport.service.UserProfileService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Base64;
import java.util.HashMap;
import java.util.Map;

@Controller
@RequestMapping("/profile")
public class UserProfileController {

    @Autowired
    private UserProfileService userProfileService;

    @GetMapping
    public String getProfilePage(Model model) {
        UserProfile profile = userProfileService.getOrCreateProfile();
        model.addAttribute("profile", profile);
        
        // Convert logo to Base64 for display if exists
        if (profile.getProfileLogo() != null && profile.getProfileLogo().length > 0) {
            String base64Logo = Base64.getEncoder().encodeToString(profile.getProfileLogo());
            model.addAttribute("logoBase64", base64Logo);
        }
        
        return "profile"; // return the profile.html template
    }
    
    @GetMapping("/data")
    @ResponseBody
    public ResponseEntity<UserProfile> getProfileData() {
        UserProfile profile = userProfileService.getOrCreateProfile();
        return ResponseEntity.ok(profile);
    }
    
    @GetMapping("/logo")
    public ResponseEntity<byte[]> getProfileLogo() {
        UserProfile profile = userProfileService.getOrCreateProfile();
        
        if (profile.getProfileLogo() != null && profile.getProfileLogo().length > 0) {
            return ResponseEntity
                    .ok()
                    .contentType(MediaType.IMAGE_JPEG)
                    .body(profile.getProfileLogo());
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/save")
    @ResponseBody
    public ResponseEntity<?> saveProfile(
            @RequestParam(required = false) String businessName,
            @RequestParam(required = false) String ownerName,
            @RequestParam(required = false) String email,
            @RequestParam(required = false) String contactNumber,
            @RequestParam(required = false) String address,
            @RequestParam(required = false) String country,
            @RequestParam(required = false) String description,
            @RequestParam(required = false) MultipartFile profileLogo) {
        
        try {
            UserProfile profileData = new UserProfile();
            profileData.setBusinessName(businessName);
            profileData.setOwnerName(ownerName);
            profileData.setEmail(email);
            profileData.setContactNumber(contactNumber);
            profileData.setAddress(address);
            profileData.setCountry(country);
            profileData.setDescription(description);
            
            UserProfile savedProfile = userProfileService.saveProfile(profileData, profileLogo);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Profile saved successfully!");
            response.put("profile", savedProfile);
            
            return ResponseEntity.ok(response);
        } catch (IOException e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Error saving profile: " + e.getMessage());
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
    
    @PutMapping("/update")
    @ResponseBody
    public ResponseEntity<?> updateProfile(@RequestBody UserProfile profile) {
        try {
            UserProfile updatedProfile = userProfileService.updateProfileWithoutLogo(profile);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Profile updated successfully!");
            response.put("profile", updatedProfile);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Error updating profile: " + e.getMessage());
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
    
    @PostMapping("/update/business-name")
    @ResponseBody
    public ResponseEntity<?> updateBusinessName(@RequestParam String businessName) {
        try {
            UserProfile profile = userProfileService.getOrCreateProfile();
            profile.setBusinessName(businessName);
            userProfileService.updateProfileWithoutLogo(profile);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Business name updated successfully!");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Error updating business name: " + e.getMessage());
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
}