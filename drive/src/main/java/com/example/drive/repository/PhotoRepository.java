package com.example.drive.repository;

import com.example.drive.entity.Photo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface PhotoRepository extends JpaRepository<Photo, Long> {

    List<Photo> findAllByOwnerId(String ownerId);

    Optional<Photo> findByIdAndOwnerId(Long id, String ownerId);

    Optional<Photo> findByStorageKey(String storageKey);

    @Query("select distinct p.folderPath from Photo p where p.ownerId = :ownerId")
    List<String> findDistinctFolderPathByOwnerId(@Param("ownerId") String ownerId);
}