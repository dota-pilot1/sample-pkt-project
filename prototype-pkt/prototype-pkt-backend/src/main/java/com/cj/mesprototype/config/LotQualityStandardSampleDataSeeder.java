package com.cj.mesprototype.config;

import com.cj.mesprototype.lotquality.infrastructure.LotQualityStandardRepository;
import com.cj.mesprototype.lotquality.infrastructure.LotQualityRuleRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;


/** 기준 관리 화면은 사용자 기준부터 시작하므로, 이전 개발용 샘플 기준만 정리한다. */
@Component
@Order(10)
@RequiredArgsConstructor
@Slf4j
public class LotQualityStandardSampleDataSeeder implements ApplicationRunner {
    private final LotQualityStandardRepository standardRepository;
    private final LotQualityRuleRepository ruleRepository;

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        var sampleStandards = standardRepository.findAllByOrderByProductProductCodeAscStandardNameAscVersionDesc().stream()
                .filter(standard -> "PKT 학습용 LOT 출하 판정 기준".equals(standard.getDescription()))
                .toList();
        if (!sampleStandards.isEmpty()) {
            ruleRepository.deleteByStandardIds(sampleStandards.stream().map(standard -> standard.getId()).toList());
            standardRepository.deleteAll(sampleStandards);
            log.info("이전 LOT 품질 기준 샘플 {}건을 정리했습니다.", sampleStandards.size());
        }
    }
}
