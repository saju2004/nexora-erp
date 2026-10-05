package com.erp.nexora.repository;

import com.erp.nexora.entity.LeaveRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LeaveRequestRepository extends JpaRepository<LeaveRequest, Long> {
    List<LeaveRequest> findByStatus(String status);

    @Query("SELECT l FROM LeaveRequest l WHERE " +
           "(:status IS NULL OR l.status = :status) AND " +
           "(:leaveType IS NULL OR l.leaveType = :leaveType)")
    Page<LeaveRequest> searchLeaves(@Param("status") String status, @Param("leaveType") String leaveType, Pageable pageable);

    long countByStatus(String status);
}
