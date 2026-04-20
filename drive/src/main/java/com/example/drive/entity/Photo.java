package com.example.drive.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "photos")
public class Photo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String originalName;

    @Column(nullable = false, unique = true, length = 500)
    private String storageKey;

    @Column(nullable = false)
    private String contentType;

    @Column(nullable = false)
    private Long fileSize;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    private Integer width;

    private Integer height;

    private LocalDateTime takenAt;

    private String cameraModel;

    private Integer iso;

    protected Photo() {
    }

    public Photo(
            String originalName,
            String storageKey,
            String contentType,
            Long fileSize,
            LocalDateTime createdAt,
            Integer width,
            Integer height,
            LocalDateTime takenAt,
            String cameraModel,
            Integer iso
    ) {
        this.originalName = originalName;
        this.storageKey = storageKey;
        this.contentType = contentType;
        this.fileSize = fileSize;
        this.createdAt = createdAt;
        this.width = width;
        this.height = height;
        this.takenAt = takenAt;
        this.cameraModel = cameraModel;
        this.iso = iso;
    }

    public Long getId() {
        return id;
    }

    public String getOriginalName() {
        return originalName;
    }

    public String getStorageKey() {
        return storageKey;
    }

    public String getContentType() {
        return contentType;
    }

    public Long getFileSize() {
        return fileSize;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public Integer getWidth() {
        return width;
    }

    public Integer getHeight() {
        return height;
    }

    public LocalDateTime getTakenAt() {
        return takenAt;
    }

    public String getCameraModel() {
        return cameraModel;
    }

    public Integer getIso() {
        return iso;
    }
}