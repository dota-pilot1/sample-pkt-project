package com.cj.mesprototype.equipment.presentation.dto;

import com.cj.mesprototype.equipment.domain.EquipmentStatusHistory;

import java.time.Instant;

public record EquipmentStatusHistoryResponse(
        Long id,
        String status,
        String reason,
        Instant changedAt
) {
    public static EquipmentStatusHistoryResponse from(EquipmentStatusHistory history) {
        return new EquipmentStatusHistoryResponse(
                history.getId(),
                history.getStatus().name(),
                history.getReason(),
                history.getChangedAt()
        );
    }
}
