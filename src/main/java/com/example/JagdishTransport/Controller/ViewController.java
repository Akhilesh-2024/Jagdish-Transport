package com.example.JagdishTransport.Controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class ViewController {

	   @GetMapping("/tripVoucher")
	    public String showTripVoucherForm() {
	        return "tripVoucher";
	    }

	    @GetMapping("/tripVoucherTable")
	    public String showTripVoucherTable() {
	        return "tripVouchertable"; // src/main/resources/templates/tripVouchertable.html
	    }
}
