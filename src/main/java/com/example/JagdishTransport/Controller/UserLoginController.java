/*
 * package com.example.JagdishTransport.Controller;
 * 
 * import com.example.JagdishTransport.dto.LoginDTO; import
 * com.example.JagdishTransport.model.Login; import
 * com.example.JagdishTransport.service.LoginService; import
 * com.example.JagdishTransport.service.MailService;
 * 
 * import org.springframework.beans.factory.annotation.Autowired; import
 * org.springframework.http.ResponseEntity; import
 * org.springframework.web.bind.annotation.*;
 * 
 * import java.time.LocalDateTime; import java.util.Optional;
 * 
 * @RestController
 * 
 * @RequestMapping("/api") public class UserLoginController {
 * 
 * @Autowired private LoginService loginService;
 * 
 * @Autowired private MailService mailService; // ✅ FIXED: Autowire mail service
 * 
 * // ✅ Save login info & send notification
 * 
 * @PostMapping("/saveLogin") public ResponseEntity<String>
 * saveLogin(@RequestBody Login loginRequest) { Login login = new Login();
 * login.setUsername(loginRequest.getUsername());
 * login.setPassword(loginRequest.getPassword());
 * login.setStatus(Login.Status.LOGIN);
 * login.setLoginTimestamp(LocalDateTime.now());
 * 
 * // ✅ Save login info to DB (optional depending on your logic)
 * loginService.saveLogin(login);
 * 
 * // ✅ Prepare email info String email = "phone.lover0123@gmail.com"; // You
 * can fetch from DB String location = "India"; // Use GeoIP API if needed
 * String deviceInfo = "Browser"; // You can extract from User-Agent
 * 
 * // ✅ Send login notification
 * mailService.sendLoginNotification(loginRequest.getUsername(), email,
 * location, deviceInfo);
 * 
 * return ResponseEntity.ok("Login saved and email notification sent."); }
 * 
 * // ✅ Fetch latest login details
 * 
 * @GetMapping("/user/{username}") public ResponseEntity<?>
 * getUser(@PathVariable String username) { Optional<Login> user =
 * loginService.getUserByUsername(username);
 * 
 * if (user.isPresent()) { LoginDTO safeLogin = new LoginDTO(user.get()); return
 * ResponseEntity.ok(safeLogin); } else { return
 * ResponseEntity.status(404).body("{\"error\": \"User not found\"}"); } }
 * 
 * @PostMapping("/logout") public ResponseEntity<String> logoutUser(@RequestBody
 * Login loginRequest) { String result =
 * loginService.logoutUser(loginRequest.getUsername(),
 * loginRequest.getPassword());
 * 
 * // Only send email if logout was successful if
 * (result.equalsIgnoreCase("Logout successful")) { String email =
 * "phone.lover0123@gmail.com"; // 🔁 Replace with real user email from DB if
 * available String location = "India"; // Optional - IP geolocation later
 * String deviceInfo = "Browser"; // Optional - can be enhanced
 * 
 * mailService.sendLogoutNotification(loginRequest.getUsername(), email,
 * location, deviceInfo); }
 * 
 * return ResponseEntity.ok(result); }
 * 
 * // ✅ Unified Password Change (for both Update & Forgot)
 * 
 * @PostMapping("/passwordChanged") public ResponseEntity<String>
 * passwordChanged(@RequestParam String username) { String email =
 * "phone.lover0123@gmail.com"; // Replace with actual email lookup
 * mailService.sendPasswordChangeConfirmation(username, email); return
 * ResponseEntity.ok("Password changed and confirmation email sent."); }
 * 
 * }
 */

package com.example.JagdishTransport.Controller;

import com.example.JagdishTransport.dto.LoginDTO;
import com.example.JagdishTransport.model.Login;
import com.example.JagdishTransport.model.UserProfile;
import com.example.JagdishTransport.service.LoginService;
import com.example.JagdishTransport.service.MailService;
import com.example.JagdishTransport.service.UserProfileService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.util.Optional;

@RestController
@RequestMapping("/api")
public class UserLoginController {
    @Autowired
    private LoginService loginService;
    
    @Autowired
    private MailService mailService;
    
    @Autowired
    private UserProfileService userProfileService; 
    
    // Default email to use when user email is null
    private static final String DEFAULT_EMAIL = "phone.lover0123@gmail.com";
    
    // Helper method to get user email with fallback to default
    private String getUserEmail(String username) {
        try {
            // Fetch user profile to get email
            UserProfile profile = userProfileService.getOrCreateProfile();
            String email = profile.getEmail();
            
            // If email is null or empty, use default email
            if (email == null || email.trim().isEmpty()) {
                return DEFAULT_EMAIL;
            }
            return email;
        } catch (Exception e) {
            // Log exception if needed
            System.out.println("Error fetching user email: " + e.getMessage());
            return DEFAULT_EMAIL;
        }
    }
    
    // ✅ Save login info & send notification
    @PostMapping("/saveLogin")
    public ResponseEntity<String> saveLogin(@RequestBody Login loginRequest) {
        Login login = new Login();
        login.setUsername(loginRequest.getUsername());
        login.setPassword(loginRequest.getPassword());
        login.setStatus(Login.Status.LOGIN);
        login.setLoginTimestamp(LocalDateTime.now());
        
        // ✅ Save login info to DB
        loginService.saveLogin(login);
        
        // ✅ Get email from profile or use default
        String email = getUserEmail(loginRequest.getUsername());
        String location = "India"; // Use GeoIP API if needed
        String deviceInfo = "Browser"; // You can extract from User-Agent
        
        // ✅ Send login notification
        mailService.sendLoginNotification(loginRequest.getUsername(), email, location, deviceInfo);
        return ResponseEntity.ok("Login saved and email notification sent.");
    }
    
    // ✅ Fetch latest login details
    @GetMapping("/user/{username}")
    public ResponseEntity<?> getUser(@PathVariable String username) {
        Optional<Login> user = loginService.getUserByUsername(username);
        if (user.isPresent()) {
            LoginDTO safeLogin = new LoginDTO(user.get());
            return ResponseEntity.ok(safeLogin);
        } else {
            return ResponseEntity.status(404).body("{\"error\": \"User not found\"}");
        }
    }
    
    @PostMapping("/logout")
    public ResponseEntity<String> logoutUser(@RequestBody Login loginRequest) {
        String result = loginService.logoutUser(loginRequest.getUsername(), loginRequest.getPassword());
        // Only send email if logout was successful
        if (result.equalsIgnoreCase("Logout successful")) {
            // Get email from profile or use default
            String email = getUserEmail(loginRequest.getUsername());
            String location = "India"; // Optional - IP geolocation later
            String deviceInfo = "Browser"; // Optional - can be enhanced
            mailService.sendLogoutNotification(loginRequest.getUsername(), email, location, deviceInfo);
        }
        return ResponseEntity.ok(result);
    }
    
    // ✅ Unified Password Change (for both Update & Forgot)
    @PostMapping("/passwordChanged")
    public ResponseEntity<String> passwordChanged(@RequestParam String username) {
        // Get email from profile or use default
        String email = getUserEmail(username);
        mailService.sendPasswordChangeConfirmation(username, email);
        return ResponseEntity.ok("Password changed and confirmation email sent.");
    }
}