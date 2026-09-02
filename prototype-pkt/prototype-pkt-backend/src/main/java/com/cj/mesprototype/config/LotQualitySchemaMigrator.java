package com.cj.mesprototype.config;

import lombok.RequiredArgsConstructor;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.annotation.Order;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/** 기존 개발 DB의 규칙형 품질 기준 테이블을 단일 기준 레코드 구조로 안전하게 보완한다. */
@Component
@Order(9)
@RequiredArgsConstructor
public class LotQualitySchemaMigrator implements ApplicationRunner {
    private final JdbcTemplate jdbcTemplate;

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        jdbcTemplate.execute("alter table if exists lot_quality_standards add column if not exists minimum_yield_rate numeric(7,4)");
        jdbcTemplate.execute("alter table if exists lot_quality_standards add column if not exists minimum_good_quantity integer");
    }
}
