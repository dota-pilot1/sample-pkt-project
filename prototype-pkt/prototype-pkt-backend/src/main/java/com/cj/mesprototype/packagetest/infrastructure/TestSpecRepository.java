package com.cj.mesprototype.packagetest.infrastructure;

import com.cj.mesprototype.packagetest.domain.TestSpec;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TestSpecRepository extends JpaRepository<TestSpec, Long> {
    List<TestSpec> findAllByOrderByProductProductCodeAscSpecNameAscVersionDesc();
    boolean existsByProductIdAndSpecNameAndVersion(Long productId, String specName, Integer version);
}
