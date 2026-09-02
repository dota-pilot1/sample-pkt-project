package com.cj.mesprototype.packagetest.presentation.dto;

import com.cj.mesprototype.packagetest.domain.TestSpec;
import com.cj.mesprototype.packagetest.domain.TestSpecStatus;

import java.util.List;

public record TestSpecResponse(Long id, Long productId, String productCode, String productName,
                               String specName, Integer version, String testStage, TestSpecStatus status,
                               List<TestConditionResponse> conditions) {
    public static TestSpecResponse from(TestSpec spec) {
        return new TestSpecResponse(spec.getId(), spec.getProduct().getId(), spec.getProduct().getProductCode(),
                spec.getProduct().getProductName(), spec.getSpecName(), spec.getVersion(), spec.getTestStage(),
                spec.getStatus(), spec.getConditions().stream().map(TestConditionResponse::from).toList());
    }
}
