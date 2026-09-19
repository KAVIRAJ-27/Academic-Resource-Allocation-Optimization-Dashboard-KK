package com.ahrao.service.demo;

import com.ahrao.dto.demo.VsbDemoStatusDto;
import com.ahrao.dto.demo.VsbImportSummaryDto;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class VsbDemoDataServiceTest {

    @Mock
    private JdbcTemplate jdbcTemplate;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private VsbDemoDataServiceImpl vsbDemoDataService;

    @Test
    @DisplayName("parseCsvLine should correctly split standard comma-separated lines")
    void testParseCsvLine_Standard() {
        String line = "D01,Computer Science & Engineering,CSE,Engineering & Technology,8200000,1";
        List<String> tokens = VsbDemoDataServiceImpl.parseCsvLine(line);

        assertEquals(6, tokens.size());
        assertEquals("D01", tokens.get(0));
        assertEquals("Computer Science & Engineering", tokens.get(1));
        assertEquals("CSE", tokens.get(2));
        assertEquals("Engineering & Technology", tokens.get(3));
        assertEquals("8200000", tokens.get(4));
        assertEquals("1", tokens.get(5));
    }

    @Test
    @DisplayName("parseCsvLine should correctly preserve commas within quoted fields")
    void testParseCsvLine_QuotedCommas() {
        String line = "CRS0001,D01,CSE101,Programming Fundamentals,1,4,\"FALL,SPRING\",,M.E CSE,1";
        List<String> tokens = VsbDemoDataServiceImpl.parseCsvLine(line);

        assertEquals(10, tokens.size());
        assertEquals("CRS0001", tokens.get(0));
        assertEquals("D01", tokens.get(1));
        assertEquals("CSE101", tokens.get(2));
        assertEquals("Programming Fundamentals", tokens.get(3));
        assertEquals("1", tokens.get(4));
        assertEquals("4", tokens.get(5));
        assertEquals("FALL,SPRING", tokens.get(6));
        assertEquals("", tokens.get(7));
        assertEquals("M.E CSE", tokens.get(8));
        assertEquals("1", tokens.get(9));
    }

    @Test
    @DisplayName("importVsbDemoData should fail gracefully if directory does not exist")
    void testImportVsbDemoData_DirectoryNotFound() {
        VsbImportSummaryDto summary = vsbDemoDataService.importVsbDemoData("C:/NonExistentDirectory/12345");

        assertNotNull(summary);
        assertEquals("FAILED", summary.getStatus());
        assertFalse(summary.getValidationErrors().isEmpty());
    }

    @Test
    @DisplayName("getVsbDemoStatus should return installed false when institution missing")
    void testGetVsbDemoStatus_NotInstalled() {
        when(jdbcTemplate.queryForList(eq("SELECT id FROM institution WHERE code = 'VSB'"), eq(Long.class)))
                .thenReturn(Collections.emptyList());

        VsbDemoStatusDto status = vsbDemoDataService.getVsbDemoStatus();

        assertNotNull(status);
        assertFalse(status.isInstalled());
        assertEquals("VSB", status.getInstitutionCode());
    }

    @Test
    @DisplayName("getVsbDemoStatus should return installed true when institution exists")
    void testGetVsbDemoStatus_Installed() {
        when(jdbcTemplate.queryForList(eq("SELECT id FROM institution WHERE code = 'VSB'"), eq(Long.class)))
                .thenReturn(List.of(100L));
        when(jdbcTemplate.queryForList(contains("FROM departments"), eq(Long.class), any()))
                .thenReturn(List.of(10L));

        VsbDemoStatusDto status = vsbDemoDataService.getVsbDemoStatus();

        assertNotNull(status);
        assertTrue(status.isInstalled());
        assertEquals("VSB", status.getInstitutionCode());
        assertNotNull(status.getEntityCounts());
    }
}
