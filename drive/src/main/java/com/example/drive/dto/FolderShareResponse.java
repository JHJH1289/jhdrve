package com.example.drive.dto;

import java.time.LocalDateTime;

public class FolderShareResponse {

    private final String token;
    private final String folderPath;
    private final String shareUrl;
    private final LocalDateTime createdAt;

    public FolderShareResponse(String token, String folderPath, String shareUrl, LocalDateTime createdAt) {
        this.token = token;
        this.folderPath = folderPath;
        this.shareUrl = shareUrl;
        this.createdAt = createdAt;
    }

    public String getToken() {
        return token;
    }

    public String getFolderPath() {
        return folderPath;
    }

    public String getShareUrl() {
        return shareUrl;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}
