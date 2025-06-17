package com.example.JagdishTransport.repository;

import com.example.JagdishTransport.model.TripVoucher;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface TripVoucherRepository extends JpaRepository<TripVoucher, Long> {

    // Find vouchers between date range
    @Query("SELECT v FROM TripVoucher v WHERE v.timestamp BETWEEN :startDate AND :endDate")
    List<TripVoucher> findByDateBetween(
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate
    );

    // Find vouchers by vehicle number containing the search term
    List<TripVoucher> findByVehicleNoContainingIgnoreCase(String vehicleNo);

    // Find vouchers by MR number containing the search term
    List<TripVoucher> findByMrNoContainingIgnoreCase(String mrNo);

    // Combined search with date range and search term
    @Query("SELECT v FROM TripVoucher v WHERE v.timestamp BETWEEN :startDate AND :endDate " +
            "AND (LOWER(v.vehicleNo) LIKE LOWER(CONCAT('%', :searchTerm, '%')) " +
            "OR LOWER(v.mrNo) LIKE LOWER(CONCAT('%', :searchTerm, '%')))")
    List<TripVoucher> findByDateRangeAndSearchTerm(
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate,
            @Param("searchTerm") String searchTerm
    );

    // Add this to your TripVoucherRepository interface
    @Query("SELECT DISTINCT t.vehicleNo FROM TripVoucher t WHERE t.vehicleNo IS NOT NULL ORDER BY t.vehicleNo")
    List<String> findDistinctVehicleNumbers();

    @Query("SELECT DISTINCT t.vehicleNo FROM TripVoucher t WHERE t.vehicleNo LIKE %:term% ORDER BY t.vehicleNo")
    List<String> findVehicleNumbersContaining(@Param("term") String term);

    // NEW METHODS FOR PARTY BILL FILTERING

    // Find by party name (toBeBilled field)
    List<TripVoucher> findByToBeBilledIgnoreCase(String partyName);

    // Find distinct party names (toBeBilled)
    @Query("SELECT DISTINCT t.toBeBilled FROM TripVoucher t WHERE t.toBeBilled IS NOT NULL AND t.toBeBilled != '' ORDER BY t.toBeBilled")
    List<String> findDistinctPartyNames();

    // Find vouchers by party name (toBeBilled)
    List<TripVoucher> findByToBeBilledContainingIgnoreCase(String partyName);

    // Updated query to properly handle party name filtering - using exact match for better performance
    @Query("SELECT v FROM TripVoucher v WHERE v.timestamp BETWEEN :startDate AND :endDate " +
            "AND LOWER(v.toBeBilled) = LOWER(:partyName)")
    List<TripVoucher> findByDateRangeAndExactPartyName(
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate,
            @Param("partyName") String partyName
    );
    
    // Updated query to properly handle party name filtering - using LIKE for partial matches
    @Query("SELECT v FROM TripVoucher v WHERE v.timestamp BETWEEN :startDate AND :endDate " +
            "AND LOWER(v.toBeBilled) LIKE LOWER(CONCAT('%', :partyName, '%'))")
    List<TripVoucher> findByDateRangeAndPartyName(
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate,
            @Param("partyName") String partyName
    );
}