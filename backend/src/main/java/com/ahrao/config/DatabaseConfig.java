package com.ahrao.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import javax.sql.DataSource;
import java.sql.Connection;

/**
 * Database configuration and initialization telemetry.
 */
@Configuration
public class DatabaseConfig {

    private static final Logger logger = LoggerFactory.getLogger(DatabaseConfig.class);

    @Value("${spring.datasource.url}")
    private String dbUrl;

    @Value("${spring.datasource.username}")
    private String dbUsername;

    @Bean
    public CommandLineRunner databaseConnectionVerifier(DataSource dataSource) {
        return args -> {
            logger.info("Initializing AHRAO Database configuration...");
            logger.info("Database URL target: {}", maskDbUrl(dbUrl));
            logger.info("Database User configured: {}", dbUsername);
            try (Connection connection = dataSource.getConnection()) {
                logger.info("Database connection successfully established! Database Product: {}, Catalog: {}",
                        connection.getMetaData().getDatabaseProductName(),
                        connection.getCatalog());
            } catch (Exception ex) {
                logger.warn("Database connection notice: {} (Database will connect when MySQL service is reachable)", ex.getMessage());
            }
        };
    }

    private String maskDbUrl(String url) {
        if (url == null) return "N/A";
        return url.replaceAll("(?i)(password=)[^&;]*", "$1****");
    }
}
