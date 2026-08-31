package com.cj.mesprototype.lot.infrastructure;

import com.cj.mesprototype.lot.domain.LotNumberSequence;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface LotNumberSequenceRepository extends JpaRepository<LotNumberSequence, Integer> {
    /** 같은 연도의 채번 요청은 행 잠금으로 직렬화해 중복 번호를 막는다. */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select sequence from LotNumberSequence sequence where sequence.sequenceYear = :year")
    Optional<LotNumberSequence> findByYearForUpdate(@Param("year") int year);
}
