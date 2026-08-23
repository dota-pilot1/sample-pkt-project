package com.cj.mesprototype.lot.infrastructure;

import com.cj.mesprototype.lot.domain.Lot;
import org.springframework.data.jpa.repository.JpaRepository;

public interface LotRepository extends JpaRepository<Lot, Long> {
    boolean existsByLotCode(String lotCode);
}
