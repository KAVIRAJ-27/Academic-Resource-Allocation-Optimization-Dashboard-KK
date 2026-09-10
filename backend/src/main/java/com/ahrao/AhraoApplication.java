package com.ahrao;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

/**
 * Main Application entrypoint for Academic & Hostel Resource Allocation Optimization Dashboard (AHRAO).
 */
@SpringBootApplication
@EnableJpaAuditing
public class AhraoApplication {

    public static void main(String[] args) {
        SpringApplication.run(AhraoApplication.class, args);
    }
}
