package com.example.drive.service;

import com.example.drive.dto.StoredFile;
import org.springframework.core.io.Resource;
import org.springframework.web.multipart.MultipartFile;

public interface StorageService {
    StoredFile store(MultipartFile file);
    Resource loadAsResource(String storageKey);
    void delete(String storageKey);
}