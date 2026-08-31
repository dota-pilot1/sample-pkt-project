package com.cj.mesprototype.lot.presentation.dto;

import java.util.List;

/** LOT 목록 조건과 동일한 데이터 원본에서 구성한 필터 선택지다. */
public record LotFilterOptionsResponse(
        List<String> productCodes,
        List<String> processes,
        List<String> testers,
        boolean hasUnassignedTester
) {
    public static LotFilterOptionsResponse of(
            List<String> productCodes,
            List<String> processes,
            List<String> testers,
            boolean hasUnassignedTester
    ) {
        return new LotFilterOptionsResponse(productCodes, processes, testers, hasUnassignedTester);
    }
}
