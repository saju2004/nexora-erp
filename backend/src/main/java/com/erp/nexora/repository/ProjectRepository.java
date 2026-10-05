package com.erp.nexora.repository;

import com.erp.nexora.entity.Project;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProjectRepository extends JpaRepository<Project, Long> {

    @Query("SELECT p FROM Project p WHERE " +
           "(:search IS NULL OR LOWER(p.name) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(p.clientName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(p.projectCode) LIKE LOWER(CONCAT('%', :search, '%'))) AND " +
           "(:status IS NULL OR p.status = :status) AND " +
           "(:priority IS NULL OR p.priority = :priority)")
    Page<Project> searchProjects(
            @Param("search") String search,
            @Param("status") String status,
            @Param("priority") String priority,
            Pageable pageable);

    long countByStatus(String status);
}
