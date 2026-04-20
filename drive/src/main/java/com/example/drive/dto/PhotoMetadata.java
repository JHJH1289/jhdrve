package com.example.drive.dto;

import java.time.LocalDateTime;

public class PhotoMetadata {

    private final Integer width;
    private final Integer height;
    private final LocalDateTime takenAt;
    private final String cameraModel;
    private final Integer iso;

    public PhotoMetadata(Integer width, Integer height, LocalDateTime takenAt, String cameraModel, Integer iso) {
        this.width = width;
        this.height = height;
        this.takenAt = takenAt;
        this.cameraModel = cameraModel;
        this.iso = iso;
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