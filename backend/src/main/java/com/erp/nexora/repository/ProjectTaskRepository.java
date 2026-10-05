package com.erp.nexora.repository;

import com.erp.nexora.entity.ProjectTask;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProjectTaskRepository extends JpaRepository<ProjectTask, Long> {
    List<ProjectTask> findByProjectId(Long projectId);

    @Query("SELECT t FROM ProjectTask t WHERE " +
           "(:projectId IS NULL OR t.project.id = :projectId) AND " +
           "(:status IS NULL OR t.status = :status) AND " +
           "(:priority IS NULL OR t.priority = :priority)")
    Page<ProjectTask> searchTasks(
            @Param("projectId") Long projectId,
            @Param("status") String status,
            @Param("priority") String priority,
            Pageable pageable);

    List<ProjectTask> findTop10ByOrderByDueDateAsc();
}
