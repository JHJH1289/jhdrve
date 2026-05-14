package com.example.drive.service;

import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;

import javax.imageio.ImageIO;
import java.awt.Color;
import java.awt.Graphics2D;
import java.awt.RenderingHints;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;

@Service
public class PhotoThumbnailService {

    private static final int MAX_THUMBNAIL_SIZE = 512;

    private final StorageService storageService;

    public PhotoThumbnailService(StorageService storageService) {
        this.storageService = storageService;
    }

    public String createThumbnail(String storageKey) {
        Resource resource = storageService.loadAsResource(storageKey);

        try (InputStream inputStream = resource.getInputStream()) {
            BufferedImage source = ImageIO.read(inputStream);
            if (source == null) {
                return null;
            }

            BufferedImage thumbnail = resize(source);
            byte[] bytes = writeJpeg(thumbnail);
            return storageService.storeThumbnail(storageKey, bytes);
        } catch (IOException e) {
            throw new IllegalStateException("Failed to create thumbnail.", e);
        }
    }

    private BufferedImage resize(BufferedImage source) {
        int width = source.getWidth();
        int height = source.getHeight();

        if (width <= 0 || height <= 0) {
            throw new IllegalArgumentException("Invalid image dimensions.");
        }

        double scale = Math.min(
                (double) MAX_THUMBNAIL_SIZE / width,
                (double) MAX_THUMBNAIL_SIZE / height
        );
        scale = Math.min(scale, 1.0);

        int nextWidth = Math.max(1, (int) Math.round(width * scale));
        int nextHeight = Math.max(1, (int) Math.round(height * scale));

        BufferedImage thumbnail = new BufferedImage(nextWidth, nextHeight, BufferedImage.TYPE_INT_RGB);
        Graphics2D graphics = thumbnail.createGraphics();
        try {
            graphics.setRenderingHint(RenderingHints.KEY_INTERPOLATION, RenderingHints.VALUE_INTERPOLATION_BILINEAR);
            graphics.setRenderingHint(RenderingHints.KEY_RENDERING, RenderingHints.VALUE_RENDER_QUALITY);
            graphics.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);
            graphics.setColor(Color.WHITE);
            graphics.fillRect(0, 0, nextWidth, nextHeight);
            graphics.drawImage(source, 0, 0, nextWidth, nextHeight, null);
        } finally {
            graphics.dispose();
        }

        return thumbnail;
    }

    private byte[] writeJpeg(BufferedImage image) throws IOException {
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        if (!ImageIO.write(image, "jpg", outputStream)) {
            throw new IllegalStateException("JPEG writer is not available.");
        }

        return outputStream.toByteArray();
    }
}
