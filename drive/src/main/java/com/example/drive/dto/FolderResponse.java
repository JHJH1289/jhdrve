package com.example.drive.dto;

import java.time.LocalDateTime;

public class FolderResponse {

    private final String folderPath;
    private final LocalDateTime updatedAt;
    private final Integer sortOrder;
    private final long photoCount;

    public FolderResponse(String folderPath, LocalDateTime updatedAt, Integer sortOrder, long photoCount) {
        this.folderPath = folderPath;
        this.updatedAt = updatedAt;
        this.sortOrder = sortOrder;
        this.photoCount = photoCount;
    }

    public String getFolderPath() {
        return folderPath;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public Integer getSortOrder() {
        return sortOrder;
    }

    public long getPhotoCount() {
        return photoCount;
    }
}
