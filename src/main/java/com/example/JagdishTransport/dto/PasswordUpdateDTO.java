package com.example.JagdishTransport.dto;

public class PasswordUpdateDTO {
    private String username;
    private String oldPassword;
    private String newPassword;
    private String otp;  // ✅ Add this

    // Getters and setters
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getOldPassword() { return oldPassword; }
    public void setOldPassword(String oldPassword) { this.oldPassword = oldPassword; }

    public String getNewPassword() { return newPassword; }
    public void setNewPassword(String newPassword) { this.newPassword = newPassword; }

    public String getOtp() { return otp; }  // ✅ Add getter
    public void setOtp(String otp) { this.otp = otp; }  // ✅ Add setter
}
