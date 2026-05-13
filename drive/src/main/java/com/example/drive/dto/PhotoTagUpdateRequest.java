package com.example.drive.dto;

import java.util.List;

public class PhotoTagUpdateRequest {

    private List<Long> photoIds;
    private String tags;

    public List<Long> getPhotoIds() {
        return photoIds;
    }

    public void setPhotoIds(List<Long> photoIds) {
        this.photoIds = photoIds;
    }

    public String getTags() {
        return tags;
    }

    public void setTags(String tags) {
        this.tags = tags;
    }
}
