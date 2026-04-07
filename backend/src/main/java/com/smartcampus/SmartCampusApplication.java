package com.smartcampus;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * ================================================================
 * Smart Campus Operations Hub - Main Application Entry Point
 * ================================================================
 * Team: All Members
 *
 * This is the Spring Boot application entry point.
 * Do NOT modify this file unless adding global configurations.
 *
 * Module Ownership:
 *  - Member 1 (Team Lead): Auth, Security, CI/CD setup
 *  - Member 2:             Booking Management module
 *  - Member 3:             Facilities & Resources module
 *  - Member 4:             Maintenance Tickets & Notifications
 * ================================================================
 */
@SpringBootApplication
public class SmartCampusApplication {

    public static void main(String[] args) {
        SpringApplication.run(SmartCampusApplication.class, args);
    }
}
