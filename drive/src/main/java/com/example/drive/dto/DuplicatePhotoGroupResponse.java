package com.example.drive.dto;

import java.util.List;

public class DuplicatePhotoGroupResponse {

    private final PhotoResponse keepPhoto;
    private final List<PhotoResponse> duplicatePhotos;

    public DuplicatePhotoGroupResponse(PhotoResponse keepPhoto, List<PhotoResponse> duplicatePhotos) {
        this.keepPhoto = keepPhoto;
        this.duplicatePhotos = duplicatePhotos;
    }

    public PhotoResponse getKeepPhoto() {
        return keepPhoto;
    }

    public List<PhotoResponse> getDuplicatePhotos() {
        return duplicatePhotos;
    }
}
