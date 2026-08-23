package com.cj.mesprototype.lot.presentation.dto;

import org.springframework.data.domain.Page;

import java.util.List;

public record LotPageResponse(
        List<LotSummaryResponse> content,
        int page,
        int size,
        long totalElements,
        int totalPages
) {
    public static LotPageResponse from(Page<LotSummaryResponse> page) {
        return new LotPageResponse(
                page.getContent(), page.getNumber(), page.getSize(),
                page.getTotalElements(), page.getTotalPages());
    }
}
