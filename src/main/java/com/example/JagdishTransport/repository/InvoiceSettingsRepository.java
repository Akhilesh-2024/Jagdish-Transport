package com.example.JagdishTransport.repository;

import com.example.JagdishTransport.model.InvoiceSettings;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface InvoiceSettingsRepository extends JpaRepository<InvoiceSettings, Long> {

    // Fetch the latest record (highest id)
    Optional<InvoiceSettings> findTopByOrderByIdDesc();

    // Fetch the latest record where autoGenerate is true
    Optional<InvoiceSettings> findFirstByAutoGenerateTrueOrderByIdDesc();
}
