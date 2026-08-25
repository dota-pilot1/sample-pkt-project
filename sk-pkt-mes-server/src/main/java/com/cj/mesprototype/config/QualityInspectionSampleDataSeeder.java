package com.cj.mesprototype.config;

import com.cj.mesprototype.qualityinspection.domain.InspectionResult;
import com.cj.mesprototype.qualityinspection.domain.QualityInspection;
import com.cj.mesprototype.qualityinspection.infrastructure.QualityInspectionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.temporal.ChronoUnit;

@Slf4j
@Component
@Order(9)
@RequiredArgsConstructor
public class QualityInspectionSampleDataSeeder implements ApplicationRunner {
    private final QualityInspectionRepository repository;

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        Instant now = Instant.now().truncatedTo(ChronoUnit.MINUTES);
        seedWaiting("LOT-20260825-001", "WO-001", "태스크 체어", 200, now.minus(2, ChronoUnit.HOURS));
        seedWaiting("LOT-20260825-002", "WO-002", "회의 테이블", 80, now.minus(1, ChronoUnit.HOURS));
        seedWaiting("LOT-20260824-004", "WO-003", "태스크 체어", 120, now.minus(18, ChronoUnit.HOURS));

        if (!repository.existsByLotCode("LOT-20260824-003")) {
            QualityInspection completed = QualityInspection.waiting(
                    "LOT-20260824-003", "WO-001", "태스크 체어", 200,
                    now.minus(20, ChronoUnit.HOURS));
            completed.recordResult(new BigDecimal("50.10"), false, InspectionResult.PASS, null, null);
            repository.save(completed);
        }
        log.info("Seeded sample quality inspections: {}", repository.count());
    }

    private void seedWaiting(String lotCode, String workOrderCode, String itemName,
                             int quantity, Instant producedAt) {
        if (!repository.existsByLotCode(lotCode)) {
            repository.save(QualityInspection.waiting(
                    lotCode, workOrderCode, itemName, quantity, producedAt));
        }
    }
}
