package com.example.drive.repository;

import com.example.drive.entity.FolderShareLink;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface FolderShareLinkRepository extends JpaRepository<FolderShareLink, Long> {
    Optional<FolderShareLink> findByToken(String token);
    Optional<FolderShareLink> findByOwnerIdAndFolderPath(String ownerId, String folderPath);
}
