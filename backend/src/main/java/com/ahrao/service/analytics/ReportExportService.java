package com.ahrao.service.analytics;

import com.ahrao.dto.analytics.AnalyticsFilterParams;

public interface ReportExportService {

    byte[] exportReportToCsv(String reportType, AnalyticsFilterParams params);

    String getReportFilename(String reportType);
}
