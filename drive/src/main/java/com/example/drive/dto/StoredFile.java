package com.example.drive.dto;

public class StoredFile {

    private final String originalName;
    private final String storageKey;
    private final String contentType;
    private final long size;

    public StoredFile(String originalName, String storageKey, String contentType, long size) {
        this.originalName = originalName;
        this.storageKey = storageKey;
        this.contentType = contentType;
        this.size = size;
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

    public long getSize() {
        return size;
    }
}