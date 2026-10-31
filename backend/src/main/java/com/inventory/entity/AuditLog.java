package com.inventory.entity;

import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Document(collection = "audit_logs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuditLog {

    @Id
    private Long id;

    private String action;

    private String entityName;

    private String entityId;

    private String performedBy;

    private String details;

    private String ipAddress;

    @CreatedDate
    @Indexed
    private Instant createdAt;
}
