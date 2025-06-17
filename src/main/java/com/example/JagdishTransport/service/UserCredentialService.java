package com.example.JagdishTransport.service;

import com.example.JagdishTransport.model.UserCredential;

public interface UserCredentialService {
    UserCredential findByUsername(String username);
    boolean checkPassword(UserCredential user, String rawPassword);
    void updatePassword(UserCredential user, String newPassword);
    boolean validateOTP(String username, String otp);

}
