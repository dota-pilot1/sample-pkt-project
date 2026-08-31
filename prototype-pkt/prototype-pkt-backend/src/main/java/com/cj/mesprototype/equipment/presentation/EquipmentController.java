package com.cj.mesprototype.equipment.presentation;

import com.cj.mesprototype.equipment.application.EquipmentService;
import com.cj.mesprototype.equipment.presentation.dto.EquipmentResponse;
import com.cj.mesprototype.equipment.presentation.dto.EquipmentStatusHistoryResponse;
import com.cj.mesprototype.equipment.presentation.dto.UpdateEquipmentStatusRequest;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/equipments")
@RequiredArgsConstructor
@Tag(name = "Equipment", description = "설비 상태 관리")
public class EquipmentController {

    private final EquipmentService equipmentService;

    // 설비 목록을 조회해 테이블과 상태 집계의 원천 데이터를 제공한다.
    @GetMapping
    @Operation(summary = "설비 목록 조회")
    public List<EquipmentResponse> getEquipments() {
        return equipmentService.getEquipments();
    }

    // 선택한 설비의 최신 정보와 최근 상태 이력을 함께 반환한다.
    @GetMapping("/{id}")
    @Operation(summary = "설비 상세 조회")
    public EquipmentResponse getEquipment(@PathVariable Long id) {
        return equipmentService.getEquipment(id);
    }

    // 상세 화면에서 상태 이력만 갱신할 수 있도록 별도 조회 경로를 제공한다.
    @GetMapping("/{id}/status-history")
    @Operation(summary = "설비 상태 변경 이력 조회")
    public List<EquipmentStatusHistoryResponse> getStatusHistory(@PathVariable Long id) {
        return equipmentService.getStatusHistory(id);
    }

    // 상태 변경은 관리자 역할만 수행할 수 있도록 API 경계에서 차단한다.
    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "설비 상태 변경 (ROLE_ADMIN)")
    public EquipmentResponse updateStatus(
            @PathVariable Long id,
            @Valid @RequestBody UpdateEquipmentStatusRequest request) {
        return equipmentService.updateStatus(id, request);
    }
}
