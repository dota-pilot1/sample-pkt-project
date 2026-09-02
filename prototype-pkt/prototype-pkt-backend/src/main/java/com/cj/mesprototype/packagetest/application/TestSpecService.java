package com.cj.mesprototype.packagetest.application;

import com.cj.mesprototype.common.exception.BusinessException;
import com.cj.mesprototype.common.exception.ErrorCode;
import com.cj.mesprototype.lot.domain.Product;
import com.cj.mesprototype.lot.infrastructure.ProductRepository;
import com.cj.mesprototype.packagetest.domain.TestCondition;
import com.cj.mesprototype.packagetest.domain.TestConditionType;
import com.cj.mesprototype.packagetest.domain.TestSpec;
import com.cj.mesprototype.packagetest.infrastructure.TestConditionRepository;
import com.cj.mesprototype.packagetest.infrastructure.TestSpecRepository;
import com.cj.mesprototype.packagetest.presentation.dto.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TestSpecService {
    private final TestSpecRepository testSpecRepository;
    private final TestConditionRepository testConditionRepository;
    private final ProductRepository productRepository;

    @Transactional(readOnly = true)
    public List<TestSpecResponse> getSpecs() {
        return testSpecRepository.findAllByOrderByProductProductCodeAscSpecNameAscVersionDesc()
                .stream().map(TestSpecResponse::from).toList();
    }

    @Transactional(readOnly = true)
    public TestSpecResponse getSpec(Long id) { return TestSpecResponse.from(getSpecEntity(id)); }

    @Transactional
    public TestSpecResponse createSpec(CreateTestSpecRequest request) {
        Product product = productRepository.findById(request.productId())
                .orElseThrow(() -> new BusinessException(ErrorCode.PACKAGE_TEST_PRODUCT_NOT_FOUND));
        if (!product.isActive()) {
            throw new BusinessException(ErrorCode.PRODUCT_INACTIVE);
        }
        int version = request.version() == null ? 1 : request.version();
        if (testSpecRepository.existsByProductIdAndSpecNameAndVersion(product.getId(), request.specName().trim(), version)) {
            throw new BusinessException(ErrorCode.PACKAGE_TEST_SPEC_DUPLICATE);
        }
        return TestSpecResponse.from(testSpecRepository.save(TestSpec.create(product, request.specName(), version, request.testStage(), request.status())));
    }

    @Transactional
    public TestSpecResponse updateSpec(Long id, UpdateTestSpecRequest request) {
        TestSpec spec = getSpecEntity(id);
        ensureDraft(spec);
        spec.update(request.specName(), request.testStage(), request.status());
        return TestSpecResponse.from(spec);
    }

    @Transactional
    public void deleteSpec(Long id) {
        TestSpec spec = getSpecEntity(id);
        ensureDraft(spec);
        testSpecRepository.delete(spec);
    }

    @Transactional
    public TestConditionResponse addCondition(Long specId, CreateTestConditionRequest request) {
        TestSpec spec = getSpecEntity(specId);
        ensureDraft(spec);
        validateCondition(request.conditionType(), request.lowerLimit(), request.upperLimit());
        if (testConditionRepository.existsByTestSpecIdAndTestNumberAndIdNot(specId, request.testNumber(), -1L)) {
            throw new BusinessException(ErrorCode.PACKAGE_TEST_CONDITION_DUPLICATE);
        }
        TestCondition condition = TestCondition.create(spec, request.testNumber(), request.testName(), request.conditionType(),
                request.lowerLimit(), request.upperLimit(), request.unit(), request.failBinCode(), request.sequenceNo());
        spec.addCondition(condition);
        return TestConditionResponse.from(condition);
    }

    @Transactional
    public TestConditionResponse updateCondition(Long conditionId, UpdateTestConditionRequest request) {
        TestCondition condition = testConditionRepository.findById(conditionId)
                .orElseThrow(() -> new BusinessException(ErrorCode.PACKAGE_TEST_CONDITION_NOT_FOUND));
        ensureDraft(condition.getTestSpec());
        validateCondition(request.conditionType(), request.lowerLimit(), request.upperLimit());
        if (testConditionRepository.existsByTestSpecIdAndTestNumberAndIdNot(condition.getTestSpec().getId(), request.testNumber(), conditionId)) {
            throw new BusinessException(ErrorCode.PACKAGE_TEST_CONDITION_DUPLICATE);
        }
        condition.update(request.testNumber(), request.testName(), request.conditionType(), request.lowerLimit(), request.upperLimit(), request.unit(), request.failBinCode(), request.sequenceNo());
        return TestConditionResponse.from(condition);
    }

    @Transactional
    public void deleteCondition(Long conditionId) {
        TestCondition condition = testConditionRepository.findById(conditionId)
                .orElseThrow(() -> new BusinessException(ErrorCode.PACKAGE_TEST_CONDITION_NOT_FOUND));
        ensureDraft(condition.getTestSpec());
        testConditionRepository.delete(condition);
    }

    private TestSpec getSpecEntity(Long id) {
        return testSpecRepository.findById(id).orElseThrow(() -> new BusinessException(ErrorCode.PACKAGE_TEST_SPEC_NOT_FOUND));
    }

    private void ensureDraft(TestSpec spec) {
        if (spec.getStatus() == com.cj.mesprototype.packagetest.domain.TestSpecStatus.APPROVED) {
            throw new BusinessException(ErrorCode.PACKAGE_TEST_SPEC_APPROVED_READONLY);
        }
    }

    private void validateCondition(TestConditionType type, BigDecimal lower, BigDecimal upper) {
        if (type == TestConditionType.RANGE) {
            if (lower == null || upper == null || lower.compareTo(upper) > 0) {
                throw new BusinessException(ErrorCode.PACKAGE_TEST_RANGE_INVALID);
            }
        } else if (lower != null || upper != null) {
            throw new BusinessException(ErrorCode.PACKAGE_TEST_RANGE_NOT_ALLOWED);
        }
    }
}
