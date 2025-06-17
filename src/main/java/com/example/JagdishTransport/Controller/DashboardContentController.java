package com.example.JagdishTransport.Controller;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;

@Controller
@RequestMapping("/dashboard-content")
public class DashboardContentController {

    @GetMapping
    public String loadContent(@RequestParam String page, Model model) {
        return page; // Ensure it returns the correct Thymeleaf fragment
    }
}
