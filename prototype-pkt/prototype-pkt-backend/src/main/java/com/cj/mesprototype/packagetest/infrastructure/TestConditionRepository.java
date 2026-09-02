package com.cj.mesprototype.packagetest.infrastructure;

import com.cj.mesprototype.packagetest.domain.TestCondition;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TestConditionRepository extends JpaRepository<TestCondition, Long> {
    boolean existsByTestSpecIdAndTestNumberAndIdNot(Long testSpecId, Integer testNumber, Long id);
}
