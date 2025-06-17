package com.example.JagdishTransport.Controller;

import org.springframework.stereotype.Controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;
import com.example.JagdishTransport.model.Login;
import com.example.JagdishTransport.model.UserProfile;
import com.example.JagdishTransport.repository.LoginRepository;
import com.example.JagdishTransport.service.UserProfileService;


@Controller
public class LoginController {
	
    @Autowired
    private AuthenticationManager authenticationManager;
    
    @Autowired
    private UserProfileService userProfileService;

    @Autowired
    public LoginController(AuthenticationManager authenticationManager) {
        this.authenticationManager = authenticationManager;
    }

	@GetMapping("/")
	public String homeRedirect() {
		return "redirect:/login";		
	}
	
	@GetMapping("/login")
    public String showLoginPage() {
        return "login";  // Render login page
    }
	
	@GetMapping("/dashboard")
    public String showDashboard() {
        return "dashboard";  // After login, show the dashboard
    }
	
	
	
	@GetMapping("/partyBill")
    public String showpartyBill() {
        return "partyBill";  
    }
	
	@GetMapping("/forgotPass")
    public String showForgotPassword() {
        return "forgotPass";  
    }
	
	@GetMapping("/OutsideforgotPass")
    public String showOutsideforgotPass() {
        return "OutsideforgotPass";  
    }
	
	
	/*
	 * @GetMapping("/profile") public String showProfile(Authentication
	 * authentication) { if (authentication != null &&
	 * authentication.isAuthenticated()) { return "profile"; } return
	 * "redirect:/login"; }
	 */

		@GetMapping("/updatePass")
	    public String showupdatePass() {
	        return "updatePass";  
	    }
	 
	 @GetMapping("/fromTo")
	    public String showFromToPage() {
	        return "fromTo";  
	    }
	 
	 @GetMapping("/partyStatement")
	    public String showpartyStatement() {
	        return "partyStatement";  
	    }
	 
	 @GetMapping("/fromToTable")
	    public String showFromToTable() {
	        return "fromToTable";  
	    }

	    @Autowired
	    private LoginRepository loginRepository;

	    @PostMapping("/perform_login")
	    @ResponseBody
	    public String receiveLoginData(@RequestBody Login login) {
	        System.out.println("Received Username: " + login.getUsername());
	        System.out.println("Received Hashed Password: " + login.getPassword());

	        // Save hashed password to database
	        loginRepository.save(login); 

	        return "Login data received and stored!";
	    }
}
