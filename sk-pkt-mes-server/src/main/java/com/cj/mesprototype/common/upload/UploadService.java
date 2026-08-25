package com.cj.mesprototype.common.upload;

import com.cj.mesprototype.common.exception.BusinessException;
import com.cj.mesprototype.common.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.PutObjectPresignRequest;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.Arrays;
import java.util.Locale;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UploadService {

    public static final long MAX_IMAGE_SIZE_BYTES = 10L * 1024 * 1024;
    private static final Set<String> ALLOWED_IMAGE_TYPES = Set.of(
            "image/png", "image/jpeg", "image/jpg", "image/webp", "image/gif"
    );

    private final S3Properties props;
    private final S3Presigner presigner;

    /** 공통 파일 저장소의 책임: 입력 검증, S3 키 생성, Presigned PUT URL 발급. */
    public PresignResponse presign(PresignCommand command) {
        if (!props.isConfigured()) {
            throw new BusinessException(ErrorCode.UPLOAD_NOT_CONFIGURED);
        }
        validateImage(command);

        String safeName = sanitize(command.filename());
        String objectKey = buildKey(command.folder(), safeName);

        PutObjectRequest objectRequest = PutObjectRequest.builder()
                .bucket(props.bucket())
                .key(objectKey)
                .contentType(command.contentType())
                .build();

        PutObjectPresignRequest presignRequest = PutObjectPresignRequest.builder()
                .signatureDuration(Duration.ofSeconds(props.presignExpiresSeconds()))
                .putObjectRequest(objectRequest)
                .build();

        String presignedUrl = presigner.presignPutObject(presignRequest).url().toString();
        String publicUrl = buildPublicUrl(objectKey);

        return new PresignResponse(presignedUrl, publicUrl, objectKey);
    }

    /** 품질 검사 같은 도메인이 클라이언트 전달 키의 소유 범위를 확인할 때 사용한다. */
    public boolean isObjectKeyInFolder(String objectKey, String folder) {
        if (objectKey == null || objectKey.isBlank()) return false;
        return objectKey.startsWith(folderPrefix(folder));
    }

    public String publicUrlFor(String objectKey) {
        if (!isManagedObjectKey(objectKey)) {
            throw new BusinessException(ErrorCode.UPLOAD_INVALID_OBJECT_KEY);
        }
        return buildPublicUrl(objectKey);
    }

    private void validateImage(PresignCommand command) {
        if (!ALLOWED_IMAGE_TYPES.contains(command.contentType().toLowerCase(Locale.ROOT))) {
            throw new BusinessException(ErrorCode.UPLOAD_INVALID_CONTENT_TYPE);
        }
        if (command.size() > MAX_IMAGE_SIZE_BYTES) {
            throw new BusinessException(ErrorCode.UPLOAD_FILE_TOO_LARGE);
        }
    }

    private String sanitize(String filename) {
        String base = (filename == null || filename.isBlank()) ? "file" : filename;
        String lower = base.toLowerCase(Locale.ROOT);
        String cleaned = lower.replaceAll("[^a-z0-9._-]", "-");
        return UUID.randomUUID() + "-" + cleaned;
    }

    private String buildKey(String folder, String safeName) {
        return folderPrefix(folder) + safeName;
    }

    private String folderPrefix(String folder) {
        String root = normalizePath(props.prefix());
        String sub = normalizePath(folder);
        String path = root.isBlank() ? (sub.isBlank() ? "misc" : sub)
                : root + "/" + (sub.isBlank() ? "misc" : sub);
        return path + "/";
    }

    private boolean isManagedObjectKey(String objectKey) {
        String root = normalizePath(props.prefix());
        return !root.isBlank() && objectKey.startsWith(root + "/");
    }

    private String normalizePath(String value) {
        if (value == null || value.isBlank()) return "";
        return Arrays.stream(value.toLowerCase(Locale.ROOT).replace('\\', '/').split("/"))
                .map(segment -> segment.replaceAll("[^a-z0-9_-]", ""))
                .filter(segment -> !segment.isBlank())
                .reduce((left, right) -> left + "/" + right)
                .orElse("");
    }

    private String buildPublicUrl(String objectKey) {
        String encodedKey = URLEncoder.encode(objectKey, StandardCharsets.UTF_8).replace("%2F", "/");
        return "https://" + props.bucket() + ".s3." + props.region() + ".amazonaws.com/" + encodedKey;
    }

    public record PresignCommand(String filename, String contentType, long size, String folder) {}

    public record PresignResponse(String presignedUrl, String publicUrl, String objectKey) {}

}
