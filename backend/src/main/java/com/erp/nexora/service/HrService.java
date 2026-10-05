package com.erp.nexora.service;

import com.erp.nexora.entity.Attendance;
import com.erp.nexora.entity.Employee;
import com.erp.nexora.entity.LeaveRequest;
import com.erp.nexora.entity.Payroll;
import com.erp.nexora.exception.ResourceNotFoundException;
import com.erp.nexora.repository.AttendanceRepository;
import com.erp.nexora.repository.EmployeeRepository;
import com.erp.nexora.repository.LeaveRequestRepository;
import com.erp.nexora.repository.PayrollRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Service
public class HrService {

    private final EmployeeRepository employeeRepository;
    private final AttendanceRepository attendanceRepository;
    private final LeaveRequestRepository leaveRequestRepository;
    private final PayrollRepository payrollRepository;
    private final AuditService auditService;
    private final NotificationService notificationService;

    public HrService(EmployeeRepository employeeRepository,
                     AttendanceRepository attendanceRepository,
                     LeaveRequestRepository leaveRequestRepository,
                     PayrollRepository payrollRepository,
                     AuditService auditService,
                     NotificationService notificationService) {
        this.employeeRepository = employeeRepository;
        this.attendanceRepository = attendanceRepository;
        this.leaveRequestRepository = leaveRequestRepository;
        this.payrollRepository = payrollRepository;
        this.auditService = auditService;
        this.notificationService = notificationService;
    }

    // Employees
    public Page<Employee> getEmployees(String search, String department, String status, Pageable pageable) {
        return employeeRepository.searchEmployees(search, department, status, pageable);
    }

    public List<Employee> getAllEmployeesList() {
        return employeeRepository.findAll();
    }

    public Employee getEmployeeById(Long id) {
        return employeeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Employee", "id", id));
    }

    @Transactional
    public Employee createEmployee(Employee employee, String username) {
        if (employee.getEmployeeCode() == null || employee.getEmployeeCode().isBlank()) {
            employee.setEmployeeCode("EMP-" + (1000 + employeeRepository.count() + 1));
        }
        Employee saved = employeeRepository.save(employee);
        auditService.log(username, "CREATE", "HR", saved.getId().toString(),
                "Added employee " + saved.getFullName() + " (" + saved.getEmployeeCode() + ")");
        return saved;
    }

    @Transactional
    public Employee updateEmployee(Long id, Employee updated, String username) {
        Employee existing = getEmployeeById(id);
        existing.setFirstName(updated.getFirstName());
        existing.setLastName(updated.getLastName());
        existing.setEmail(updated.getEmail());
        existing.setPhone(updated.getPhone());
        existing.setDepartment(updated.getDepartment());
        existing.setDesignation(updated.getDesignation());
        existing.setBasicSalary(updated.getBasicSalary());
        existing.setEmploymentType(updated.getEmploymentType());
        existing.setStatus(updated.getStatus());

        Employee saved = employeeRepository.save(existing);
        auditService.log(username, "UPDATE", "HR", saved.getId().toString(),
                "Updated employee record for " + saved.getFullName());
        return saved;
    }

    // Attendance
    public Page<Attendance> getAttendance(LocalDate date, String department, String status, Pageable pageable) {
        return attendanceRepository.searchAttendance(date, department, status, pageable);
    }

    @Transactional
    public Attendance recordAttendance(Attendance attendance, String username) {
        Attendance saved = attendanceRepository.save(attendance);
        auditService.log(username, "RECORD_ATTENDANCE", "HR", saved.getId().toString(),
                "Recorded attendance for " + saved.getEmployee().getFullName() + " as " + saved.getStatus());
        return saved;
    }

    // Leaves
    public Page<LeaveRequest> getLeaves(String status, String leaveType, Pageable pageable) {
        return leaveRequestRepository.searchLeaves(status, leaveType, pageable);
    }

    @Transactional
    public LeaveRequest applyLeave(LeaveRequest request, String username) {
        request.setStatus("PENDING");
        LeaveRequest saved = leaveRequestRepository.save(request);

        notificationService.createNotification(
                "New Leave Request",
                request.getEmployee().getFullName() + " submitted " + request.getLeaveType() + " leave (" + request.getDaysCount() + " days)",
                "INFO",
                "/hr/leave"
        );

        auditService.log(username, "APPLY_LEAVE", "HR", saved.getId().toString(),
                "Submitted leave request for " + saved.getEmployee().getFullName());
        return saved;
    }

    @Transactional
    public LeaveRequest updateLeaveStatus(Long id, String status, String username) {
        LeaveRequest request = leaveRequestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("LeaveRequest", "id", id));
        request.setStatus(status);
        request.setApprovedBy(username);
        LeaveRequest saved = leaveRequestRepository.save(request);

        auditService.log(username, "LEAVE_" + status, "HR", id.toString(),
                status + " leave request for " + saved.getEmployee().getFullName());
        return saved;
    }

    // Payroll
    public Page<Payroll> getPayroll(String month, String status, Pageable pageable) {
        return payrollRepository.searchPayroll(month, status, pageable);
    }

    @Transactional
    public Payroll processPayroll(Long employeeId, String month, BigDecimal allowances, BigDecimal deductions, String username) {
        Employee employee = getEmployeeById(employeeId);
        BigDecimal basic = employee.getBasicSalary();
        BigDecimal net = basic.add(allowances != null ? allowances : BigDecimal.ZERO)
                .subtract(deductions != null ? deductions : BigDecimal.ZERO);

        Payroll payroll = new Payroll();
        payroll.setPayrollMonth(month);
        payroll.setEmployee(employee);
        payroll.setBasicSalary(basic);
        payroll.setAllowances(allowances != null ? allowances : BigDecimal.ZERO);
        payroll.setDeductions(deductions != null ? deductions : BigDecimal.ZERO);
        payroll.setNetSalary(net);
        payroll.setStatus("PROCESSED");
        payroll.setPaymentDate(LocalDate.now());
        payroll.setPaymentReference("PAYROLL-" + month + "-" + employee.getEmployeeCode());

        Payroll saved = payrollRepository.save(payroll);
        auditService.log(username, "PROCESS_PAYROLL", "HR", saved.getId().toString(),
                "Processed payroll for " + employee.getFullName() + " (" + month + ") Net: AED " + net);
        return saved;
    }

    @Transactional
    public Payroll markPayrollPaid(Long id, String username) {
        Payroll payroll = payrollRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Payroll", "id", id));
        payroll.setStatus("PAID");
        payroll.setPaymentDate(LocalDate.now());
        Payroll saved = payrollRepository.save(payroll);
        auditService.log(username, "PAYROLL_PAID", "HR", id.toString(),
                "Marked payroll as PAID for " + saved.getEmployee().getFullName());
        return saved;
    }
}
