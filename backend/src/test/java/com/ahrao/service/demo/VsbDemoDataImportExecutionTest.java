package com.ahrao.service.demo;

import com.ahrao.dto.demo.VsbDemoStatusDto;
import com.ahrao.dto.demo.VsbImportSummaryDto;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
class VsbDemoDataImportExecutionTest {

    @Autowired
    private VsbDemoDataService vsbDemoDataService;

    @Test
    @DisplayName("Execute live VSB demo data import against MySQL database")
    void testLiveImportVsbDemoData() {
        String dataDir = "C:/Users/KAVIRAJ/Downloads/AHRAO_VSB_College_Demo_Data";
        System.out.println("==========================================================");
        System.out.println("Starting live execution of VSB Demo Data Import...");
        System.out.println("Source directory: " + dataDir);
        System.out.println("==========================================================");

        VsbImportSummaryDto summary = vsbDemoDataService.importVsbDemoData(dataDir);

        System.out.println("==========================================================");
        System.out.println("IMPORT RESULT STATUS: " + summary.getStatus());
        System.out.println("Total Duration (ms):  " + summary.getDurationMs());
        System.out.println("Imported Entities:");
        summary.getImportedCounts().forEach((k, v) -> System.out.println("  - " + k + ": " + v));
        System.out.println("Validation Errors count: " + summary.getValidationErrors().size());
        if (!summary.getValidationErrors().isEmpty()) {
            System.out.println("First 5 errors: " + summary.getValidationErrors().subList(0, Math.min(5, summary.getValidationErrors().size())));
        }
        System.out.println("Business Notes:");
        summary.getBusinessRuleNotes().forEach(n -> System.out.println("  * " + n));
        System.out.println("==========================================================");

        VsbDemoStatusDto status = vsbDemoDataService.getVsbDemoStatus();
        System.out.println("VSB Demo Status Installed: " + status.isInstalled());
        System.out.println("VSB Database Live Entity Counts:");
        status.getEntityCounts().forEach((k, v) -> System.out.println("  - " + k + ": " + v));
        System.out.println("==========================================================");

        assertEquals("SUCCESS", summary.getStatus());
        assertTrue(status.isInstalled());
        assertTrue(status.getEntityCounts().getOrDefault("students", 0L) > 0);
    }
}
