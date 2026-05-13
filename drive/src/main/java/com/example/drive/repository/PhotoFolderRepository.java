package com.example.drive.repository;

import com.example.drive.entity.PhotoFolder;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface PhotoFolderRepository extends JpaRepository<PhotoFolder, Long> {

    List<PhotoFolder> findAllByOwnerId(String ownerId);

    Optional<PhotoFolder> findByOwnerIdAndFolderPath(String ownerId, String folderPath);

}
