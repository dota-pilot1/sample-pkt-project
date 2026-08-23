package com.cj.mesprototype.lot.presentation;

import com.cj.mesprototype.common.exception.BusinessException;
import com.cj.mesprototype.common.exception.ErrorCode;
import com.cj.mesprototype.lot.application.LotService;
import com.cj.mesprototype.lot.domain.LotSortField;
import com.cj.mesprototype.lot.presentation.dto.LotPageResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.web.bind.annotation.GetMapping;
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

    @GetMapping
    @Operation(summary = "LOT 목록 조회 (페이지네이션, 정렬)")
    public LotPageResponse getLots(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "updatedAt") String sort,
            @RequestParam(defaultValue = "desc") String direction) {
        if (page < 0 || size < 1 || size > MAX_PAGE_SIZE) {
            throw new BusinessException(ErrorCode.LOT_INVALID_PAGINATION);
        }
        return lotService.getLots(PageRequest.of(page, size, toSort(sort, direction)));
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
