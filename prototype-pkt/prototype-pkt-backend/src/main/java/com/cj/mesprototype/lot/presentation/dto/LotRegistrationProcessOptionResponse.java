package com.cj.mesprototype.lot.presentation.dto;

import com.cj.mesprototype.lot.domain.ProductProcessRoute;

import java.util.List;

/** 선택한 제품의 공정 경로를 등록 순서대로 표시하는 응답이다. */
public record LotRegistrationProcessOptionResponse(
        Long processId,
        String processCode,
        String processName,
        int sequenceNo
) {
    public static List<LotRegistrationProcessOptionResponse> from(
            List<ProductProcessRoute> routes) {
        return routes.stream()
                .map(route -> new LotRegistrationProcessOptionResponse(
                        route.getProcess().getId(),
                        route.getProcess().getProcessCode(),
                        route.getProcess().getProcessName(),
                        route.getSequenceNo()))
                .toList();
    }
}
