package com.example.JagdishTransport.testing;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

public class TestPasswordEncoding {
    public static void main(String[] args) {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        String encoded = encoder.encode("Kunal@2001");
        System.out.println("Encoded password: " + encoded);
    }
}
