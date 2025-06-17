package com.example.JagdishTransport.Controller;

import com.example.JagdishTransport.dto.PasswordUpdateDTO;
import com.example.JagdishTransport.model.UserCredential;
import com.example.JagdishTransport.model.UserProfile;
import com.example.JagdishTransport.repository.UserCredentialRepository;
import com.example.JagdishTransport.service.MailService;
import com.example.JagdishTransport.service.UserCredentialService;
import com.example.JagdishTransport.service.UserProfileService;

import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/credential")
public class UserCredentialController {

    @Autowired
    private UserCredentialService service;
    
    @Autowired
    private final UserCredentialRepository credentialRepository;
    
    @Autowired
    private UserCredentialService userCredentialService;

    @Autowired
    private MailService mailService;
    
    @Autowired
    private UserProfileService userProfileService;
    
    private static final String DEFAULT_EMAIL = "abc@gmail.com";

    @Autowired
    public UserCredentialController(UserCredentialRepository credentialRepository, UserCredentialService service) {
        this.credentialRepository = credentialRepository;
        this.service = service;
    }
    
    // Helper method to get user email with fallback to default
    private String getUserEmail(String username) {
        try {
            // Fetch user profile to get email
            UserProfile profile = userProfileService.getOrCreateProfile();
            String email = profile.getEmail();
            
            // If email is null or empty, use default email
            if (email == null || email.trim().isEmpty()) {
                return DEFAULT_EMAIL;
            }
            return email;
        } catch (Exception e) {
            System.out.println("Error fetching user email: " + e.getMessage());
            return DEFAULT_EMAIL;
        }
    }

    @GetMapping("/username/{username}")
    public ResponseEntity<?> getCredentialByUsername(@PathVariable String username) {
        UserCredential user = service.findByUsername(username);
        if (user != null) {
            return ResponseEntity.ok(user);
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found");
        }
    }

    @PostMapping("/updatePassword")
    public ResponseEntity<String> updatePassword(@RequestBody PasswordUpdateDTO dto) {
        UserCredential user = service.findByUsername(dto.getUsername());
        if (user == null) {
            return ResponseEntity.status(404).body("Username not found");
        }

        if (!service.checkPassword(user, dto.getOldPassword())) {
            return ResponseEntity.badRequest().body("Old password is incorrect");
        }

        service.updatePassword(user, dto.getNewPassword());

        // ✅ Get email from profile or use default
        String email = getUserEmail(user.getUsername());
        mailService.sendPasswordChangeConfirmation(user.getUsername(), email);

        return ResponseEntity.ok("Password updated successfully");
    }

    
    @GetMapping("/all")
    public ResponseEntity<?> getAllUsers() {
        System.out.println("📋 Fetching all credentials:");
        var all = credentialRepository.findAll();
        all.forEach(cred -> System.out.println("🧾 " + cred.getUsername() + " | " + cred.getPassword() + " | " + cred.getLastUpdated()));
        return ResponseEntity.ok(all);
    }
    
    // ✅ Send OTP to default email using temporary store
    @PostMapping("/sendOTP")
    public ResponseEntity<String> sendOtp(@RequestParam String username) {
        UserCredential user = userCredentialService.findByUsername(username);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("❌ User not found");
        }

        // ✅ Get email from profile or use default
        String email = getUserEmail(username);
        mailService.generateAndSendOTP(username, email);

        return ResponseEntity.ok("✅ OTP sent to your registered email.");
    }

    // ✅ Reset password using OTP validation
    @PostMapping("/forgetPassword")
    public ResponseEntity<String> resetPassword(@RequestBody PasswordUpdateDTO dto) {
        UserCredential user = userCredentialService.findByUsername(dto.getUsername());
        if (user == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("❌ User not found");
        }

        boolean isOtpValid = mailService.validateOTP(dto.getUsername(), dto.getOtp());
        if (!isOtpValid) {
            return ResponseEntity.badRequest().body("❌ Invalid OTP");
        }

        userCredentialService.updatePassword(user, dto.getNewPassword());
        mailService.clearOTP(dto.getUsername());

        // ✅ Get email from profile or use default
        String email = getUserEmail(dto.getUsername());
        mailService.sendPasswordChangeConfirmation(user.getUsername(), email);

        return ResponseEntity.ok("✅ Password updated successfully");
    }

    
    @PostMapping("/validateOTP")
    public ResponseEntity<String> validateOtp(@RequestParam String username, @RequestParam String otp) {
        boolean isValid = mailService.validateOTP(username, otp);
        if (isValid) {
            return ResponseEntity.ok("✅ OTP verified");
        } else {
            return ResponseEntity.badRequest().body("❌ Invalid OTP");
        }
    }
}