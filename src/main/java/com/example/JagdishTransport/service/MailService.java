    package com.example.JagdishTransport.service;

    import org.springframework.beans.factory.annotation.Autowired;
    import org.springframework.mail.SimpleMailMessage;
    import org.springframework.mail.javamail.JavaMailSender;
    import org.springframework.stereotype.Service;

    import java.security.SecureRandom;
    import java.time.LocalDateTime;
    import java.util.Map;
    import java.util.concurrent.ConcurrentHashMap;

    @Service
    public class MailService {

        @Autowired
        private JavaMailSender mailSender;


        // 🔐 Temporary in-memory OTP store
        private final Map<String, String> otpStore = new ConcurrentHashMap<>();

        // ✅ Generate and send OTP with detailed professional message
        public void generateAndSendOTP(String username, String email) {
            String otp = generateOTP();
            otpStore.put(username, otp);

            StringBuilder sb = new StringBuilder();
            sb.append("Dear ").append(username).append(",\n\n");
            sb.append("We received a request to reset your password for your Jagdish Transport account.\n");
            sb.append("Please use the One-Time Password (OTP) below to proceed:\n\n");

            sb.append("🔐 Your OTP is: ").append("\n\n")
            .append("            ").append(otp).append("\n\n");

            sb.append("🕒 This OTP is valid for only 5 minutes.\n\n");
            sb.append("⚠️ If you did not request this password reset, please ignore this message. ");
            sb.append("No changes will be made to your account without this OTP.\n\n");

            sb.append("Best Regards,\n");
            sb.append("Jagdish Transport Support Team");

            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(email);
            message.setSubject("🔐 Your OTP for Password Reset - Jagdish Transport");
            message.setText(sb.toString());

            mailSender.send(message);
        }

        // ✅ Validate OTP
        public boolean validateOTP(String username, String otp) {
            String storedOtp = otpStore.get(username);
            return otp != null && otp.equals(storedOtp);
        }

        // ✅ Clear OTP
        public void clearOTP(String username) {
            otpStore.remove(username);
        }

        // ✅ Generate 6-digit secure OTP
        private String generateOTP() {
            SecureRandom random = new SecureRandom();
            int otp = 100000 + random.nextInt(900000); // 6-digit
            return String.valueOf(otp);
        }
        
        public void sendLoginNotification(String username, String email, String location, String deviceInfo) {
            StringBuilder sb = new StringBuilder();
            sb.append("Hi ").append(username).append(",\n\n");
            sb.append("🔐 Your account was just logged in successfully.\n\n");
            sb.append("🕓 Time: ").append(java.time.LocalDateTime.now()).append("\n");
            sb.append("🌐 Location: ").append(location).append("\n");
            sb.append("💻 Device: ").append(deviceInfo).append("\n\n");

            sb.append("If this was you, no action is needed.\n");
            sb.append("If you didn’t sign in, we strongly recommend you reset your password immediately.\n\n");
            sb.append("Stay safe,\n");
            sb.append("Jagdish Transport Security Team");

            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(email);
            message.setSubject("🔐 New Login Detected - Jagdish Transport");
            message.setText(sb.toString());

            mailSender.send(message);
        }

    // MailService.java

        public void sendLogoutNotification(String username, String email, String location, String deviceInfo) {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(email);
            message.setSubject("🔒 You’ve Logged Out from Jagdish Transport");

            String logoutMessage = "Hello " + username + ",\n\n"
                    + "You have been successfully logged out of your account.\n\n"
                    + "🕒 Time: " + LocalDateTime.now() + "\n"
                    + "📍 Location: " + location + "\n"
                    + "💻 Device: " + deviceInfo + "\n\n"
                    + "If this wasn’t you, please reset your password immediately or contact our support team.\n\n"
                    + "Stay safe,\n"
                    + "— Jagdish Transport Security Team";

            message.setText(logoutMessage);
            mailSender.send(message);
        }
        
        public void sendPasswordChangeConfirmation(String username, String email) {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(email);
            message.setSubject("🔐 Password Changed Successfully");

            String mailContent = String.format(
                "Hi %s,\n\n"
            + "We wanted to let you know that your password was changed successfully.\n\n"
            + "🔒 Your account is now secured with your new password.\n"
            + "📅 Time: %s\n\n"
            + "If you did not request this change, please contact our support team immediately.\n\n"
            + "Best regards,\n"
            + "Team Jagdish Transport\n"
            + "✉️ support@jagdishtransport.com", 
                username, 
                java.time.LocalDateTime.now()
            );

            message.setText(mailContent);
            mailSender.send(message);
        }

    }
