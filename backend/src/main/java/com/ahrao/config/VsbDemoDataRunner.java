package com.ahrao.config;

import com.ahrao.dto.demo.VsbImportSummaryDto;
import com.ahrao.service.demo.VsbDemoDataService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.util.Arrays;

/**
 * Runner that executes VSB demo data seeding if configured or triggered by arguments.
 */
@Component
@Order(2) // Runs after baseline DataInitializer (Order 1 / default)
public class VsbDemoDataRunner implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(VsbDemoDataRunner.class);

    private final VsbDemoDataService vsbDemoDataService;

    @Value("${ahrao.demo.vsb.auto-import:false}")
    private boolean autoImport;

    @Value("${ahrao.demo.vsb.data-dir:C:/Users/KAVIRAJ/Downloads/AHRAO_VSB_College_Demo_Data}")
    private String dataDir;

    public VsbDemoDataRunner(VsbDemoDataService vsbDemoDataService) {
        this.vsbDemoDataService = vsbDemoDataService;
    }

    @Override
    public void run(String... args) {
        boolean shouldRun = autoImport || Arrays.asList(args).contains("--import-vsb");
        if (shouldRun) {
            log.info("VsbDemoDataRunner triggered. Loading demo dataset from: {}", dataDir);
            VsbImportSummaryDto summary = vsbDemoDataService.importVsbDemoData(dataDir);
            log.info("VsbDemoDataRunner completed with status: {}, imported counts: {}",
                    summary.getStatus(), summary.getImportedCounts());
        } else {
            log.info("VsbDemoDataRunner: auto-import is false. Set ahrao.demo.vsb.auto-import=true or call /api/admin/demo-data/vsb/import to import.");
        }
    }
}
