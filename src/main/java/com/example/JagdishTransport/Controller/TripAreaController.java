package com.example.JagdishTransport.Controller;

import java.time.LocalDate;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;

import com.example.JagdishTransport.model.AreaMaster;
import com.example.JagdishTransport.service.AreaMasterService;

@RestController
@RequestMapping("/area-master")
public class TripAreaController {
    
    @Autowired
    private AreaMasterService areaMasterService;
    
    @PostMapping("/add-from-trip")
    @ResponseBody
    public AreaMaster addAreaFromTrip(@RequestBody Map<String, Object> requestData) {
        System.out.println("Received area data from trip voucher: " + requestData);
        
        AreaMaster areaMaster = new AreaMaster();
        areaMaster.setAreaName((String) requestData.get("areaName"));
        areaMaster.setVehicleType((String) requestData.get("vehicleType"));
        areaMaster.setPartyName((String) requestData.get("partyName"));
        areaMaster.setFromLocation((String) requestData.get("fromLocation"));
        areaMaster.setToLocation((String) requestData.get("toLocation"));
        
        // Handle numeric values
        if (requestData.get("companyRate") != null) {
            if (requestData.get("companyRate") instanceof Number) {
                areaMaster.setCompanyRate(((Number) requestData.get("companyRate")).doubleValue());
            } else {
                try {
                    areaMaster.setCompanyRate(Double.parseDouble(requestData.get("companyRate").toString()));
                } catch (Exception e) {
                    areaMaster.setCompanyRate(0.0);
                }
            }
        } else {
            areaMaster.setCompanyRate(0.0);
        }
        
        if (requestData.get("lorryRate") != null) {
            if (requestData.get("lorryRate") instanceof Number) {
                areaMaster.setLorryRate(((Number) requestData.get("lorryRate")).doubleValue());
            } else {
                try {
                    areaMaster.setLorryRate(Double.parseDouble(requestData.get("lorryRate").toString()));
                } catch (Exception e) {
                    areaMaster.setLorryRate(0.0);
                }
            }
        } else {
            areaMaster.setLorryRate(0.0);
        }
        
        // Handle date
        if (requestData.get("areaDate") != null) {
            try {
                areaMaster.setAreaDate(LocalDate.parse((String) requestData.get("areaDate")));
            } catch (Exception e) {
                areaMaster.setAreaDate(LocalDate.now());
            }
        } else {
            areaMaster.setAreaDate(LocalDate.now());
        }
        
        return areaMasterService.addArea(areaMaster);
    }
}