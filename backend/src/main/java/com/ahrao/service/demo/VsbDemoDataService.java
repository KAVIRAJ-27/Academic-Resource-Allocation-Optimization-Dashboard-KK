package com.ahrao.service.demo;

import com.ahrao.dto.demo.VsbDemoStatusDto;
import com.ahrao.dto.demo.VsbImportSummaryDto;

public interface VsbDemoDataService {

    VsbImportSummaryDto importVsbDemoData(String dataDirectoryPath);

    VsbDemoStatusDto getVsbDemoStatus();

    VsbImportSummaryDto cleanupVsbDemoData();
}
