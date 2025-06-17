package com.example.JagdishTransport.Controller;

import com.example.JagdishTransport.model.BillSettings;
import com.example.JagdishTransport.service.BillService;
import java.util.Collections;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

@Controller
@RequestMapping("/billSeries")
public class BillController {

    @Autowired
    private BillService billService;

    /**
     * Display the bill settings page with the latest bill preview.
     */
    @GetMapping
    public String showBillSettingsPage(Model model) {
        BillSettings settings = billService.getBillSettings();
        model.addAttribute("billSettings", settings);
        String nextBillNumber = billService.getNextBillNumber();
        model.addAttribute("nextBillNumber", nextBillNumber);
        return "billSeries";
    }

    /**
     * API to fetch bill settings (used by JavaScript).
     */
    @GetMapping("/settings")
    @ResponseBody
    public ResponseEntity<?> getBillSettings() {
        BillSettings settings = billService.getBillSettings();
        return ResponseEntity.ok(settings);
    }

    /**
     * API to fetch the next bill number (used by JavaScript).
     */
    @GetMapping("/latest-number")
    @ResponseBody
    public ResponseEntity<?> getLatestBillNumber() {
        String nextBillNumber = billService.getNextBillNumber();
        return ResponseEntity.ok(Collections.singletonMap("nextBillNumber", nextBillNumber));
    }

    /**
     * Save bill settings from the form.
     */
    @PostMapping("/settings/save")
    public String saveSettings(@ModelAttribute BillSettings billSettings, RedirectAttributes redirectAttributes) {
        billService.saveBillSettings(billSettings);
        redirectAttributes.addFlashAttribute("success", "Bill settings saved successfully!");
        return "redirect:/billSeries";
    }

    /**
     * Reset the bill settings: clear the table and insert default settings.
     */
    @PostMapping("/settings/reset")
    @ResponseBody
    public ResponseEntity<?> resetSettings() {
        billService.resetBillSettings();
        return ResponseEntity.ok(Collections.singletonMap("message", "Settings reset successfully"));
    }

    /**
     * API to fetch the last bill record (used by JavaScript).
     */
    @GetMapping("/last-record")
    @ResponseBody
    public ResponseEntity<?> getLastBillRecord() {
        String lastBillNumber = billService.getNextBillNumber();
        return ResponseEntity.ok(Collections.singletonMap("lastBillNumber", lastBillNumber));
    }

    /**
     * Show Bill Auto Mode Status Page.
     */
    @GetMapping("/bill-settings")
    public String showBillSettingsStatus(Model model) {
        boolean isAutoModeOn = billService.isAutoModeOn();
        model.addAttribute("isAutoModeOn", isAutoModeOn);
        return "bill-settings";
    }
    
    /**
     * Increment bill number - API endpoint
     * Increments the bill number and returns the updated number
     */
    @PostMapping("/increment-bill")
    @ResponseBody
    public ResponseEntity<?> incrementBillNumber() {
        try {
            String updatedBillNumber = billService.incrementBillNumber();
            return ResponseEntity.ok(Collections.singletonMap("nextBillNumber", updatedBillNumber));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                   .body(Collections.singletonMap("error", "Failed to increment bill number: " + e.getMessage()));
        }
    }

    /**
     * Decrement bill number - API endpoint
     * Decrements the bill number if possible and returns the updated number
     */
    @PostMapping("/decrement-bill")
    @ResponseBody
    public ResponseEntity<?> decrementBillNumber() {
        try {
            billService.decrementBillNumber();
            String updatedBillNumber = billService.getNextBillNumber();
            return ResponseEntity.ok(Collections.singletonMap("nextBillNumber", updatedBillNumber));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Collections.singletonMap("error", 
                            "Failed to decrement bill number: " + e.getMessage()));
        }
    }
}