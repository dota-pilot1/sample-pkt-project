package com.cj.mesprototype.config;

import com.cj.mesprototype.lot.domain.Product;
import com.cj.mesprototype.lot.infrastructure.ProductRepository;
import com.cj.mesprototype.packagetest.domain.TestCondition;
import com.cj.mesprototype.packagetest.domain.TestConditionType;
import com.cj.mesprototype.packagetest.domain.TestSpec;
import com.cj.mesprototype.packagetest.domain.TestSpecStatus;
import com.cj.mesprototype.packagetest.infrastructure.TestSpecRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

/** 제품별 승인 테스트 규격을 제공해 LOT → 스펙 → 실행 데모 흐름을 시작할 수 있게 한다. */
@Component
@Order(9)
@RequiredArgsConstructor
public class PackageTestSpecSampleDataSeeder implements ApplicationRunner {
    private final ProductRepository productRepository;
    private final TestSpecRepository testSpecRepository;

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        seed("PKT-A", "PKT-A Final Test", "FINAL_TEST", "VDD Operating Current", "mA", "BIN-03", "45", "75");
        seed("PKT-B", "PKT-B Final Test", "FINAL_TEST", "Output Leakage", "uA", "BIN-05", "0", "10");
        seed("PKT-C", "PKT-C Speed Bin", "SPEED_BIN_TEST", "Maximum Frequency", "MHz", "BIN-07", "800", "1200");
        seed("PKT-D", "PKT-D Final Test", "FINAL_TEST", "Standby Current", "uA", "BIN-04", "0", "5");
    }

    private void seed(String productCode, String specName, String stage, String testName, String unit,
                      String failBin, String lower, String upper) {
        Product product = productRepository.findByProductCode(productCode).orElse(null);
        if (product == null || testSpecRepository.existsByProductIdAndSpecNameAndVersion(product.getId(), specName, 1)) return;
        TestSpec spec = TestSpec.create(product, specName, 1, stage, TestSpecStatus.DRAFT);
        spec.addCondition(TestCondition.create(spec, 1001, testName, TestConditionType.RANGE,
                new BigDecimal(lower), new BigDecimal(upper), unit, failBin, 1));
        spec.addCondition(TestCondition.create(spec, 1099, "Functional Test", TestConditionType.PASS_FAIL,
                null, null, null, "BIN-01", 2));
        spec.update(specName, stage, TestSpecStatus.APPROVED);
        testSpecRepository.save(spec);
    }
}
