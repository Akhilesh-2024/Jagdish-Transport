package com.example.JagdishTransport.repository;

import com.example.JagdishTransport.model.UserCredential;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserCredentialRepository extends JpaRepository<UserCredential, Long> {
    Optional<UserCredential> findByUsername(String username);
    
    boolean existsByUsername(String username); // ✅ Add this line
}
