package com.example.drive.repository;

import com.example.drive.entity.Photo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface PhotoRepository extends JpaRepository<Photo, Long> {

    List<Photo> findAllByOwnerId(String ownerId);

    List<Photo> findAllByOwnerIdAndFolderPath(String ownerId, String folderPath);

    Optional<Photo> findByIdAndOwnerId(Long id, String ownerId);

    long countByOwnerIdAndFolderPath(String ownerId, String folderPath);

    @Query("select distinct p.folderPath from Photo p where p.ownerId = :ownerId")
    List<String> findDistinctFolderPathByOwnerId(@Param("ownerId") String ownerId);

    @Query("select max(p.createdAt) from Photo p where p.ownerId = :ownerId and p.folderPath = :folderPath")
    Optional<LocalDateTime> findLatestCreatedAtByOwnerIdAndFolderPath(
            @Param("ownerId") String ownerId,
            @Param("folderPath") String folderPath
    );
}
