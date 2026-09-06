package com.cj.novabss.plan.application;

import com.cj.novabss.plan.domain.RatePlan;
import com.cj.novabss.plan.domain.RatePlanCategory;
import com.cj.novabss.plan.domain.RatePlanSalesStatus;
import com.cj.novabss.plan.infrastructure.RatePlanCategoryRepository;
import com.cj.novabss.plan.infrastructure.RatePlanRepository;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/**
 * 로컬 개발 화면과 조회 API를 확인하기 위한 최소 샘플 데이터를 준비한다.
 */
@Component
// app.seed.enabled=true인 로컬 환경에서만 Bean으로 등록한다.
@ConditionalOnProperty(prefix = "app.seed", name = "enabled", havingValue = "true")
public class RatePlanSeedDataInitializer implements ApplicationRunner {
    private final RatePlanCategoryRepository categoryRepository;
    private final RatePlanRepository ratePlanRepository;

    public RatePlanSeedDataInitializer(
        RatePlanCategoryRepository categoryRepository,
        RatePlanRepository ratePlanRepository
    ) {
        this.categoryRepository = categoryRepository;
        this.ratePlanRepository = ratePlanRepository;
    }

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        OffsetDateTime now = OffsetDateTime.now();

        // 화면의 카테고리 필터에서 사용할 기본 분류다.
        RatePlanCategory mobile = findOrCreateCategory("MOBILE", "휴대폰", 1, now);
        RatePlanCategory data = findOrCreateCategory("DATA", "데이터 전용", 2, now);
        RatePlanCategory iot = findOrCreateCategory("IOT", "IoT", 3, now);

        // 각 요금제 코드를 기준으로 존재하지 않을 때만 샘플 데이터를 만든다.
        createRatePlanIfAbsent(
            mobile,
            "NOVA-MOBILE-59",
            "NOVA 모바일 59",
            new BigDecimal("59000"),
            RatePlanSalesStatus.ACTIVE,
            "5G 휴대폰 기본 요금제",
            now
        );
        createRatePlanIfAbsent(
            data,
            "NOVA-DATA-25",
            "NOVA 데이터 25",
            new BigDecimal("25000"),
            RatePlanSalesStatus.ACTIVE,
            "데이터 전용 기본 요금제",
            now
        );
        createRatePlanIfAbsent(
            iot,
            "NOVA-IOT-10",
            "NOVA IoT 10",
            new BigDecimal("10000"),
            RatePlanSalesStatus.DRAFT,
            "IoT 단말용 초안 요금제",
            now
        );
    }

    private RatePlanCategory findOrCreateCategory(String code, String name, int sortOrder, OffsetDateTime now) {
        return categoryRepository.findByCode(code)
            // 같은 코드가 없을 때만 새 Entity를 만들어 저장한다.
            .orElseGet(() -> categoryRepository.save(RatePlanCategory.create(code, name, sortOrder, now)));
    }

    private void createRatePlanIfAbsent(
        RatePlanCategory category,
        String ratePlanCode,
        String name,
        BigDecimal monthlyFee,
        RatePlanSalesStatus salesStatus,
        String description,
        OffsetDateTime now
    ) {
        if (ratePlanRepository.existsByRatePlanCode(ratePlanCode)) {
            // 기존 데이터를 보존하는 설정으로 전환된 뒤에도 중복 저장하지 않는다.
            return;
        }

        ratePlanRepository.save(RatePlan.create(
            category,
            ratePlanCode,
            name,
            monthlyFee,
            salesStatus,
            now,
            description,
            now
        ));
    }
}
