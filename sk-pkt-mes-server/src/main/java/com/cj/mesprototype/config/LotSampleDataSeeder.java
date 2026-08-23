package com.cj.mesprototype.config;

import com.cj.mesprototype.lot.domain.Lot;
import com.cj.mesprototype.lot.domain.LotStatus;
import com.cj.mesprototype.lot.infrastructure.LotRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Component
@Order(8)
@RequiredArgsConstructor
public class LotSampleDataSeeder implements ApplicationRunner {
    private final LotRepository lotRepository;

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        if (lotRepository.count() > 0) return;

        lotRepository.saveAll(List.of(
                Lot.create("LOT-2026-001", "PKT-A", "PKT-A", LotStatus.IN_PROGRESS, "식각"),
                Lot.create("LOT-2026-002", "PKT-B", "PKT-B", LotStatus.WAITING, "세정"),
                Lot.create("LOT-2026-003", "PKT-A", "PKT-A", LotStatus.COMPLETED, "검사"),
                Lot.create("LOT-2026-004", "PKT-C", "PKT-C", LotStatus.HOLD, "조립"),
                Lot.create("LOT-2026-005", "PKT-B", "PKT-B", LotStatus.IN_PROGRESS, "검사")
        ));
        log.info("Seeded sample lots: 5");
    }
}
