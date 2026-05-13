package com.example.drive.dto;

import java.time.LocalDateTime;
import java.util.List;

public class FolderResponse {

    private final String ownerId;
    private final String folderPath;
    private final LocalDateTime updatedAt;
    private final Integer sortOrder;
    private final long photoCount;
    private final List<String> previewImageUrls;

    public FolderResponse(
            String ownerId,
            String folderPath,
            LocalDateTime updatedAt,
            Integer sortOrder,
            long photoCount,
            List<String> previewImageUrls
    ) {
        this.ownerId = ownerId;
        this.folderPath = folderPath;
        this.updatedAt = updatedAt;
        this.sortOrder = sortOrder;
        this.photoCount = photoCount;
        this.previewImageUrls = previewImageUrls;
    }

    public String getOwnerId() {
        return ownerId;
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

    public List<String> getPreviewImageUrls() {
        return previewImageUrls;
    }
}
