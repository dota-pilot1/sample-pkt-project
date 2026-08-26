package com.cj.mesprototype.equipment.infrastructure;

import com.cj.mesprototype.equipment.domain.EquipmentStatusHistory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface EquipmentStatusHistoryRepository extends JpaRepository<EquipmentStatusHistory, Long> {
    List<EquipmentStatusHistory> findTop5ByEquipmentIdOrderByChangedAtDesc(Long equipmentId);
}
