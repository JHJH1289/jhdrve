package com.example.drive.dto;

import java.time.LocalDateTime;

public class PhotoUploadItemResponse {

    private final Long id;
    private final String ownerId;
    private final String folderPath;
    private final String originalName;
    private final String storageKey;
    private final long size;
    private final String imageUrl;
    private final Integer width;
    private final Integer height;
    private final LocalDateTime takenAt;
    private final String cameraModel;
    private final Integer iso;

    public PhotoUploadItemResponse(
            Long id,
            String ownerId,
            String folderPath,
            String originalName,
            String storageKey,
            long size,
            String imageUrl,
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
        this.size = size;
        this.imageUrl = imageUrl;
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

    public String getFolderPath() {
        return folderPath;
    }

    public String getOriginalName() {
        return originalName;
    }

    public String getStorageKey() {
        return storageKey;
    }

    public long getSize() {
        return size;
    }

    public String getImageUrl() {
        return imageUrl;
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
