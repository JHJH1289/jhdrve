package com.example.drive.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.LocalDateTime;

@Entity
@Table(name = "folder_share_links")
public class FolderShareLink {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 80)
    private String token;

    @Column(nullable = false, length = 100)
    private String ownerId;

    @Column(nullable = false, length = 300)
    private String folderPath;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    protected FolderShareLink() {
    }

    public FolderShareLink(String token, String ownerId, String folderPath, LocalDateTime createdAt) {
        this.token = token;
        this.ownerId = ownerId;
        this.folderPath = folderPath;
        this.createdAt = createdAt;
    }

    public Long getId() {
        return id;
    }

    public String getToken() {
        return token;
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
}
