package com.erp.nexora.service;

import com.erp.nexora.entity.Project;
import com.erp.nexora.entity.ProjectTask;
import com.erp.nexora.exception.ResourceNotFoundException;
import com.erp.nexora.repository.ProjectRepository;
import com.erp.nexora.repository.ProjectTaskRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final ProjectTaskRepository projectTaskRepository;
    private final AuditService auditService;

    public ProjectService(ProjectRepository projectRepository,
                          ProjectTaskRepository projectTaskRepository,
                          AuditService auditService) {
        this.projectRepository = projectRepository;
        this.projectTaskRepository = projectTaskRepository;
        this.auditService = auditService;
    }

    public Page<Project> getProjects(String search, String status, String priority, Pageable pageable) {
        return projectRepository.searchProjects(search, status, priority, pageable);
    }

    public List<Project> getAllProjectsList() {
        return projectRepository.findAll();
    }

    public Project getProjectById(Long id) {
        return projectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Project", "id", id));
    }

    @Transactional
    public Project createProject(Project project, String username) {
        if (project.getProjectCode() == null || project.getProjectCode().isBlank()) {
            project.setProjectCode("PRJ-" + (100 + projectRepository.count() + 1));
        }
        Project saved = projectRepository.save(project);
        auditService.log(username, "CREATE", "PROJECTS", saved.getId().toString(),
                "Created project " + saved.getName() + " (" + saved.getProjectCode() + ")");
        return saved;
    }

    @Transactional
    public Project updateProject(Long id, Project updated, String username) {
        Project existing = getProjectById(id);
        existing.setName(updated.getName());
        existing.setClientName(updated.getClientName());
        existing.setStartDate(updated.getStartDate());
        existing.setEndDate(updated.getEndDate());
        existing.setBudget(updated.getBudget());
        existing.setSpent(updated.getSpent());
        existing.setStatus(updated.getStatus());
        existing.setPriority(updated.getPriority());
        existing.setProgressPercentage(updated.getProgressPercentage());
        existing.setDescription(updated.getDescription());

        Project saved = projectRepository.save(existing);
        auditService.log(username, "UPDATE", "PROJECTS", saved.getId().toString(),
                "Updated project " + saved.getName());
        return saved;
    }

    // Tasks
    public Page<ProjectTask> getTasks(Long projectId, String status, String priority, Pageable pageable) {
        return projectTaskRepository.searchTasks(projectId, status, priority, pageable);
    }

    public List<ProjectTask> getUpcomingTasks() {
        return projectTaskRepository.findTop10ByOrderByDueDateAsc();
    }

    @Transactional
    public ProjectTask createTask(ProjectTask task, String username) {
        ProjectTask saved = projectTaskRepository.save(task);
        updateProjectProgress(saved.getProject().getId());
        auditService.log(username, "CREATE_TASK", "PROJECTS", saved.getId().toString(),
                "Created task " + saved.getTitle() + " for project " + saved.getProject().getName());
        return saved;
    }

    @Transactional
    public ProjectTask updateTaskStatus(Long taskId, String status, String username) {
        ProjectTask task = projectTaskRepository.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("ProjectTask", "id", taskId));
        task.setStatus(status);
        ProjectTask saved = projectTaskRepository.save(task);
        updateProjectProgress(saved.getProject().getId());

        auditService.log(username, "UPDATE_TASK", "PROJECTS", taskId.toString(),
                "Updated task " + task.getTitle() + " status to " + status);
        return saved;
    }

    private void updateProjectProgress(Long projectId) {
        List<ProjectTask> tasks = projectTaskRepository.findByProjectId(projectId);
        if (tasks.isEmpty()) return;
        long doneCount = tasks.stream().filter(t -> "DONE".equalsIgnoreCase(t.getStatus())).count();
        int progress = (int) Math.round(((double) doneCount / tasks.size()) * 100);
        Project project = getProjectById(projectId);
        project.setProgressPercentage(progress);
        if (progress == 100) project.setStatus("COMPLETED");
        projectRepository.save(project);
    }
}
