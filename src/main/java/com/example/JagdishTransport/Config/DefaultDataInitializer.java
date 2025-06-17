package com.example.JagdishTransport.Config;

import com.example.JagdishTransport.model.UserCredential;
import com.example.JagdishTransport.repository.UserCredentialRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDateTime;

@Configuration
public class DefaultDataInitializer {

    @Bean
    public CommandLineRunner insertDefaultUser(UserCredentialRepository repository, PasswordEncoder passwordEncoder) {
        return args -> {
            String defaultUsername = "atharva";
            String defaultPassword = "atharva123";

            if (!repository.existsByUsername(defaultUsername)) {
                UserCredential user = new UserCredential();
                user.setUsername(defaultUsername);
                user.setPassword(passwordEncoder.encode(defaultPassword)); // 🔐 encode
                user.setLastUpdated(LocalDateTime.now());

                repository.save(user);
                System.out.println("✅ Default admin user added (username: admin, password: admin123)");
            } else {
                System.out.println("ℹ️ Admin user already exists.");
            }
        };
    }
}