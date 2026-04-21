package com.example.drive.dto;

import java.time.LocalDateTime;

public class PhotoResponse {

    private final Long id;
    private final String ownerId;
    private final String folderPath;
    private final String originalName;
    private final String storageKey;
    private final String contentType;
    private final long fileSize;
    private final String imageUrl;
    private final LocalDateTime createdAt;
    private final Integer width;
    private final Integer height;
    private final LocalDateTime takenAt;
    private final String cameraModel;
    private final Integer iso;

    public PhotoResponse(
            Long id,
            String ownerId,
            String folderPath,
            String originalName,
            String storageKey,
            String contentType,
            long fileSize,
            String imageUrl,
            LocalDateTime createdAt,
            Integer width,
            Integer height,
            LocalDateTime takenAt,
            String cameraModel,
            Integer iso
    ) {
        this.id = id;
        this.ownerId = ownerId;
        this.folderPath = folderPath;
        this.originalName = originalName;
        this.storageKey = storageKey;
        this.contentType = contentType;
        this.fileSize = fileSize;
        this.imageUrl = imageUrl;
        this.createdAt = createdAt;
        this.width = width;
        this.height = height;
        this.takenAt = takenAt;
        this.cameraModel = cameraModel;
        this.iso = iso;
    }

    public Long getId() { return id; }
    public String getOwnerId() { return ownerId; }
    public String getFolderPath() { return folderPath; }
    public String getOriginalName() { return originalName; }
    public String getStorageKey() { return storageKey; }
    public String getContentType() { return contentType; }
    public long getFileSize() { return fileSize; }
    public String getImageUrl() { return imageUrl; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public Integer getWidth() { return width; }
    public Integer getHeight() { return height; }
    public LocalDateTime getTakenAt() { return takenAt; }
    public String getCameraModel() { return cameraModel; }
    public Integer getIso() { return iso; }
}