package com.orders.audit;

import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class AuditLogDTO {
    private Long   id;
    private String performedBy;
    private String action;
    private String targetUser;
    private String details;
    private String timestamp;
}
