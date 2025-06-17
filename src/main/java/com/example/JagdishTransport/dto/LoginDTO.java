package com.example.JagdishTransport.dto;

import com.example.JagdishTransport.model.Login;

import java.time.LocalDateTime;

public class LoginDTO {
    private Long id;
    private String username;
    private String status;
    private LocalDateTime loginTimestamp;
    private LocalDateTime logoutTimestamp;

    public LoginDTO(Login login) {
        this.id = login.getId();
        this.username = login.getUsername();
        this.status = login.getStatus().name();
        this.loginTimestamp = login.getLoginTimestamp();
        this.logoutTimestamp = login.getLogoutTimestamp();
    }

    // Getters and setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public LocalDateTime getLoginTimestamp() {
        return loginTimestamp;
    }

    public void setLoginTimestamp(LocalDateTime loginTimestamp) {
        this.loginTimestamp = loginTimestamp;
    }

    public LocalDateTime getLogoutTimestamp() {
        return logoutTimestamp;
    }

    public void setLogoutTimestamp(LocalDateTime logoutTimestamp) {
        this.logoutTimestamp = logoutTimestamp;
    }
}
