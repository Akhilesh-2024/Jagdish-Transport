package com.example.JagdishTransport.service;

import com.example.JagdishTransport.model.Login;
import com.example.JagdishTransport.repository.LoginRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
public class LoginService {

    @Autowired
    private LoginRepository loginRepository;

    // ✅ Save login from /saveLogin
    public void saveLogin(Login login) {
        loginRepository.save(login);
    }

    // ✅ Register new user (plain password)
    public void registerUser(String username, String password) {
        Login login = new Login();
        login.setUsername(username);
        login.setPassword(password);
        login.setStatus(Login.Status.LOGOUT);
        login.setLoginTimestamp(LocalDateTime.now());

        loginRepository.save(login);
    }

 // ✅ Authenticate user using plain password match
    public boolean authenticateUser(String username, String password) {
        Optional<Login> optionalLogin = loginRepository.findTopByUsernameOrderByIdDesc(username);
        return optionalLogin.isPresent() && optionalLogin.get().getPassword().equals(password);
    }

    // ✅ Fetch user by username
    public Optional<Login> getUserByUsername(String username) {
        return loginRepository.findTopByUsernameOrderByIdDesc(username);
    }

    // ✅ Update password using latest login record
    public String updatePassword(String username, String oldPassword, String newPassword) {
        Optional<Login> latestLoginOpt = loginRepository.findTopByUsernameOrderByIdDesc(username);

        if (latestLoginOpt.isPresent()) {
            Login login = latestLoginOpt.get();

            if (!login.getPassword().equals(oldPassword)) {
                return "❌ Incorrect current password.";
            }

            // Update only this latest record
            login.setPassword(newPassword);
            loginRepository.save(login);

            return "✅ Password updated successfully.";
        }

        return "❌ No user found with username.";
    }


    // ✅ Logout: Update latest login record with logout time and status
    public String logoutUser(String username, String password) {
        Optional<Login> optionalLogin = loginRepository.findTopByUsernameOrderByIdDesc(username);

        if (optionalLogin.isPresent()) {
            Login login = optionalLogin.get();

            // Check password match if provided
            if (password != null && !password.equals(login.getPassword())) {
                return "❌ Password mismatch!";
            }

            login.setStatus(Login.Status.LOGOUT);
            login.setLogoutTimestamp(LocalDateTime.now());

            loginRepository.save(login);
            return "✅ Logout successful and saved to history!";
        } else {
            return "❌ No login record found for user!";
        }
    }
}
