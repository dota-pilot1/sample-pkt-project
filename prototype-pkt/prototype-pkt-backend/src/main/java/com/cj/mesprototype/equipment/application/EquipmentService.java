package com.cj.mesprototype.equipment.application;

import com.cj.mesprototype.common.exception.BusinessException;
import com.cj.mesprototype.common.exception.ErrorCode;
import com.cj.mesprototype.equipment.domain.Equipment;
import com.cj.mesprototype.equipment.domain.EquipmentStatusHistory;
import com.cj.mesprototype.equipment.infrastructure.EquipmentRepository;
import com.cj.mesprototype.equipment.infrastructure.EquipmentStatusHistoryRepository;
import com.cj.mesprototype.equipment.presentation.dto.EquipmentResponse;
import com.cj.mesprototype.equipment.presentation.dto.EquipmentStatusHistoryResponse;
import com.cj.mesprototype.equipment.presentation.dto.UpdateEquipmentStatusRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;

@Service
@RequiredArgsConstructor
public class EquipmentService {

    private final EquipmentRepository equipmentRepository;
    private final EquipmentStatusHistoryRepository historyRepository;

    // 목록에서는 이력을 조인하지 않아 테이블 조회를 가볍게 유지한다.
    @Transactional(readOnly = true)
    public List<EquipmentResponse> getEquipments() {
        return equipmentRepository.findAllByOrderByCodeAsc().stream()
                .map(equipment -> toResponse(equipment, List.of()))
                .toList();
    }

    // 상세 조회에서는 설비와 최근 이력을 하나의 응답으로 조립한다.
    @Transactional(readOnly = true)
    public EquipmentResponse getEquipment(Long id) {
        Equipment equipment = getEntity(id);
        return toResponse(equipment, getHistory(id));
    }

    // 상태 본체와 이력 저장을 하나의 트랜잭션으로 묶어 두 데이터의 불일치를 막는다.
    @Transactional
    public EquipmentResponse updateStatus(Long id, UpdateEquipmentStatusRequest request) {
        Equipment equipment = getEntity(id);
        String reason = request.reason() == null || request.reason().isBlank()
                ? "관리자 수동 상태 변경"
                : request.reason().trim();

        equipment.changeStatus(request.status(), reason);
        Instant changedAt = equipment.getStatusChangedAt();
        historyRepository.save(EquipmentStatusHistory.create(equipment, request.status(), reason, changedAt));
        return toResponse(equipment, getHistory(id));
    }

    @Transactional(readOnly = true)
    public List<EquipmentStatusHistoryResponse> getStatusHistory(Long id) {
        getEntity(id);
        return getHistory(id);
    }

    // 상세 화면에 필요한 최근 5건만 최신순으로 반환한다.
    private List<EquipmentStatusHistoryResponse> getHistory(Long id) {
        return historyRepository.findTop5ByEquipmentIdOrderByChangedAtDesc(id).stream()
                .map(EquipmentStatusHistoryResponse::from)
                .toList();
    }

    // 도메인 엔티티를 외부 공개용 DTO로 변환해 내부 구조를 감춘다.
    private EquipmentResponse toResponse(Equipment equipment, List<EquipmentStatusHistoryResponse> history) {
        return EquipmentResponse.from(equipment, history);
    }

    // 존재하지 않는 설비는 공통 비즈니스 예외로 변환해 일관된 오류 응답을 만든다.
    private Equipment getEntity(Long id) {
        return equipmentRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.EQUIPMENT_NOT_FOUND));
    }
}
