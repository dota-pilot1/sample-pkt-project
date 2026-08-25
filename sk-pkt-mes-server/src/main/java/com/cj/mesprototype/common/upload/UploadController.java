package com.cj.mesprototype.common.upload;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Max;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/upload")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "Upload", description = "S3 업로드용 Presigned URL 발급 (ROLE_ADMIN 전용)")
public class UploadController {

    private final UploadService uploadService;

    @PostMapping("/presign")
    @Operation(summary = "이미지 업로드용 Presigned URL 발급")
    public UploadService.PresignResponse presign(@Valid @RequestBody PresignRequest request) {
        return uploadService.presign(new UploadService.PresignCommand(
                request.filename(), request.contentType(), request.size(), request.folder()));
    }

    public record PresignRequest(
            @NotBlank String filename,
            @NotBlank String contentType,
            @NotNull @Positive @Max(UploadService.MAX_IMAGE_SIZE_BYTES) Long size,
            String folder
    ) {}
}
