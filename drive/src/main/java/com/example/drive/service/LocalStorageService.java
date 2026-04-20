package com.example.drive.service;

import com.example.drive.dto.StoredFile;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDate;
import java.util.Set;
import java.util.UUID;

@Service
public class LocalStorageService implements StorageService {

    private static final Set<String> ALLOWED_TYPES = Set.of(
            "image/jpeg",
            "image/png",
            "image/webp",
            "image/gif"
    );

    private final Path basePath;

    public LocalStorageService(@Value("${app.storage.local.base-path}") String basePath) {
        this.basePath = Paths.get(basePath).toAbsolutePath().normalize();
    }

    @Override
    public StoredFile store(MultipartFile file) {
        validate(file);

        try {
            LocalDate now = LocalDate.now();

            String ext = extractExtension(file.getOriginalFilename());
            String filename = UUID.randomUUID() + (ext.isBlank() ? "" : "." + ext);

            String storageKey = now.getYear()
                    + "/" + now.getMonthValue()
                    + "/" + now.getDayOfMonth()
                    + "/" + filename;

            Path target = basePath.resolve(storageKey).normalize();
            Files.createDirectories(target.getParent());
            file.transferTo(target);

            return new StoredFile(
                    file.getOriginalFilename(),
                    storageKey.replace('\\', '/'),
                    file.getContentType(),
                    file.getSize()
            );
        } catch (IOException e) {
            throw new IllegalStateException("파일 저장 중 오류가 발생했습니다.", e);
        }
    }

    @Override
    public Resource loadAsResource(String storageKey) {
        try {
            Path filePath = basePath.resolve(storageKey).normalize();
            Resource resource = new UrlResource(filePath.toUri());

            if (!resource.exists()) {
                throw new IllegalArgumentException("파일을 찾을 수 없습니다.");
            }

            return resource;
        } catch (MalformedURLException e) {
            throw new IllegalStateException("파일 조회 중 오류가 발생했습니다.", e);
        }
    }

    @Override
    public void delete(String storageKey) {
        try {
            Path filePath = basePath.resolve(storageKey).normalize();
            Files.deleteIfExists(filePath);
        } catch (IOException e) {
            throw new IllegalStateException("파일 삭제 중 오류가 발생했습니다.", e);
        }
    }

    private void validate(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("비어 있는 파일은 업로드할 수 없습니다.");
        }

        if (file.getContentType() == null || !ALLOWED_TYPES.contains(file.getContentType())) {
            throw new IllegalArgumentException("이미지 파일만 업로드할 수 있습니다.");
        }
    }

    private String extractExtension(String originalFilename) {
        if (originalFilename == null || !originalFilename.contains(".")) {
            return "";
        }

        return originalFilename.substring(originalFilename.lastIndexOf('.') + 1).toLowerCase();
    }
}