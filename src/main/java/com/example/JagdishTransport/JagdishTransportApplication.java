package com.example.JagdishTransport;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.context.ConfigurableApplicationContext;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.util.Properties;

@SpringBootApplication
public class JagdishTransportApplication {
	public static void main(String[] args) {
		// Load environment variables from .env file if it exists
		loadEnvFile();
		
		ConfigurableApplicationContext context = SpringApplication.run(JagdishTransportApplication.class, args);
		System.out.println("Run Successfully");
	}
	
	private static void loadEnvFile() {
		File envFile = new File(".env");
		if (envFile.exists()) {
			try (FileInputStream input = new FileInputStream(envFile)) {
				Properties props = new Properties();
				props.load(input);
				
				// Set system properties from .env file
				for (String key : props.stringPropertyNames()) {
					if (System.getProperty(key) == null) {
						System.setProperty(key, props.getProperty(key));
					}
				}
				
				System.out.println("Loaded environment variables from .env file");
			} catch (IOException e) {
				System.err.println("Error loading .env file: " + e.getMessage());
			}
		} else {
			System.out.println("No .env file found, using default properties");
		}
	}
}