package com.example.JagdishTransport.Controller;

import com.example.JagdishTransport.model.InvoiceSettings;
import com.example.JagdishTransport.service.InvoiceService;
import java.util.Collections;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

@Controller
@RequestMapping("/invoice")
public class InvoiceController {

     @Autowired
    private InvoiceService invoiceService;

    /**
     * Display the invoice settings page with the latest invoice preview.
     */
    @GetMapping
    public String showInvoiceSettingsPage(Model model) {
        InvoiceSettings settings = invoiceService.getInvoiceSettings();
        model.addAttribute("invoiceSettings", settings);
        String nextInvoiceNumber = invoiceService.getNextInvoiceNumber();
        model.addAttribute("nextInvoiceNumber", nextInvoiceNumber);
        return "invoice";
    }

    /**
     * API to fetch invoice settings (used by JavaScript).
     */
    @GetMapping("/settings")
    @ResponseBody
    public ResponseEntity<?> getInvoiceSettings() {
        InvoiceSettings settings = invoiceService.getInvoiceSettings();
        return ResponseEntity.ok(settings);
    }

    /**
     * API to fetch the next invoice number (used by JavaScript).
     */
    @GetMapping("/latest-number")
    public ResponseEntity<?> getLatestInvoiceNumber() {
        String nextInvoiceNumber = invoiceService.getNextInvoiceNumber();
        return ResponseEntity.ok(Collections.singletonMap("nextInvoiceNumber", nextInvoiceNumber));
    }
    
    /**
     * Save invoice settings from the form.
     */
    @PostMapping("/settings/save")
    public String saveSettings(@ModelAttribute InvoiceSettings invoiceSettings, RedirectAttributes redirectAttributes) {
        invoiceService.saveInvoiceSettings(invoiceSettings);
        redirectAttributes.addFlashAttribute("success", "Invoice settings saved successfully!");
        return "redirect:/invoice";
    }

    /**
     * Reset the invoice settings: clear the table and insert default settings.
     */
    @PostMapping("/settings/reset")
    @ResponseBody
    public ResponseEntity<?> resetSettings() {
        invoiceService.resetInvoiceSettings();
        return ResponseEntity.ok(Collections.singletonMap("message", "Settings reset successfully"));
    }


    /**
     * API to fetch the last invoice record (used by JavaScript).
     */
    @GetMapping("/last-record")
    @ResponseBody
    public ResponseEntity<?> getLastInvoiceRecord() {
        String lastInvoiceNumber = invoiceService.getNextInvoiceNumber();
        return ResponseEntity.ok(Collections.singletonMap("lastInvoiceNumber", lastInvoiceNumber));
    }

    /**
     * Show Invoice Auto Mode Status Page.
     */
    @GetMapping("/invoice-settings")
    public String showInvoiceSettingsStatus(Model model) {
        boolean isAutoModeOn = invoiceService.isAutoModeOn();
        model.addAttribute("isAutoModeOn", isAutoModeOn);
        return "invoice-settings";
    }
    
 // Add these endpoints to your TripVoucherController class

    @PostMapping("/increment-invoice")
    @ResponseBody
    public ResponseEntity<?> incrementInvoiceNumber() {
        try {
            InvoiceSettings settings = invoiceService.getInvoiceSettings();
            if (settings.isAutoGenerate()) {
                // Increment start number
                settings.setStartNumber(settings.getStartNumber() + 1);
                invoiceService.saveInvoiceSettings(settings);
            }
            return ResponseEntity.ok(Collections.singletonMap("message", "Invoice number incremented successfully"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                   .body(Collections.singletonMap("error", "Failed to increment invoice number: " + e.getMessage()));
        }
    }

    @PostMapping("/decrement-invoice")
    @ResponseBody
    public ResponseEntity<?> decrementInvoiceNumber() {
        try {
            InvoiceSettings settings = invoiceService.getInvoiceSettings();
            if (settings.isAutoGenerate() && settings.getStartNumber() > 1000) {
                // Decrement start number, but don't go below initial value
                settings.setStartNumber(settings.getStartNumber() - 1);
                invoiceService.saveInvoiceSettings(settings);
            }
            return ResponseEntity.ok(Collections.singletonMap("message", "Invoice number decremented successfully"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                   .body(Collections.singletonMap("error", "Failed to decrement invoice number: " + e.getMessage()));
        }
    }
}
