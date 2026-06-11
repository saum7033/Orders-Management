package com.orders.audit;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AuditLogService {

    private final AuditLogRepository repo;

    public void log(String action, String performedBy, String targetUser, String details) {
        repo.save(AuditLog.builder()
                .action(action)
                .performedBy(performedBy)
                .targetUser(targetUser)
                .details(details)
                .build());
    }

    public List<AuditLogDTO> getAll() {
        return repo.findTop100ByOrderByTimestampDesc()
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    private AuditLogDTO toDTO(AuditLog log) {
        return new AuditLogDTO(
                log.getId(),
                log.getPerformedBy(),
                log.getAction(),
                log.getTargetUser(),
                log.getDetails(),
                log.getTimestamp().toString()
        );
    }
}
