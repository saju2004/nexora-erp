package com.erp.nexora.repository;

import com.erp.nexora.entity.Payroll;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface PayrollRepository extends JpaRepository<Payroll, Long> {
    List<Payroll> findByPayrollMonth(String month);

    @Query("SELECT p FROM Payroll p WHERE " +
           "(:month IS NULL OR p.payrollMonth = :month) AND " +
           "(:status IS NULL OR p.status = :status)")
    Page<Payroll> searchPayroll(@Param("month") String month, @Param("status") String status, Pageable pageable);

    @Query("SELECT COALESCE(SUM(p.netSalary), 0) FROM Payroll p WHERE p.payrollMonth = :month")
    BigDecimal calculateTotalPayrollForMonth(@Param("month") String month);
}
