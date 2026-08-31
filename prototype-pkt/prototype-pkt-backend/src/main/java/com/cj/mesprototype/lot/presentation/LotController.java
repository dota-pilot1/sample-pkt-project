package com.cj.mesprototype.lot.presentation;

import com.cj.mesprototype.common.exception.BusinessException;
import com.cj.mesprototype.common.exception.ErrorCode;
import com.cj.mesprototype.lot.application.LotService;
import com.cj.mesprototype.lot.domain.LotSortField;
import com.cj.mesprototype.lot.domain.LotStatus;
import com.cj.mesprototype.lot.presentation.dto.LotPageResponse;
import com.cj.mesprototype.lot.presentation.dto.LotFilterOptionsResponse;
import com.cj.mesprototype.lot.presentation.dto.CreateLotRequest;
import com.cj.mesprototype.lot.presentation.dto.UpdateLotRequest;
import com.cj.mesprototype.lot.presentation.dto.LotSummaryResponse;
import com.cj.mesprototype.lot.presentation.dto.LotRegistrationOptionsResponse;
import com.cj.mesprototype.lot.presentation.dto.LotRegistrationProcessOptionResponse;
import jakarta.validation.Valid;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/lots")
@RequiredArgsConstructor
@Tag(name = "Lot", description = "LOT 목록 조회")
public class LotController {
    private static final int MAX_PAGE_SIZE = 100;

    private final LotService lotService;

    @GetMapping("/filter-options")
    @Operation(summary = "LOT 목록 필터 선택지 조회")
    public LotFilterOptionsResponse getFilterOptions() {
        return lotService.getFilterOptions();
    }

    @GetMapping("/registration-options")
    @Operation(summary = "LOT 등록 제품·공정 선택지 조회")
    public LotRegistrationOptionsResponse getRegistrationOptions() {
        return lotService.getRegistrationOptions();
    }

    @GetMapping("/registration-options/products/{productId}/processes")
    @Operation(summary = "선택한 제품의 LOT 등록 공정 경로 조회")
    public java.util.List<LotRegistrationProcessOptionResponse> getRegistrationProcessOptions(
            @PathVariable Long productId) {
        return lotService.getRegistrationProcessOptions(productId);
    }

    @PostMapping
    @Operation(summary = "LOT 등록")
    public ResponseEntity<LotSummaryResponse> createLot(
            @Valid @RequestBody CreateLotRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(lotService.createLot(request));
    }

    @PutMapping("/{lotId}")
    @Operation(summary = "대기 LOT 수정")
    public LotSummaryResponse updateLot(
            @PathVariable Long lotId,
            @Valid @RequestBody UpdateLotRequest request) {
        return lotService.updateLot(lotId, request);
    }

    @DeleteMapping("/{lotId}")
    @Operation(summary = "대기 LOT 삭제")
    public ResponseEntity<Void> deleteLot(@PathVariable Long lotId) {
        lotService.deleteLot(lotId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping
    @Operation(summary = "LOT 목록 조회 (페이지네이션, 정렬)")
    public LotPageResponse getLots(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "updatedAt") String sort,
            @RequestParam(defaultValue = "desc") String direction,
            @RequestParam(defaultValue = "") String keyword,
            @RequestParam(required = false) LotStatus status,
            @RequestParam(defaultValue = "") String productCode,
            @RequestParam(defaultValue = "") String process,
            @RequestParam(defaultValue = "") String tester) {
        if (page < 0 || size < 1 || size > MAX_PAGE_SIZE) {
            throw new BusinessException(ErrorCode.LOT_INVALID_PAGINATION);
        }
        return lotService.getLots(keyword.trim(), status, productCode.trim(), process.trim(), tester.trim(), PageRequest.of(page, size, toSort(sort, direction)));
    }

    /** 정렬 값이 같은 행이 있어도 페이지 경계가 흔들리지 않도록 id를 마지막 기준으로 덧붙인다. */
    private Sort toSort(String sort, String direction) {
        return Sort.by(toDirection(direction), LotSortField.from(sort).property())
                .and(Sort.by(Sort.Direction.ASC, "id"));
    }

    private Sort.Direction toDirection(String direction) {
        if ("asc".equalsIgnoreCase(direction)) return Sort.Direction.ASC;
        if ("desc".equalsIgnoreCase(direction)) return Sort.Direction.DESC;
        throw new BusinessException(ErrorCode.LOT_INVALID_SORT);
    }
}
