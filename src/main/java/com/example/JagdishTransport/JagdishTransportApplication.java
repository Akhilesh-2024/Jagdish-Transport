package com.example.JagdishTransport;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;

@SpringBootApplication
@EntityScan(basePackages = "com.example.JagdishTransport.model")
public class JagdishTransportApplication {

	public static void main(String[] args) {
		SpringApplication.run(JagdishTransportApplication.class, args);
		System.out.println("Run Successfully");
	}

}