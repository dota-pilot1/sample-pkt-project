package com.cj.mesprototype.lot.infrastructure;

import com.cj.mesprototype.lot.domain.Lot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface LotRepository extends JpaRepository<Lot, Long> {
    boolean existsByLotCode(String lotCode);

    @Query("""
            select l from Lot l
            where (:status is null or l.status = :status)
              and (:productCode = '' or l.productCode = :productCode)
              and (:process = '' or l.process = :process)
              and (:tester = '' or (:tester = '__UNASSIGNED__' and l.tester is null) or l.tester = :tester)
              and (:keyword = '' or lower(l.lotCode) like lower(concat('%', :keyword, '%'))
                   or lower(l.productCode) like lower(concat('%', :keyword, '%'))
                   or lower(l.productName) like lower(concat('%', :keyword, '%'))
                   or lower(l.process) like lower(concat('%', :keyword, '%'))
                   or lower(coalesce(l.tester, '')) like lower(concat('%', :keyword, '%')))
            """)
    Page<Lot> search(@Param("keyword") String keyword, @Param("status") com.cj.mesprototype.lot.domain.LotStatus status,
                     @Param("productCode") String productCode, @Param("process") String process,
                     @Param("tester") String tester, Pageable pageable);

    @Query("select distinct l.productCode from Lot l where l.productCode is not null and l.productCode <> '' order by l.productCode")
    List<String> findDistinctProductCodes();

    @Query("select distinct l.process from Lot l where l.process is not null and l.process <> '' order by l.process")
    List<String> findDistinctProcesses();

    @Query("select distinct l.tester from Lot l where l.tester is not null and l.tester <> '' order by l.tester")
    List<String> findDistinctTesters();

    boolean existsByTesterIsNull();

    @Query("select coalesce(sum(l.quantity), 0) from Lot l where l.workOrder.id = :workOrderId")
    Long sumQuantityByWorkOrderId(@Param("workOrderId") Long workOrderId);

    List<Lot> findAllByWorkOrderIdOrderByUpdatedAtDesc(Long workOrderId);

    @Modifying
    @Query(value = """
            update lots
            set status = case status
                when 'WAITING' then 'WAIT'
                when 'IN_PROGRESS' then 'RUN'
                when 'COMPLETED' then 'DONE'
                else status
            end
            where status in ('WAITING', 'IN_PROGRESS', 'COMPLETED')
            """, nativeQuery = true)
    void normalizeLegacyStatuses();

    /**
     * 샘플 데이터의 수정일을 지정한 값으로 덮어쓴다.
     * JPQL 벌크 갱신이라 @PreUpdate가 동작하지 않으므로 과거 시각을 그대로 넣을 수 있다.
     */
    @Modifying
    @Query("update Lot l set l.updatedAt = :updatedAt where l.id = :id")
    void updateUpdatedAt(@Param("id") Long id, @Param("updatedAt") Instant updatedAt);
}
