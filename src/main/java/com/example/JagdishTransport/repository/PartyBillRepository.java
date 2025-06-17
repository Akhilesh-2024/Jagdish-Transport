package com.example.JagdishTransport.repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.EntityGraph.EntityGraphType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.example.JagdishTransport.model.PartyBill;
/*
 * @Repository public interface PartyBillRepository extends
 * JpaRepository<PartyBill, Long> {
 * 
 * @EntityGraph(value = "PartyBill.withDetails", type = EntityGraphType.LOAD)
 * List<PartyBill> findByPartyNameContainingIgnoreCase(String partyName);
 * 
 * @EntityGraph(value = "PartyBill.withDetails", type = EntityGraphType.LOAD)
 * List<PartyBill> findByBillDateBetween(LocalDate fromDate, LocalDate toDate);
 * 
 * @EntityGraph(value = "PartyBill.withDetails", type = EntityGraphType.LOAD)
 * List<PartyBill> findByPartyNameContainingIgnoreCaseAndBillDateBetween( String
 * partyName, LocalDate fromDate, LocalDate toDate);
 * 
 * // Add the missing methods that are causing the build failure
 * 
 * // Check if a bill with the given bill number exists boolean
 * existsByBillNo(String billNo);
 * 
 * // Find a party bill by its bill number
 * 
 * @EntityGraph(value = "PartyBill.withDetails", type = EntityGraphType.LOAD)
 * Optional<PartyBill> findByBillNo(String billNo);
 * 
 * // Find the most recent bill (by bill date)
 * 
 * @Query("SELECT pb FROM PartyBill pb ORDER BY pb.billDate DESC, pb.id DESC")
 * List<PartyBill> findAllOrderByBillDateDescIdDesc();
 * 
 * // Helper method to get the most recent bill default List<PartyBill>
 * findMostRecentBill() { return findAllOrderByBillDateDescIdDesc(); } }
 */


@Repository
public interface PartyBillRepository extends JpaRepository<PartyBill, Long> {
    
    boolean existsByBillNo(String billNo);
    
    Optional<PartyBill> findByBillNo(String billNo);
    
    List<PartyBill> findByPartyNameContainingIgnoreCase(String partyName);
    
    @EntityGraph(value = "PartyBill.withDetails")
    List<PartyBill> findByBillDateBetween(LocalDate fromDate, LocalDate toDate);
    
    @EntityGraph(value = "PartyBill.withDetails")
    List<PartyBill> findByPartyNameContainingIgnoreCaseAndBillDateBetween(
        String partyName, LocalDate fromDate, LocalDate toDate);
    
    @Query("SELECT p FROM PartyBill p ORDER BY p.id DESC")
    List<PartyBill> findMostRecentBill(Pageable pageable);
    
    default List<PartyBill> findMostRecentBill() {
        return findMostRecentBill(PageRequest.of(0, 1));
    }
    
    @EntityGraph(value = "PartyBill.withDetails")
    @Query("SELECT DISTINCT p FROM PartyBill p LEFT JOIN FETCH p.details")
    List<PartyBill> findAll();
    
    @Query("SELECT p FROM PartyBill p ORDER BY p.billDate DESC")
    List<PartyBill> findTop5ByOrderByBillDateDesc(Pageable pageable);
    
    default List<PartyBill> findTop5ByOrderByBillDateDesc() {
        return findTop5ByOrderByBillDateDesc(PageRequest.of(0, 5));
    }
}