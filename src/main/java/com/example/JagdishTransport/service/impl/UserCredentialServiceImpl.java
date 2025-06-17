package com.example.JagdishTransport.service.impl;

import com.example.JagdishTransport.model.UserCredential;
import com.example.JagdishTransport.repository.UserCredentialRepository;
import com.example.JagdishTransport.service.MailService;
import com.example.JagdishTransport.service.UserCredentialService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class UserCredentialServiceImpl implements UserCredentialService {

    @Autowired
    private UserCredentialRepository credentialRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private MailService mailService; // ✅ Inject MailService here

    @Override
    public UserCredential findByUsername(String username) {
        return credentialRepository.findByUsername(username).orElse(null);
    }

    @Override
    public boolean checkPassword(UserCredential user, String rawPassword) {
        return passwordEncoder.matches(rawPassword, user.getPassword());
    }

    @Override
    public void updatePassword(UserCredential user, String newPassword) {
        user.setPassword(passwordEncoder.encode(newPassword));
        user.setLastUpdated(LocalDateTime.now());
        credentialRepository.save(user);
    }

    @Override
    public boolean validateOTP(String username, String otp) {
        return mailService.validateOTP(username, otp); // ✅ Delegating to MailService
    }
}
