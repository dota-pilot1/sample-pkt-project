package com.cj.mesprototype.equipment.presentation.dto;

import com.cj.mesprototype.equipment.domain.EquipmentStatus;
import jakarta.validation.constraints.NotNull;

public record UpdateEquipmentStatusRequest(
        @NotNull EquipmentStatus status,
        String reason
) {
}
