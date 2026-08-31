package com.cj.mesprototype.qualityinspection.application;

import com.cj.mesprototype.common.exception.BusinessException;
import com.cj.mesprototype.common.exception.ErrorCode;
import com.cj.mesprototype.qualityinspection.domain.InspectionResult;
import com.cj.mesprototype.qualityinspection.domain.QualityInspection;
import com.cj.mesprototype.qualityinspection.infrastructure.QualityInspectionRepository;
import com.cj.mesprototype.qualityinspection.presentation.dto.QualityInspectionResponse;
import com.cj.mesprototype.qualityinspection.presentation.dto.RecordInspectionResultRequest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class QualityInspectionServiceTests {
    private QualityInspectionRepository repository;
    private QualityInspectionService service;
    private QualityInspection inspection;

    @BeforeEach
    void setUp() {
        repository = mock(QualityInspectionRepository.class);
        service = new QualityInspectionService(repository);
        inspection = QualityInspection.waiting(
                "LOT-TEST-001", "WO-001", "태스크 체어", 100, Instant.now());
        when(repository.findById(1L)).thenReturn(Optional.of(inspection));
    }

    @Test
    void recordsPassWhenDimensionAndAppearanceMeetCriteria() {
        QualityInspectionResponse response = service.recordResult(1L, new RecordInspectionResultRequest(
                new BigDecimal("50.0"), false, InspectionResult.PASS, null, List.of("https://example.com/defect.jpg")));

        assertEquals(InspectionResult.PASS, response.result());
        assertEquals("COMPLETED", response.status().name());
        assertEquals(List.of("https://example.com/defect.jpg"), response.photoUrls());
    }

    @Test
    void rejectsPassWhenDimensionIsOutsideTolerance() {
        BusinessException exception = assertThrows(BusinessException.class,
                () -> service.recordResult(1L, new RecordInspectionResultRequest(
                        new BigDecimal("51.0"), false, InspectionResult.PASS, null, List.of())));

        assertEquals(ErrorCode.QUALITY_INSPECTION_PASS_CRITERIA_NOT_MET, exception.getErrorCode());
    }

    @Test
    void requiresReasonForFailedInspection() {
        BusinessException exception = assertThrows(BusinessException.class,
                () -> service.recordResult(1L, new RecordInspectionResultRequest(
                        new BigDecimal("51.0"), false, InspectionResult.FAIL, "", List.of())));

        assertEquals(ErrorCode.QUALITY_INSPECTION_DEFECT_REASON_REQUIRED, exception.getErrorCode());
    }
}
