package com.cj.novabss.plan.infrastructure;

import com.cj.novabss.plan.domain.RatePlan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface RatePlanRepository extends JpaRepository<RatePlan, Long>, JpaSpecificationExecutor<RatePlan> {
    // rate_plan_code는 유일하므로 시더 중복 여부를 빠르게 확인할 수 있다.
    boolean existsByRatePlanCode(String ratePlanCode);
}
