package com.cj.mesprototype.lotquality.infrastructure;

import com.cj.mesprototype.lotquality.domain.LotQualityRule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Collection;

/** 이전 다중 조건 스키마의 데이터 정리와 마이그레이션 호환을 위한 저장소다. */
public interface LotQualityRuleRepository extends JpaRepository<LotQualityRule, Long> {
    @Modifying
    @Query("delete from LotQualityRule rule where rule.standard.id in :standardIds")
    void deleteByStandardIds(@Param("standardIds") Collection<Long> standardIds);
}
