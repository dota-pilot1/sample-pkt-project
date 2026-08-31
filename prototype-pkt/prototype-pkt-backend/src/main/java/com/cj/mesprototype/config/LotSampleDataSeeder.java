package com.cj.mesprototype.config;

import com.cj.mesprototype.lot.domain.Lot;
import com.cj.mesprototype.lot.domain.LotStatus;
import com.cj.mesprototype.lot.domain.LotProcessHistory;
import com.cj.mesprototype.lot.domain.ProcessDefinition;
import com.cj.mesprototype.lot.infrastructure.LotProcessHistoryRepository;
import com.cj.mesprototype.lot.infrastructure.LotRepository;
import com.cj.mesprototype.lot.infrastructure.ProcessDefinitionRepository;
import com.cj.mesprototype.lot.domain.Product;
import com.cj.mesprototype.lot.infrastructure.ProductRepository;
import com.cj.mesprototype.lot.domain.ProductProcessRoute;
import com.cj.mesprototype.lot.infrastructure.ProductProcessRouteRepository;
import com.cj.mesprototype.equipment.domain.Equipment;
import com.cj.mesprototype.equipment.domain.EquipmentStatus;
import com.cj.mesprototype.equipment.infrastructure.EquipmentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.annotation.Order;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Slf4j
@Component
@Order(8)
@RequiredArgsConstructor
public class LotSampleDataSeeder implements ApplicationRunner {
    private static final int TOTAL_LOTS = 128;
    private static final long SPREAD_MINUTES = 503;
    private static final Pattern SAMPLE_CODE = Pattern.compile("^LOT-2026-(\\d{3})$");
    private static final String[] PRODUCTS = {"H5AN8G6NCJR", "H5AN4G6NBJR", "H9HCNNN8KUML", "H5AN6G6NDJR"};
    private static final String[] PACKAGE_TYPES = {"FBGA", "FBGA", "WLCSP", "BGA"};
    private static final String[] PROCESSES = {"Burn-in", "Core Test", "Speed Bin Test", "Final Test", "QA Verify", "Packing"};
    private static final String[] TESTERS = {"BT-01", "CT-02", "ST-03", "FT-01", null, null};
    /** 제품마다 필요한 공정만 순서대로 둔, 등록 화면 검증용 최소 경로 시드다. */
    private static final Map<String, List<String>> PRODUCT_PROCESS_ROUTES = Map.of(
            "PKT-A", List.of("Burn-in", "Core Test", "Speed Bin Test", "Final Test", "QA Verify", "Packing"),
            "PKT-B", List.of("Core Test", "Final Test", "QA Verify", "Packing"),
            "PKT-C", List.of("Burn-in", "Final Test", "QA Verify", "Packing"),
            "PKT-D", List.of("Speed Bin Test", "Final Test", "QA Verify", "Packing"),
            "H5AN8G6NCJR", List.of("Burn-in", "Core Test", "Speed Bin Test", "Final Test", "QA Verify", "Packing"),
            "H5AN4G6NBJR", List.of("Core Test", "Final Test", "QA Verify", "Packing"),
            "H9HCNNN8KUML", List.of("Burn-in", "Final Test", "QA Verify", "Packing"),
            "H5AN6G6NDJR", List.of("Speed Bin Test", "Final Test", "QA Verify", "Packing")
    );

    private final LotRepository lotRepository;
    private final ProductRepository productRepository;
    private final EquipmentRepository equipmentRepository;
    private final ProcessDefinitionRepository processRepository;
    private final LotProcessHistoryRepository historyRepository;
    private final ProductProcessRouteRepository productProcessRouteRepository;
    private final JdbcTemplate jdbcTemplate;

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        migrateStatusConstraint();
        lotRepository.normalizeLegacyStatuses();
        seedMissingLots();
        enrichExistingLots();
        linkReferenceDataAndHistories();
        spreadSampleUpdatedAt();
    }

    /**
     * Hibernate의 ddl-auto=update는 이미 생성된 enum CHECK 제약조건의 허용값을 갱신하지 않는다.
     * 기존 범용 상태와 PKT 상태를 잠시 함께 허용한 뒤 데이터를 정규화한다.
     */
    private void migrateStatusConstraint() {
        jdbcTemplate.execute("ALTER TABLE lots DROP CONSTRAINT IF EXISTS lots_status_check");
        jdbcTemplate.execute("""
                ALTER TABLE lots ADD CONSTRAINT lots_status_check
                CHECK (status IN ('WAITING', 'IN_PROGRESS', 'COMPLETED', 'HOLD', 'WAIT', 'RUN', 'DONE', 'FAIL'))
                """);
    }

    private void seedMissingLots() {
        if (lotRepository.count() >= TOTAL_LOTS) return;

        Set<String> existingCodes = lotRepository.findAll().stream()
                .map(Lot::getLotCode)
                .collect(Collectors.toSet());

        LotStatus[] statuses = LotStatus.values();
        List<Lot> lots = new ArrayList<>();
        for (int index = 1; index <= TOTAL_LOTS; index++) {
            String lotCode = lotCode(index);
            if (existingCodes.contains(lotCode)) continue;

            String product = PRODUCTS[index % PRODUCTS.length];
            int profileIndex = index % PROCESSES.length;
            LotStatus status = statuses[index % 5];
            lots.add(Lot.create(lotCode, product, product, status, PROCESSES[profileIndex],
                    PACKAGE_TYPES[index % PACKAGE_TYPES.length], TESTERS[profileIndex],
                    index % 3 == 0 ? 1_024 : 2_048,
                    status == LotStatus.DONE || status == LotStatus.FAIL ? 96.5 + (index % 30) / 10.0 : null,
                    status == LotStatus.RUN ? Instant.now().minus(Duration.ofMinutes(index * 7L)) : null));
        }

        if (lots.isEmpty()) return;
        lotRepository.saveAll(lots);
        log.info("Seeded sample lots: {}", lots.size());
    }

    private void enrichExistingLots() {
        for (Lot lot : lotRepository.findAll()) {
            int index = Math.abs(lot.getLotCode().hashCode());
            int processIndex = index % PROCESSES.length;
            LotStatus status = lot.getStatus();
            lot.enrichForPkt(
                    PROCESSES[processIndex],
                    PACKAGE_TYPES[index % PACKAGE_TYPES.length],
                    TESTERS[processIndex],
                    index % 3 == 0 ? 1_024 : 2_048,
                    status == LotStatus.DONE || status == LotStatus.FAIL ? 96.5 + (index % 30) / 10.0 : null,
                    status == LotStatus.RUN ? Instant.now().minus(Duration.ofMinutes(index % 480)) : null
            );
        }
    }

    /** 기존 문자열 기반 샘플도 제품·공정·Tester FK와 최소 한 건의 공정 이력을 갖도록 보완한다. */
    private void linkReferenceDataAndHistories() {
        for (int index = 0; index < PROCESSES.length; index++) {
            String name = PROCESSES[index];
            processRepository.findByProcessCode(code(name))
                    .orElseGet(() -> processRepository.save(ProcessDefinition.of(code(name), name)));
        }
        for (Lot lot : lotRepository.findAll()) {
            Product product = productRepository.findByProductCode(lot.getProductCode())
                    .orElseGet(() -> productRepository.save(Product.of(lot.getProductCode(), lot.getProductName())));
            ProcessDefinition process = processRepository.findByProcessCode(code(lot.getProcess())).orElseThrow();
            Equipment equipment = lot.getTester() == null ? null : equipmentRepository.findAllByOrderByCodeAsc().stream()
                    .filter(candidate -> candidate.getCode().equals(lot.getTester()))
                    .findFirst()
                    .orElseGet(() -> equipmentRepository.save(Equipment.create(lot.getTester(), lot.getTester(), lot.getProcess(), "PKT TEST", EquipmentStatus.IDLE, null, Instant.now(), "LOT 샘플 Tester")));
            lot.moveTo(product, process, equipment);
            if (!historyRepository.existsByLotId(lot.getId())) {
                LotProcessHistory history = LotProcessHistory.start(lot, process, equipment, lot.getQuantity() == null ? 0 : lot.getQuantity());
                if (lot.getStatus() == LotStatus.DONE || lot.getStatus() == LotStatus.FAIL) {
                    int good = lot.getYieldRate() == null ? 0 : (int) Math.round(history.getInputQuantity() * lot.getYieldRate() / 100.0);
                    history.complete(good, Math.max(0, history.getInputQuantity() - good));
                }
                historyRepository.save(history);
            }
        }
        seedProductProcessRoutes();
    }

    /** 샘플 제품이 실제 공정 경로를 갖도록 등록 화면용 마스터 관계를 보완한다. */
    private void seedProductProcessRoutes() {
        for (Map.Entry<String, List<String>> route : PRODUCT_PROCESS_ROUTES.entrySet()) {
            Product product = productRepository.findByProductCode(route.getKey()).orElse(null);
            if (product == null) continue;
            for (int index = 0; index < route.getValue().size(); index++) {
                ProcessDefinition process = processRepository.findByProcessCode(code(route.getValue().get(index))).orElseThrow();
                if (!productProcessRouteRepository.existsByProductIdAndProcessId(product.getId(), process.getId())) {
                    productProcessRouteRepository.save(ProductProcessRoute.of(product, process, index + 1));
                }
            }
        }
    }

    private String code(String value) {
        return value.toUpperCase().replaceAll("[^A-Z0-9]+", "_").replaceAll("^_|_$", "");
    }

    /**
     * 샘플 LOT의 수정일을 LOT 번호 순서대로 과거에 흩뿌린다.
     * 모든 행의 수정일이 같으면 수정일 정렬이 동작하는지 화면에서 확인할 수 없다.
     */
    private void spreadSampleUpdatedAt() {
        Instant anchor = Instant.now().truncatedTo(ChronoUnit.DAYS);
        int updated = 0;
        for (Lot lot : lotRepository.findAll()) {
            Instant expected = sampleUpdatedAt(anchor, lot.getLotCode());
            if (expected == null || expected.equals(lot.getUpdatedAt())) continue;
            lotRepository.updateUpdatedAt(lot.getId(), expected);
            updated++;
        }
        if (updated > 0) log.info("Spread sample lot updatedAt: {}", updated);
    }

    /** 샘플 코드 규칙에 맞는 LOT만 대상으로 한다. 직접 추가한 LOT은 건드리지 않는다. */
    private Instant sampleUpdatedAt(Instant anchor, String lotCode) {
        Matcher matcher = SAMPLE_CODE.matcher(lotCode);
        if (!matcher.matches()) return null;

        int index = Integer.parseInt(matcher.group(1));
        if (index < 1 || index > TOTAL_LOTS) return null;

        return anchor.minus(Duration.ofMinutes((TOTAL_LOTS - index) * SPREAD_MINUTES));
    }

    private String lotCode(int index) {
        return String.format("LOT-2026-%03d", index);
    }
}
