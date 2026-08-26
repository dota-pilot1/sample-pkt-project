package com.cj.mesprototype.equipment.infrastructure;

import com.cj.mesprototype.equipment.domain.Equipment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface EquipmentRepository extends JpaRepository<Equipment, Long> {
    List<Equipment> findAllByOrderByCodeAsc();
}
