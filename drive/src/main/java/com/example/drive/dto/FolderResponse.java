package com.example.drive.dto;

import java.time.LocalDateTime;
import java.util.List;

public class FolderResponse {

    private final String ownerId;
    private final String folderPath;
    private final LocalDateTime updatedAt;
    private final Integer sortOrder;
    private final long photoCount;
    private final long totalSize;
    private final LocalDateTime latestPhotoAt;
    private final List<String> tags;
    private final List<String> previewImageUrls;

    public FolderResponse(
            String ownerId,
            String folderPath,
            LocalDateTime updatedAt,
            Integer sortOrder,
            long photoCount,
            long totalSize,
            LocalDateTime latestPhotoAt,
            List<String> tags,
            List<String> previewImageUrls
    ) {
        this.ownerId = ownerId;
        this.folderPath = folderPath;
        this.updatedAt = updatedAt;
        this.sortOrder = sortOrder;
        this.photoCount = photoCount;
        this.totalSize = totalSize;
        this.latestPhotoAt = latestPhotoAt;
        this.tags = tags;
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

    public long getTotalSize() {
        return totalSize;
    }

    public LocalDateTime getLatestPhotoAt() {
        return latestPhotoAt;
    }

    public List<String> getTags() {
        return tags;
    }

    public List<String> getPreviewImageUrls() {
        return previewImageUrls;
    }
}
