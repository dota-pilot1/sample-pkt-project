package com.cj.mesprototype.lot.infrastructure;

import com.cj.mesprototype.lot.domain.Lot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;

public interface LotRepository extends JpaRepository<Lot, Long> {
    boolean existsByLotCode(String lotCode);

    /**
     * 샘플 데이터의 수정일을 지정한 값으로 덮어쓴다.
     * JPQL 벌크 갱신이라 @PreUpdate가 동작하지 않으므로 과거 시각을 그대로 넣을 수 있다.
     */
    @Modifying
    @Query("update Lot l set l.updatedAt = :updatedAt where l.id = :id")
    void updateUpdatedAt(@Param("id") Long id, @Param("updatedAt") Instant updatedAt);
}
