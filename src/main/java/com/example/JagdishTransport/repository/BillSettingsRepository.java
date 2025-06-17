package com.example.JagdishTransport.repository;

import com.example.JagdishTransport.model.BillSettings;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface BillSettingsRepository extends JpaRepository<BillSettings, Long> {

    // Fetch the latest record (highest id)
    Optional<BillSettings> findTopByOrderByIdDesc();

    // Fetch the latest record where autoGenerate is true
    Optional<BillSettings> findFirstByAutoGenerateTrueOrderByIdDesc();
}
