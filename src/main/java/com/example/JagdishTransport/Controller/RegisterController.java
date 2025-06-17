package com.example.JagdishTransport.Controller;

import com.example.JagdishTransport.model.Login;
import com.example.JagdishTransport.repository.LoginRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/register")
public class RegisterController {

    private final LoginRepository loginRepository;
    private final PasswordEncoder passwordEncoder;

    public RegisterController(LoginRepository loginRepository, PasswordEncoder passwordEncoder) {
        this.loginRepository = loginRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @PostMapping("/create")
    public String registerUser(@RequestParam String username, @RequestParam String password) {
        if (loginRepository.findByUsername(username).isPresent()) {
            return "User already exists!";
        }

        Login user = new Login();
        user.setUsername(username);
        user.setPassword(passwordEncoder.encode(password));  // Encrypt Password
        user.setStatus(Login.Status.LOGOUT);

        loginRepository.save(user);
        return "User registered successfully!";
    }
}
