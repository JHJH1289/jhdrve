package com.example.drive.dto;

public class FolderRenameRequest {

    private String currentFolderPath;
    private String nextFolderPath;

    public FolderRenameRequest() {
    }

    public String getCurrentFolderPath() {
        return currentFolderPath;
    }

    public void setCurrentFolderPath(String currentFolderPath) {
        this.currentFolderPath = currentFolderPath;
    }

    public String getNextFolderPath() {
        return nextFolderPath;
    }

    public void setNextFolderPath(String nextFolderPath) {
        this.nextFolderPath = nextFolderPath;
    }
}
