package com.cj.mesprototype.qualityinspection.presentation.dto;

import com.cj.mesprototype.qualityinspection.domain.InspectionResult;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.util.List;

public record RecordInspectionResultRequest(
        @NotNull @DecimalMin("0.01") @Digits(integer = 6, fraction = 2) BigDecimal dimension,
        @NotNull Boolean appearanceIssue,
        @NotNull InspectionResult result,
        @Size(max = 1000) String defectReason,
        @Size(max = 3) List<@NotBlank @Size(max = 2000) String> photoUrls
) {}
