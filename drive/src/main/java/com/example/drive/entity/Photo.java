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
    private String ownerId;

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

    @Column(nullable = false)
    private String folderPath;

    private Integer width;

    private Integer height;

    private LocalDateTime takenAt;

    private String cameraModel;

    private Integer iso;

    protected Photo() {
    }

    public Photo(
            String ownerId,
            String originalName,
            String storageKey,
            String contentType,
            Long fileSize,
            LocalDateTime createdAt,
            String folderPath,
            Integer width,
            Integer height,
            LocalDateTime takenAt,
            String cameraModel,
            Integer iso
    ) {
        this.ownerId = ownerId;
        this.originalName = originalName;
        this.storageKey = storageKey;
        this.contentType = contentType;
        this.fileSize = fileSize;
        this.createdAt = createdAt;
        this.folderPath = folderPath;
        this.width = width;
        this.height = height;
        this.takenAt = takenAt;
        this.cameraModel = cameraModel;
        this.iso = iso;
    }

    public Long getId() {
        return id;
    }

    public String getOwnerId() {
        return ownerId;
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

    public String getFolderPath() {
        return folderPath;
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
