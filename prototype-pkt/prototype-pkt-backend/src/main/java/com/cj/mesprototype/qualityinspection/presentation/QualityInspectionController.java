package com.cj.mesprototype.qualityinspection.presentation;

import com.cj.mesprototype.qualityinspection.application.QualityInspectionService;
import com.cj.mesprototype.qualityinspection.presentation.dto.QualityInspectionResponse;
import com.cj.mesprototype.qualityinspection.presentation.dto.RecordInspectionResultRequest;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/quality-inspections")
@RequiredArgsConstructor
@Tag(name = "QualityInspection", description = "품질 검사 시행 및 결과 기록")
public class QualityInspectionController {
    private final QualityInspectionService service;

    @GetMapping
    @Operation(summary = "품질 검사 목록 조회")
    public List<QualityInspectionResponse> getInspections(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String keyword) {
        return service.getInspections(status, keyword);
    }

    @PutMapping("/{id}/result")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "품질 검사 결과 등록 또는 수정 (ROLE_ADMIN)")
    public QualityInspectionResponse recordResult(
            @PathVariable Long id,
            @Valid @RequestBody RecordInspectionResultRequest request) {
        return service.recordResult(id, request);
    }
}
