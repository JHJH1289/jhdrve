package com.example.drive.repository;

import com.example.drive.entity.Photo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface PhotoRepository extends JpaRepository<Photo, Long> {

    List<Photo> findAllByOwnerId(String ownerId);

    List<Photo> findAllByOwnerIdAndFolderPath(String ownerId, String folderPath);

    Optional<Photo> findByIdAndOwnerId(Long id, String ownerId);

    @Query("select distinct p.folderPath from Photo p where p.ownerId = :ownerId")
    List<String> findDistinctFolderPathByOwnerId(@Param("ownerId") String ownerId);
}
