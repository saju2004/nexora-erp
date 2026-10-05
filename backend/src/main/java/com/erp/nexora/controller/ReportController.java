package com.erp.nexora.controller;

import com.erp.nexora.dto.ApiResponse;
import com.erp.nexora.service.ReportService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.Map;

@RestController
@RequestMapping("/api/reports")
public class ReportController {

    private final ReportService reportService;

    public ReportController(ReportService reportService) {
        this.reportService = reportService;
    }

    @GetMapping("/sales")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getSalesReport(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        return ResponseEntity.ok(ApiResponse.ok(reportService.getSalesReport(startDate, endDate)));
    }

    @GetMapping("/inventory")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getInventoryReport() {
        return ResponseEntity.ok(ApiResponse.ok(reportService.getInventoryReport()));
    }

    @GetMapping("/financial")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getFinancialReport() {
        return ResponseEntity.ok(ApiResponse.ok(reportService.getFinancialReport()));
    }

    @GetMapping("/employees")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getEmployeeReport() {
        return ResponseEntity.ok(ApiResponse.ok(reportService.getEmployeeReport()));
    }
}
