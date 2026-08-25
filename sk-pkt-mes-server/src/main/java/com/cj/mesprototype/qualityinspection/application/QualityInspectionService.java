package com.cj.mesprototype.qualityinspection.application;

import com.cj.mesprototype.common.exception.BusinessException;
import com.cj.mesprototype.common.exception.ErrorCode;
import com.cj.mesprototype.qualityinspection.domain.InspectionResult;
import com.cj.mesprototype.qualityinspection.domain.InspectionStatus;
import com.cj.mesprototype.qualityinspection.domain.QualityInspection;
import com.cj.mesprototype.qualityinspection.infrastructure.QualityInspectionRepository;
import com.cj.mesprototype.qualityinspection.presentation.dto.QualityInspectionResponse;
import com.cj.mesprototype.qualityinspection.presentation.dto.RecordInspectionResultRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Locale;

@Service
@RequiredArgsConstructor
public class QualityInspectionService {
    private static final BigDecimal MIN_DIMENSION = new BigDecimal("49.5");
    private static final BigDecimal MAX_DIMENSION = new BigDecimal("50.5");

    private final QualityInspectionRepository repository;

    @Transactional(readOnly = true)
    public List<QualityInspectionResponse> getInspections(String status, String keyword) {
        InspectionStatus statusFilter = parseStatus(status);
        String normalizedKeyword = keyword == null ? "" : keyword.strip().toLowerCase(Locale.ROOT);

        return repository.findAllByOrderByProducedAtDesc().stream()
                .filter(inspection -> statusFilter == null || inspection.getStatus() == statusFilter)
                .filter(inspection -> normalizedKeyword.isBlank() || matches(inspection, normalizedKeyword))
                .map(QualityInspectionResponse::from)
                .toList();
    }

    @Transactional
    public QualityInspectionResponse recordResult(Long id, RecordInspectionResultRequest request) {
        QualityInspection inspection = repository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.QUALITY_INSPECTION_NOT_FOUND));

        boolean dimensionInRange = request.dimension().compareTo(MIN_DIMENSION) >= 0
                && request.dimension().compareTo(MAX_DIMENSION) <= 0;
        if (request.result() == InspectionResult.PASS && (!dimensionInRange || request.appearanceIssue())) {
            throw new BusinessException(ErrorCode.QUALITY_INSPECTION_PASS_CRITERIA_NOT_MET);
        }
        if (request.result() == InspectionResult.FAIL
                && (request.defectReason() == null || request.defectReason().isBlank())) {
            throw new BusinessException(ErrorCode.QUALITY_INSPECTION_DEFECT_REASON_REQUIRED);
        }

        inspection.recordResult(request.dimension(), request.appearanceIssue(), request.result(),
                request.defectReason(), request.photoUrls());
        return QualityInspectionResponse.from(inspection);
    }

    private InspectionStatus parseStatus(String status) {
        if (status == null || status.isBlank() || "ALL".equalsIgnoreCase(status)) return null;
        try {
            return InspectionStatus.valueOf(status.toUpperCase(Locale.ROOT));
        } catch (IllegalArgumentException exception) {
            throw new BusinessException(ErrorCode.QUALITY_INSPECTION_INVALID_STATUS);
        }
    }

    private boolean matches(QualityInspection inspection, String keyword) {
        return inspection.getLotCode().toLowerCase(Locale.ROOT).contains(keyword)
                || inspection.getWorkOrderCode().toLowerCase(Locale.ROOT).contains(keyword)
                || inspection.getItemName().toLowerCase(Locale.ROOT).contains(keyword);
    }
}
