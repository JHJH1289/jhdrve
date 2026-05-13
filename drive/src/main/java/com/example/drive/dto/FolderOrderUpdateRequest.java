package com.example.drive.dto;

import java.util.List;

public class FolderOrderUpdateRequest {

    private List<String> folderPaths;

    public FolderOrderUpdateRequest() {
    }

    public List<String> getFolderPaths() {
        return folderPaths;
    }

    public void setFolderPaths(List<String> folderPaths) {
        this.folderPaths = folderPaths;
    }
}
