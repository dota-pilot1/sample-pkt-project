package com.cj.mesprototype.packagetest.presentation.dto;

import com.cj.mesprototype.packagetest.domain.TestCondition;
import com.cj.mesprototype.packagetest.domain.TestConditionType;

import java.math.BigDecimal;

public record TestConditionResponse(Long id, Integer testNumber, String testName, TestConditionType conditionType,
                                    BigDecimal lowerLimit, BigDecimal upperLimit, String unit,
                                    String failBinCode, Integer sequenceNo, boolean active) {
    public static TestConditionResponse from(TestCondition condition) {
        return new TestConditionResponse(condition.getId(), condition.getTestNumber(), condition.getTestName(),
                condition.getConditionType(), condition.getLowerLimit(), condition.getUpperLimit(),
                condition.getUnit(), condition.getFailBinCode(), condition.getSequenceNo(), condition.isActive());
    }
}
