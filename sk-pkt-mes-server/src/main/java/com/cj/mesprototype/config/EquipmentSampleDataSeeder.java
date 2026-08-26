package com.cj.mesprototype.config;

import com.cj.mesprototype.equipment.domain.Equipment;
import com.cj.mesprototype.equipment.domain.EquipmentStatus;
import com.cj.mesprototype.equipment.infrastructure.EquipmentRepository;
import com.cj.mesprototype.equipment.infrastructure.EquipmentStatusHistoryRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;

@Slf4j
@Component
@Order(8)
@RequiredArgsConstructor
public class EquipmentSampleDataSeeder implements ApplicationRunner {

    private final EquipmentRepository equipmentRepository;
    private final EquipmentStatusHistoryRepository historyRepository;

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        if (equipmentRepository.count() > 0) {
            return;
        }

        seed("EQP-ETCH-001", "Etcher A-01", "식각", "FAB 1층", EquipmentStatus.RUNNING, "LOT-20260824-004", "생산 작업 진행 중", 20);
        seed("EQP-ETCH-002", "Etcher A-02", "식각", "FAB 1층", EquipmentStatus.RUNNING, "LOT-20260825-001", "생산 작업 진행 중", 40);
        seed("EQP-CVD-001", "CVD Chamber B-01", "증착", "FAB 2층", EquipmentStatus.IDLE, null, "다음 작업 대기", 70);
        seed("EQP-CVD-002", "CVD Chamber B-02", "증착", "FAB 2층", EquipmentStatus.MAINTENANCE, null, "정기 예방점검", 120);
        seed("EQP-CLEAN-001", "Cleaner C-01", "세정", "FAB 1층", EquipmentStatus.RUNNING, "LOT-20260825-004", "생산 작업 진행 중", 10);
        seed("EQP-CLEAN-002", "Cleaner C-02", "세정", "FAB 1층", EquipmentStatus.IDLE, null, "작업 없음", 55);
        seed("EQP-LITHO-001", "Lithography D-01", "노광", "FAB 3층", EquipmentStatus.RUNNING, "LOT-20260826-002", "생산 작업 진행 중", 5);
        seed("EQP-LITHO-002", "Lithography D-02", "노광", "FAB 3층", EquipmentStatus.RUNNING, "LOT-20260826-003", "생산 작업 진행 중", 30);
        log.info("Seeded sample equipments: {}", equipmentRepository.count());
    }

    private void seed(String code, String name, String processName, String location,
                      EquipmentStatus status, String lotNumber, String reason, long minutesAgo) {
        Instant changedAt = Instant.now().minus(minutesAgo, ChronoUnit.MINUTES);
        Equipment equipment = equipmentRepository.save(Equipment.create(
                code, name, processName, location, status, lotNumber, changedAt, reason));
        historyRepository.save(com.cj.mesprototype.equipment.domain.EquipmentStatusHistory.create(
                equipment, status, reason, changedAt));
    }
}
