package com.example.JagdishTransport.Controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Controller
public class VehicleStatementController {

    /**
     * Display the vehicle statement page
     */
    @GetMapping("/vehicleStatement")
    public String showVehicleStatementPage(Model model) {
        return "vehicleStatement";
    }
}