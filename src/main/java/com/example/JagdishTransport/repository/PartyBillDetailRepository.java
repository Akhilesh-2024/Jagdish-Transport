package com.example.JagdishTransport.repository;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.example.JagdishTransport.model.PartyBillDetail;

@Repository
public interface PartyBillDetailRepository extends JpaRepository<PartyBillDetail, Long> {
    
    // Find details by party bill ID
    List<PartyBillDetail> findByPartyBillId(Long partyBillId);
    
    // Find details by trip voucher ID (to check if already billed)
    List<PartyBillDetail> findByTripVoucherId(Long tripVoucherId);
    
    // Check if a trip voucher is already billed
    boolean existsByTripVoucherId(Long tripVoucherId);
    
    // Get sum of amounts for a party bill
    @Query("SELECT SUM(d.amount) FROM PartyBillDetail d WHERE d.partyBill.id = :billId")
    Double getTotalAmountForBill(@Param("billId") Long billId);
    
    // Delete details for a specific party bill
    void deleteByPartyBillId(Long partyBillId);
    
    List<PartyBillDetail> findByPartyBill_PartyNameAndTripDateBetween(String partyName, LocalDate startDate, LocalDate endDate);
}