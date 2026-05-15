package com.example.drive.repository;

import com.example.drive.entity.Photo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface PhotoRepository extends JpaRepository<Photo, Long> {

    List<Photo> findAllByOwnerIdAndDeletedAtIsNull(String ownerId);

    List<Photo> findAllByOwnerIdAndDeletedAtIsNotNull(String ownerId);

    List<Photo> findAllByOwnerIdAndFolderPathAndDeletedAtIsNull(String ownerId, String folderPath);

    Optional<Photo> findByIdAndOwnerIdAndDeletedAtIsNull(Long id, String ownerId);

    Optional<Photo> findByIdAndOwnerIdAndDeletedAtIsNotNull(Long id, String ownerId);

    long countByOwnerIdAndFolderPathAndDeletedAtIsNull(String ownerId, String folderPath);

    @Modifying
    @Query("update Photo p set p.folderPath = :nextFolderPath where p.ownerId = :ownerId and p.folderPath = :currentFolderPath")
    int updateFolderPathByOwnerId(
            @Param("ownerId") String ownerId,
            @Param("currentFolderPath") String currentFolderPath,
            @Param("nextFolderPath") String nextFolderPath
    );

    @Query("select distinct p.folderPath from Photo p where p.ownerId = :ownerId and p.deletedAt is null")
    List<String> findDistinctFolderPathByOwnerId(@Param("ownerId") String ownerId);

    @Query("select distinct p.ownerId from Photo p where p.deletedAt is null")
    List<String> findDistinctOwnerId();

    @Query("select max(coalesce(p.takenAt, p.createdAt)) from Photo p where p.ownerId = :ownerId and p.folderPath = :folderPath and p.deletedAt is null")
    Optional<LocalDateTime> findLatestPhotoAtByOwnerIdAndFolderPath(
        @Param("ownerId") String ownerId,
        @Param("folderPath") String folderPath
    );

    @Query("select coalesce(sum(coalesce(p.fileSize, 0)), 0) from Photo p where p.ownerId = :ownerId and p.folderPath = :folderPath and p.deletedAt is null")
    long sumFileSizeByOwnerIdAndFolderPath(
            @Param("ownerId") String ownerId,
            @Param("folderPath") String folderPath
    );

    @Query("select coalesce(sum(coalesce(p.fileSize, 0)), 0) from Photo p where p.ownerId = :ownerId")
    long sumFileSizeByOwnerId(@Param("ownerId") String ownerId);
}
