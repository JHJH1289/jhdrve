package com.example.drive.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "photos")
public class Photo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
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

    @Column(nullable = false, length = 300)
    private String folderPath;

    private Integer width;

    private Integer height;

    private LocalDateTime takenAt;

    @Column(length = 100)
    private String cameraMake;

    @Column(length = 200)
    private String cameraModel;

    @Column(length = 50)
    private String fNumber;

    @Column(length = 50)
    private String exposureTime;

    private Integer iso;

    @Column(length = 200)
    private String lensModel;

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
            String cameraMake,
            String cameraModel,
            String fNumber,
            String exposureTime,
            Integer iso,
            String lensModel
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
        this.cameraMake = cameraMake;
        this.cameraModel = cameraModel;
        this.fNumber = fNumber;
        this.exposureTime = exposureTime;
        this.iso = iso;
        this.lensModel = lensModel;
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

    public String getCameraMake() {
        return cameraMake;
    }

    public String getCameraModel() {
        return cameraModel;
    }

    public String getFNumber() {
        return fNumber;
    }

    public String getExposureTime() {
        return exposureTime;
    }

    public Integer getIso() {
        return iso;
    }

    public String getLensModel() {
        return lensModel;
    }
}