package com.example.drive.service;

import com.drew.imaging.ImageMetadataReader;
import com.drew.lang.Rational;
import com.drew.metadata.Metadata;
import com.drew.metadata.exif.ExifIFD0Directory;
import com.drew.metadata.exif.ExifSubIFDDirectory;
import com.drew.metadata.jpeg.JpegDirectory;
import com.drew.metadata.png.PngDirectory;
import com.example.drive.dto.PhotoMetadata;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Date;
import java.util.Locale;

@Service
public class PhotoMetadataService {

    public PhotoMetadata extract(MultipartFile file) {
        try (InputStream inputStream = file.getInputStream()) {
            Metadata metadata = ImageMetadataReader.readMetadata(inputStream);
            for (var directory : metadata.getDirectories()) {
                System.out.println("[" + directory.getName() + "]");
                directory.getTags().forEach(tag -> System.out.println(tag.getTagName() + " = " + tag.getDescription()));
            }
            Integer width = extractWidth(metadata);
            Integer height = extractHeight(metadata);
            LocalDateTime takenAt = extractTakenAt(metadata);

            String cameraMake = extractCameraMake(metadata);
            String cameraModel = extractCameraModel(metadata);
            String focalLength = extractFocalLength(metadata);
            String fNumber = extractFNumber(metadata);
            String exposureTime = extractExposureTime(metadata);
            Integer iso = extractIso(metadata);
            String lensModel = extractLensModel(metadata);

            return new PhotoMetadata(
                    width,
                    height,
                    takenAt,
                    cameraMake,
                    cameraModel,
                    focalLength,
                    fNumber,
                    exposureTime,
                    iso,
                    lensModel);
        } catch (Exception e) {
            return new PhotoMetadata(
                    null,
                    null,
                    null,
                    null,
                    null,
                    null,
                    null,
                    null,
                    null,
                    null);
        }
    }

    private Integer extractWidth(Metadata metadata) {
        JpegDirectory jpegDirectory = metadata.getFirstDirectoryOfType(JpegDirectory.class);
        if (jpegDirectory != null && jpegDirectory.containsTag(JpegDirectory.TAG_IMAGE_WIDTH)) {
            return jpegDirectory.getInteger(JpegDirectory.TAG_IMAGE_WIDTH);
        }

        PngDirectory pngDirectory = metadata.getFirstDirectoryOfType(PngDirectory.class);
        if (pngDirectory != null) {
            try {
                return pngDirectory.getInt(PngDirectory.TAG_IMAGE_WIDTH);
            } catch (Exception ignored) {
            }
        }

        ExifSubIFDDirectory exifSub = metadata.getFirstDirectoryOfType(ExifSubIFDDirectory.class);
        if (exifSub != null && exifSub.containsTag(ExifSubIFDDirectory.TAG_EXIF_IMAGE_WIDTH)) {
            return exifSub.getInteger(ExifSubIFDDirectory.TAG_EXIF_IMAGE_WIDTH);
        }

        return null;
    }

    private Integer extractHeight(Metadata metadata) {
        JpegDirectory jpegDirectory = metadata.getFirstDirectoryOfType(JpegDirectory.class);
        if (jpegDirectory != null && jpegDirectory.containsTag(JpegDirectory.TAG_IMAGE_HEIGHT)) {
            return jpegDirectory.getInteger(JpegDirectory.TAG_IMAGE_HEIGHT);
        }

        PngDirectory pngDirectory = metadata.getFirstDirectoryOfType(PngDirectory.class);
        if (pngDirectory != null) {
            try {
                return pngDirectory.getInt(PngDirectory.TAG_IMAGE_HEIGHT);
            } catch (Exception ignored) {
            }
        }

        ExifSubIFDDirectory exifSub = metadata.getFirstDirectoryOfType(ExifSubIFDDirectory.class);
        if (exifSub != null && exifSub.containsTag(ExifSubIFDDirectory.TAG_EXIF_IMAGE_HEIGHT)) {
            return exifSub.getInteger(ExifSubIFDDirectory.TAG_EXIF_IMAGE_HEIGHT);
        }

        return null;
    }

    private LocalDateTime extractTakenAt(Metadata metadata) {
        ExifSubIFDDirectory exifSub = metadata.getFirstDirectoryOfType(ExifSubIFDDirectory.class);
        if (exifSub == null) {
            return null;
        }

        Date date = exifSub.getDateOriginal();
        if (date == null) {
            return null;
        }

        return date.toInstant()
                .atZone(ZoneId.systemDefault())
                .toLocalDateTime();
    }

    private String extractCameraMake(Metadata metadata) {
        ExifIFD0Directory exif0 = metadata.getFirstDirectoryOfType(ExifIFD0Directory.class);
        if (exif0 == null) {
            return null;
        }
        return exif0.getString(ExifIFD0Directory.TAG_MAKE);
    }

    private String extractCameraModel(Metadata metadata) {
        ExifIFD0Directory exif0 = metadata.getFirstDirectoryOfType(ExifIFD0Directory.class);
        if (exif0 == null) {
            return null;
        }
        return exif0.getString(ExifIFD0Directory.TAG_MODEL);
    }

    private String extractFocalLength(Metadata metadata) {
        ExifSubIFDDirectory exifSub = metadata.getFirstDirectoryOfType(ExifSubIFDDirectory.class);
        if (exifSub == null) {
            return null;
        }

        try {
            if (exifSub.containsTag(ExifSubIFDDirectory.TAG_35MM_FILM_EQUIV_FOCAL_LENGTH)) {
                Integer eq35 = exifSub.getInteger(ExifSubIFDDirectory.TAG_35MM_FILM_EQUIV_FOCAL_LENGTH);
                if (eq35 != null) {
                    return eq35 + "mm";
                }
            }
        } catch (Exception ignored) {
        }

        try {
            Rational focal = exifSub.getRational(ExifSubIFDDirectory.TAG_FOCAL_LENGTH);
            if (focal != null) {
                return trimTrailingZeros(focal.doubleValue()) + "mm";
            }
        } catch (Exception ignored) {
        }

        try {
            String description = exifSub.getDescription(ExifSubIFDDirectory.TAG_FOCAL_LENGTH);
            if (description != null && !description.isBlank()) {
                return description;
            }
        } catch (Exception ignored) {
        }

        return null;
    }

    private String extractFNumber(Metadata metadata) {
        ExifSubIFDDirectory exifSub = metadata.getFirstDirectoryOfType(ExifSubIFDDirectory.class);
        if (exifSub == null) {
            return null;
        }

        try {
            Rational rational = exifSub.getRational(ExifSubIFDDirectory.TAG_FNUMBER);
            if (rational != null) {
                return "f/" + trimTrailingZeros(rational.doubleValue());
            }
        } catch (Exception ignored) {
        }

        try {
            Double value = exifSub.getDoubleObject(ExifSubIFDDirectory.TAG_FNUMBER);
            if (value != null) {
                return "f/" + trimTrailingZeros(value);
            }
        } catch (Exception ignored) {
        }

        try {
            Rational aperture = exifSub.getRational(ExifSubIFDDirectory.TAG_APERTURE);
            if (aperture != null) {
                double apex = aperture.doubleValue();
                double f = Math.pow(Math.sqrt(2.0), apex);
                return "f/" + trimTrailingZeros(f);
            }
        } catch (Exception ignored) {
        }

        try {
            Double aperture = exifSub.getDoubleObject(ExifSubIFDDirectory.TAG_APERTURE);
            if (aperture != null) {
                double f = Math.pow(Math.sqrt(2.0), aperture);
                return "f/" + trimTrailingZeros(f);
            }
        } catch (Exception ignored) {
        }

        try {
            String description = exifSub.getDescription(ExifSubIFDDirectory.TAG_FNUMBER);
            if (description != null && !description.isBlank()) {
                return description.startsWith("f/") ? description : "f/" + description;
            }
        } catch (Exception ignored) {
        }

        return null;
    }

    private String extractExposureTime(Metadata metadata) {
        ExifSubIFDDirectory exifSub = metadata.getFirstDirectoryOfType(ExifSubIFDDirectory.class);
        if (exifSub == null) {
            return null;
        }

        try {
            Rational rational = exifSub.getRational(ExifSubIFDDirectory.TAG_EXPOSURE_TIME);
            if (rational != null) {
                return formatExposureTime(rational.doubleValue());
            }
        } catch (Exception ignored) {
        }

        try {
            String description = exifSub.getDescription(ExifSubIFDDirectory.TAG_EXPOSURE_TIME);
            if (description != null && !description.isBlank()) {
                return description;
            }
        } catch (Exception ignored) {
        }

        return null;
    }

    private Integer extractIso(Metadata metadata) {
        ExifSubIFDDirectory exifSub = metadata.getFirstDirectoryOfType(ExifSubIFDDirectory.class);
        if (exifSub == null) {
            return null;
        }
        return exifSub.getInteger(ExifSubIFDDirectory.TAG_ISO_EQUIVALENT);
    }

    private String extractLensModel(Metadata metadata) {
        ExifSubIFDDirectory exifSub = metadata.getFirstDirectoryOfType(ExifSubIFDDirectory.class);
        if (exifSub == null) {
            return null;
        }
        return exifSub.getDescription(ExifSubIFDDirectory.TAG_LENS_MODEL);
    }

    private String trimTrailingZeros(double value) {
        if (value == Math.rint(value)) {
            return String.valueOf((int) value);
        }

        String text = String.format(Locale.US, "%.2f", value);
        while (text.contains(".") && (text.endsWith("0") || text.endsWith("."))) {
            text = text.substring(0, text.length() - 1);
        }
        return text;
    }

    private String formatExposureTime(double seconds) {
        if (seconds <= 0) {
            return null;
        }

        if (seconds >= 1) {
            return trimTrailingZeros(seconds) + " sec";
        }

        long denominator = Math.round(1.0 / seconds);
        if (denominator > 0) {
            return "1/" + denominator + " sec";
        }

        return trimTrailingZeros(seconds) + " sec";
    }
}