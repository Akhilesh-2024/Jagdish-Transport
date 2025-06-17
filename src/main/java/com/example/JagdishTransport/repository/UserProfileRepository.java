package com.example.JagdishTransport.repository;

import com.example.JagdishTransport.model.UserProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UserProfileRepository extends JpaRepository<UserProfile, Long> {
    UserProfile findFirstByOrderByIdAsc();
}