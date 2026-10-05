package com.erp.nexora.repository;

import com.erp.nexora.entity.Attendance;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface AttendanceRepository extends JpaRepository<Attendance, Long> {
    List<Attendance> findByAttendanceDate(LocalDate date);

    @Query("SELECT a FROM Attendance a WHERE " +
           "(:date IS NULL OR a.attendanceDate = :date) AND " +
           "(:department IS NULL OR a.employee.department = :department) AND " +
           "(:status IS NULL OR a.status = :status)")
    Page<Attendance> searchAttendance(
            @Param("date") LocalDate date,
            @Param("department") String department,
            @Param("status") String status,
            Pageable pageable);
}
