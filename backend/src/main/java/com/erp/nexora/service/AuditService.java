package com.erp.nexora.service;

import com.erp.nexora.entity.AuditLog;
import com.erp.nexora.repository.AuditLogRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AuditService {

    private final AuditLogRepository auditLogRepository;

    public AuditService(AuditLogRepository auditLogRepository) {
        this.auditLogRepository = auditLogRepository;
    }

    public void log(String username, String action, String module, String recordId, String details) {
        AuditLog log = new AuditLog(
                username != null ? username : "SYSTEM",
                action,
                module,
                recordId,
                details
        );
        auditLogRepository.save(log);
    }

    public Page<AuditLog> getLogs(String module, String action, String username, Pageable pageable) {
        return auditLogRepository.searchLogs(module, action, username, pageable);
    }

    public List<AuditLog> getRecentLogs() {
        return auditLogRepository.findTop20ByOrderByTimestampDesc();
    }
}
