package com.inventory.entity;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "roles")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Role {

    @Id
    private Long id;

    @Indexed(unique = true)
    private String name; // ROLE_ADMIN, ROLE_INVENTORY_MANAGER, ROLE_STAFF

    private String description;
}
