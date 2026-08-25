package com.cj.mesprototype.qualityinspection.infrastructure;

import com.cj.mesprototype.qualityinspection.domain.QualityInspection;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface QualityInspectionRepository extends JpaRepository<QualityInspection, Long> {
    boolean existsByLotCode(String lotCode);

    List<QualityInspection> findAllByOrderByProducedAtDesc();
}
