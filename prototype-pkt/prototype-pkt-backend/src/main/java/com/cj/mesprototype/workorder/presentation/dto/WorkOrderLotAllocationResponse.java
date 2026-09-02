package com.cj.mesprototype.workorder.presentation.dto;

import com.cj.mesprototype.lot.presentation.dto.LotSummaryResponse;

import java.util.List;

/** 작업지시 계획 수량을 어떤 LOT으로 분할했는지 보여주는 상세 응답이다. */
public record WorkOrderLotAllocationResponse(
        WorkOrderResponse workOrder,
        int allocatedLotQuantity,
        int remainingLotQuantity,
        List<LotSummaryResponse> lots
) {
}
