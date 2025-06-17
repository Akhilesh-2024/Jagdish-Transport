package com.example.JagdishTransport.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import java.time.LocalDateTime;

@Entity
@Table(name = "login")
public class Login {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Username is required")
    @Column(nullable = false)
    private String username;

    @NotBlank(message = "Session ID is required")
    @Column(name = "session_id", nullable = false) // 🔁 Renamed column
    private String password; // Internally stores session ID

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Status status;

    @Column(name = "login_timestamp")
    private LocalDateTime loginTimestamp;

    @Column(name = "logout_timestamp")
    private LocalDateTime logoutTimestamp;

    // Enum for login status
    public enum Status {
        LOGIN,
        LOGOUT
    }

    // Constructors
    public Login() {}

    public Login(String username, String sessionId) {
        this.username = username;
        this.password = sessionId;
        this.status = Status.LOGOUT;
    }

    // Getters and Setters
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

    public String getPassword() {
        return password;
    }
    public void setPassword(String password) {
        this.password = password;
    }

    public Status getStatus() {
        return status;
    }
    public void setStatus(Status status) {
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
