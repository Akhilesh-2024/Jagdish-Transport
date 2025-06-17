package com.example.JagdishTransport.repository;

import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.JagdishTransport.model.PartyMaster;


@Repository
public interface PartyMasterRepository extends JpaRepository<PartyMaster, Long> {
    PartyMaster findByCompanyName(String companyName);
    
    // Search method for parties
    Page<PartyMaster> findByCompanyNameContainingIgnoreCase(String query, Pageable pageable);
    
    // Search method for parties without pagination
    List<PartyMaster> findByCompanyNameContainingIgnoreCase(String query);
}
