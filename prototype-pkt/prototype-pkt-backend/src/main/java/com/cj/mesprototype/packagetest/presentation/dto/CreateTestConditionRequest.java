package com.cj.mesprototype.packagetest.presentation.dto;

import com.cj.mesprototype.packagetest.domain.TestConditionType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

public record CreateTestConditionRequest(
        @NotNull @Positive Integer testNumber,
        @NotBlank @Size(max = 150) String testName,
        @NotNull TestConditionType conditionType,
        BigDecimal lowerLimit,
        BigDecimal upperLimit,
        @Size(max = 30) String unit,
        @Size(max = 50) String failBinCode,
        @Positive Integer sequenceNo
) {}
