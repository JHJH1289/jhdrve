package com.example.drive.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "photo_folders",
        uniqueConstraints = @UniqueConstraint(columnNames = {"owner_id", "folder_path"})
)
public class PhotoFolder {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "owner_id", nullable = false, length = 100)
    private String ownerId;

    @Column(name = "folder_path", nullable = false, length = 300)
    private String folderPath;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    private Integer sortOrder;

    protected PhotoFolder() {
    }

    public PhotoFolder(String ownerId, String folderPath, LocalDateTime createdAt) {
        this.ownerId = ownerId;
        this.folderPath = folderPath;
        this.createdAt = createdAt;
        this.updatedAt = createdAt;
        this.sortOrder = 0;
    }

    public Long getId() {
        return id;
    }

    public String getOwnerId() {
        return ownerId;
    }

    public String getFolderPath() {
        return folderPath;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt != null ? updatedAt : createdAt;
    }

    public Integer getSortOrder() {
        return sortOrder;
    }

    public void touch(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public void rename(String folderPath, LocalDateTime updatedAt) {
        this.folderPath = folderPath;
        this.updatedAt = updatedAt;
    }

    public void changeSortOrder(Integer sortOrder) {
        this.sortOrder = sortOrder;
    }
}
