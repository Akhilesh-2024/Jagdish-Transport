package com.example.JagdishTransport.Config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.support.PropertySourcesPlaceholderConfigurer;
import org.springframework.core.io.FileSystemResource;

import java.io.File;

@Configuration
public class EnvConfig {

    @Bean
    public static PropertySourcesPlaceholderConfigurer propertySourcesPlaceholderConfigurer() {
        PropertySourcesPlaceholderConfigurer configurer = new PropertySourcesPlaceholderConfigurer();
        
        // Try to load .env file if it exists
        File envFile = new File(".env");
        if (envFile.exists()) {
            configurer.setLocation(new FileSystemResource(envFile));
            System.out.println("Loaded environment variables from .env file");
        } else {
            System.out.println("No .env file found, using default properties");
        }
        
        return configurer;
    }
}