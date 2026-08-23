package com.cj.mesprototype.lot.application;

import com.cj.mesprototype.common.exception.BusinessException;
import com.cj.mesprototype.common.exception.ErrorCode;
import com.cj.mesprototype.lot.domain.Lot;
import com.cj.mesprototype.lot.infrastructure.LotRepository;
import com.cj.mesprototype.lot.presentation.dto.LotPageResponse;
import com.cj.mesprototype.lot.presentation.dto.LotSummaryResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class LotService {
    private static final int MAX_PAGE_SIZE = 100;

    private final LotRepository lotRepository;

    @Transactional(readOnly = true)
    public LotPageResponse getLots(Pageable pageable) {
        if (pageable.getPageNumber() < 0 || pageable.getPageSize() < 1
                || pageable.getPageSize() > MAX_PAGE_SIZE) {
            throw new BusinessException(ErrorCode.LOT_INVALID_PAGINATION);
        }

        Page<LotSummaryResponse> page = lotRepository.findAll(pageable)
                .map(LotSummaryResponse::from);
        return LotPageResponse.from(page);
    }
}
