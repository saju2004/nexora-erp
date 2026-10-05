package com.erp.nexora.controller;

import com.erp.nexora.dto.ApiResponse;
import com.erp.nexora.entity.Attendance;
import com.erp.nexora.entity.Employee;
import com.erp.nexora.entity.LeaveRequest;
import com.erp.nexora.entity.Payroll;
import com.erp.nexora.service.HrService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/hr")
public class HrController {

    private final HrService hrService;

    public HrController(HrService hrService) {
        this.hrService = hrService;
    }

    // Employees
    @GetMapping("/employees")
    public ResponseEntity<ApiResponse<Page<Employee>>> getEmployees(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String department,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "15") int size,
            @RequestParam(defaultValue = "id,desc") String sort) {
        String[] sortParams = sort.split(",");
        Sort.Direction direction = sortParams.length > 1 && "asc".equalsIgnoreCase(sortParams[1]) ? Sort.Direction.ASC : Sort.Direction.DESC;
        return ResponseEntity.ok(ApiResponse.ok(hrService.getEmployees(search, department, status, PageRequest.of(page, size, Sort.by(direction, sortParams[0])))));
    }

    @GetMapping("/employees/all")
    public ResponseEntity<ApiResponse<List<Employee>>> getAllEmployees() {
        return ResponseEntity.ok(ApiResponse.ok(hrService.getAllEmployeesList()));
    }

    @GetMapping("/employees/{id}")
    public ResponseEntity<ApiResponse<Employee>> getEmployeeById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(hrService.getEmployeeById(id)));
    }

    @PostMapping("/employees")
    public ResponseEntity<ApiResponse<Employee>> createEmployee(
            @Valid @RequestBody Employee employee,
            @AuthenticationPrincipal UserDetails userDetails) {
        String username = userDetails != null ? userDetails.getUsername() : "SYSTEM";
        return ResponseEntity.ok(ApiResponse.ok("Employee registered successfully", hrService.createEmployee(employee, username)));
    }

    @PutMapping("/employees/{id}")
    public ResponseEntity<ApiResponse<Employee>> updateEmployee(
            @PathVariable Long id,
            @Valid @RequestBody Employee employee,
            @AuthenticationPrincipal UserDetails userDetails) {
        String username = userDetails != null ? userDetails.getUsername() : "SYSTEM";
        return ResponseEntity.ok(ApiResponse.ok("Employee updated successfully", hrService.updateEmployee(id, employee, username)));
    }

    // Attendance
    @GetMapping("/attendance")
    public ResponseEntity<ApiResponse<Page<Attendance>>> getAttendance(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam(required = false) String department,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.ok(hrService.getAttendance(date, department, status, PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "id")))));
    }

    @PostMapping("/attendance")
    public ResponseEntity<ApiResponse<Attendance>> recordAttendance(
            @Valid @RequestBody Attendance attendance,
            @AuthenticationPrincipal UserDetails userDetails) {
        String username = userDetails != null ? userDetails.getUsername() : "SYSTEM";
        return ResponseEntity.ok(ApiResponse.ok("Attendance recorded", hrService.recordAttendance(attendance, username)));
    }

    // Leaves
    @GetMapping("/leaves")
    public ResponseEntity<ApiResponse<Page<LeaveRequest>>> getLeaves(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String leaveType,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "15") int size) {
        return ResponseEntity.ok(ApiResponse.ok(hrService.getLeaves(status, leaveType, PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "id")))));
    }

    @PostMapping("/leaves")
    public ResponseEntity<ApiResponse<LeaveRequest>> applyLeave(
            @Valid @RequestBody LeaveRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        String username = userDetails != null ? userDetails.getUsername() : "SYSTEM";
        return ResponseEntity.ok(ApiResponse.ok("Leave application submitted", hrService.applyLeave(request, username)));
    }

    @PutMapping("/leaves/{id}/status")
    public ResponseEntity<ApiResponse<LeaveRequest>> updateLeaveStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> body,
            @AuthenticationPrincipal UserDetails userDetails) {
        String username = userDetails != null ? userDetails.getUsername() : "SYSTEM";
        return ResponseEntity.ok(ApiResponse.ok("Leave request " + body.get("status"), hrService.updateLeaveStatus(id, body.get("status"), username)));
    }

    // Payroll
    @GetMapping("/payroll")
    public ResponseEntity<ApiResponse<Page<Payroll>>> getPayroll(
            @RequestParam(required = false) String month,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "15") int size) {
        return ResponseEntity.ok(ApiResponse.ok(hrService.getPayroll(month, status, PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "id")))));
    }

    @PostMapping("/payroll/process")
    public ResponseEntity<ApiResponse<Payroll>> processPayroll(
            @RequestBody Map<String, Object> body,
            @AuthenticationPrincipal UserDetails userDetails) {
        String username = userDetails != null ? userDetails.getUsername() : "SYSTEM";
        Long employeeId = Long.valueOf(body.get("employeeId").toString());
        String month = (String) body.get("month");
        BigDecimal allowances = body.get("allowances") != null ? new BigDecimal(body.get("allowances").toString()) : BigDecimal.ZERO;
        BigDecimal deductions = body.get("deductions") != null ? new BigDecimal(body.get("deductions").toString()) : BigDecimal.ZERO;

        return ResponseEntity.ok(ApiResponse.ok("Payroll processed successfully", hrService.processPayroll(employeeId, month, allowances, deductions, username)));
    }

    @PutMapping("/payroll/{id}/pay")
    public ResponseEntity<ApiResponse<Payroll>> markPayrollPaid(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        String username = userDetails != null ? userDetails.getUsername() : "SYSTEM";
        return ResponseEntity.ok(ApiResponse.ok("Payroll marked as PAID", hrService.markPayrollPaid(id, username)));
    }
}
