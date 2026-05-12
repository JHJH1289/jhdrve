package com.example.drive.repository;

import com.example.drive.entity.PhotoFolder;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PhotoFolderRepository extends JpaRepository<PhotoFolder, Long> {

    List<PhotoFolder> findAllByOwnerId(String ownerId);

    boolean existsByOwnerIdAndFolderPath(String ownerId, String folderPath);
}
