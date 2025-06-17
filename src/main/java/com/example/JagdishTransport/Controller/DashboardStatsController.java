package com.example.JagdishTransport.Controller;
import com.example.JagdishTransport.model.*;
import com.example.JagdishTransport.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardStatsController {

    @Autowired
    private VehicleMasterRepository vehicleMasterRepository;

    @Autowired
    private PartyMasterRepository partyMasterRepository;

    @Autowired
    private LocationRepository locationRepository;

    @Autowired
    private VehicleTypeRepository vehicleTypeRepository;
    
    @Autowired
    private PartyBillRepository partyBillRepository;

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getDashboardStats() {
        Map<String, Object> stats = new HashMap<>();
        
        try {
            // Get total vehicles count
            long totalVehicles = vehicleMasterRepository.count();
            stats.put("totalVehicles", totalVehicles);
            
            // Get total parties count
            long totalParties = partyMasterRepository.count();
            stats.put("totalParties", totalParties);
            
            // Get total locations count
            long totalLocations = locationRepository.count();
            stats.put("totalLocations", totalLocations);
            
            // Get total vehicle types count
            long totalVehicleTypes = vehicleTypeRepository.count();
            stats.put("totalVehicleTypes", totalVehicleTypes);
            
            // Get recent bills (limit to 5)
            List<PartyBill> recentBills = partyBillRepository.findTop5ByOrderByBillDateDesc();
            
            // Convert to simplified objects to avoid circular references
            List<Map<String, Object>> simplifiedBills = recentBills.stream()
                .map(bill -> {
                    Map<String, Object> billMap = new HashMap<>();
                    billMap.put("id", bill.getId());
                    billMap.put("billNo", bill.getBillNo());
                    billMap.put("billDate", bill.getBillDate());
                    billMap.put("partyName", bill.getPartyName());
                    billMap.put("totalAmount", bill.getTotalAmount());
                    return billMap;
                })
                .collect(Collectors.toList());
            
            stats.put("recentBills", simplifiedBills);
            
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            Map<String, Object> errorStats = new HashMap<>();
            errorStats.put("totalVehicles", 0);
            errorStats.put("totalParties", 0);
            errorStats.put("totalLocations", 0);
            errorStats.put("totalVehicleTypes", 0);
            errorStats.put("recentBills", List.of());
            return ResponseEntity.ok(errorStats);
        }
    }
}