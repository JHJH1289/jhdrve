package com.example.drive.dto;

import java.time.LocalDateTime;

public class PhotoMetadata {

    private final Integer width;
    private final Integer height;
    private final LocalDateTime takenAt;

    private final String cameraMake;
    private final String cameraModel;
    private final String focalLength;
    private final String fNumber;
    private final String exposureTime;
    private final Integer iso;
    private final String lensModel;

    public PhotoMetadata(
            Integer width,
            Integer height,
            LocalDateTime takenAt,
            String cameraMake,
            String cameraModel,
            String focalLength,
            String fNumber,
            String exposureTime,
            Integer iso,
            String lensModel
    ) {
        this.width = width;
        this.height = height;
        this.takenAt = takenAt;
        this.cameraMake = cameraMake;
        this.cameraModel = cameraModel;
        this.focalLength = focalLength;
        this.fNumber = fNumber;
        this.exposureTime = exposureTime;
        this.iso = iso;
        this.lensModel = lensModel;
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

    public String getFocalLength() {
        return focalLength;
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