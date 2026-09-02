package com.cj.mesprototype.packagetest.presentation.dto;

import com.cj.mesprototype.packagetest.domain.TestConditionType;

public record UpdateTestConditionRequest(
        Integer testNumber,
        String testName,
        TestConditionType conditionType,
        java.math.BigDecimal lowerLimit,
        java.math.BigDecimal upperLimit,
        String unit,
        String failBinCode,
        Integer sequenceNo
) {}
