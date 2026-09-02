package com.cj.mesprototype.workorder.infrastructure;

import com.cj.mesprototype.workorder.domain.WorkOrder;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface WorkOrderRepository extends JpaRepository<WorkOrder, Long> {
    boolean existsByCode(String code);

    Optional<WorkOrder> findByCode(String code);

    /** LOT 분할 저장 중에는 같은 작업지시를 잠가 잔여 수량 초과를 막는다. */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select workOrder from WorkOrder workOrder where workOrder.id = :id")
    Optional<WorkOrder> findByIdForLotAllocation(@Param("id") Long id);

    List<WorkOrder> findAllByOrderByCodeAsc();
}
