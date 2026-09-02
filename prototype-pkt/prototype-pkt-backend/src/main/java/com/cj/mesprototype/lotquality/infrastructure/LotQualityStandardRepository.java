package com.cj.mesprototype.lotquality.infrastructure;

import com.cj.mesprototype.lotquality.domain.LotQualityStandard;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface LotQualityStandardRepository extends JpaRepository<LotQualityStandard, Long> {
    List<LotQualityStandard> findAllByOrderByProductProductCodeAscStandardNameAscVersionDesc();
    boolean existsByProductIdAndStandardNameAndVersion(Long productId, String standardName, Integer version);
    boolean existsByProductIdAndStandardNameAndVersionAndIdNot(Long productId, String standardName, Integer version, Long id);
}
