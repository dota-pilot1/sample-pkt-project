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

import java.time.Duration;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
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
    private static final String[] PRODUCTS = {"PKT-A", "PKT-B", "PKT-C", "PKT-D"};
    private static final String[] PROCESSES = {"식각", "세정", "노광", "검사", "조립", "포장"};

    private final LotRepository lotRepository;

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        seedMissingLots();
        spreadSampleUpdatedAt();
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
            lots.add(Lot.create(lotCode, product, product,
                    statuses[index % statuses.length], PROCESSES[index % PROCESSES.length]));
        }

        if (lots.isEmpty()) return;
        lotRepository.saveAll(lots);
        log.info("Seeded sample lots: {}", lots.size());
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
