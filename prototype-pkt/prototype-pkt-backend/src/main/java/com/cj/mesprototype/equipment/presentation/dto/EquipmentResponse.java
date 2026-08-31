package com.cj.mesprototype.equipment.presentation.dto;

import com.cj.mesprototype.equipment.domain.Equipment;

import java.time.Instant;
import java.util.List;

public record EquipmentResponse(
        Long id,
        String code,
        String name,
        String processName,
        String location,
        String status,
        String currentLotNumber,
        Instant statusChangedAt,
        String statusReason,
        List<EquipmentStatusHistoryResponse> statusHistory
) {
    public static EquipmentResponse from(Equipment equipment, List<EquipmentStatusHistoryResponse> statusHistory) {
        return new EquipmentResponse(
                equipment.getId(),
                equipment.getCode(),
                equipment.getName(),
                equipment.getProcessName(),
                equipment.getLocation(),
                equipment.getStatus().name(),
                equipment.getCurrentLotNumber(),
                equipment.getStatusChangedAt(),
                equipment.getStatusReason(),
                statusHistory
        );
    }
}
