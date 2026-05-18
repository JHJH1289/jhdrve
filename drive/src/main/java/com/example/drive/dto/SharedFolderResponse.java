package com.example.drive.dto;

import java.util.List;

public class SharedFolderResponse {

    private final String folderPath;
    private final List<PhotoResponse> photos;

    public SharedFolderResponse(String folderPath, List<PhotoResponse> photos) {
        this.folderPath = folderPath;
        this.photos = photos;
    }

    public String getFolderPath() {
        return folderPath;
    }

    public List<PhotoResponse> getPhotos() {
        return photos;
    }
}
