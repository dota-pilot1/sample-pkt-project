package com.cj.mesprototype.qualityinspection.presentation.dto;

import com.cj.mesprototype.qualityinspection.domain.InspectionResult;
import com.cj.mesprototype.qualityinspection.domain.InspectionStatus;
import com.cj.mesprototype.qualityinspection.domain.QualityInspection;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

public record QualityInspectionResponse(
        Long id,
        String lotCode,
        String workOrderCode,
        String itemName,
        Integer quantity,
        Instant producedAt,
        InspectionStatus status,
        InspectionResult result,
        BigDecimal dimension,
        Boolean appearanceIssue,
        String defectReason,
        List<String> photoUrls,
        Instant inspectedAt
) {
    public static QualityInspectionResponse from(QualityInspection inspection) {
        return new QualityInspectionResponse(
                inspection.getId(), inspection.getLotCode(), inspection.getWorkOrderCode(),
                inspection.getItemName(), inspection.getQuantity(), inspection.getProducedAt(),
                inspection.getStatus(), inspection.getResult(), inspection.getDimension(),
                inspection.getAppearanceIssue(), inspection.getDefectReason(), List.copyOf(inspection.getPhotoUrls()),
                inspection.getInspectedAt());
    }
}
