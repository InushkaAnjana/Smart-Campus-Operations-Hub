package com.smartcampus.model;

import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

/**
 * ================================================================
 * Resource Document (Campus Facilities & Resources) - MongoDB
 * ================================================================
 * Represents a bookable campus resource: rooms, labs, equipment, etc.
 * ================================================================
 */
@Document(collection = "resources")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Resource {

    @Id
    private String id;

    private String name;

    private String description;

    @Indexed
    private String type;

    private String location;

    private Integer capacity;

    private Boolean isAvailable;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        if (this.isAvailable == null) this.isAvailable = true;
    }

    public void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
