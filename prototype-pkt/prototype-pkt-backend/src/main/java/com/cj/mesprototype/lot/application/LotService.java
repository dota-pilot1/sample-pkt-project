package com.cj.mesprototype.lot.application;

import com.cj.mesprototype.common.exception.BusinessException;
import com.cj.mesprototype.common.exception.ErrorCode;
import com.cj.mesprototype.lot.domain.Lot;
import com.cj.mesprototype.lot.domain.LotNumberSequence;
import com.cj.mesprototype.lot.domain.LotStatus;
import com.cj.mesprototype.lot.domain.ProcessDefinition;
import com.cj.mesprototype.lot.domain.Product;
import com.cj.mesprototype.lot.infrastructure.LotNumberSequenceRepository;
import com.cj.mesprototype.lot.infrastructure.LotProcessHistoryRepository;
import com.cj.mesprototype.lot.infrastructure.ProcessDefinitionRepository;
import com.cj.mesprototype.lot.infrastructure.ProductRepository;
import com.cj.mesprototype.lot.infrastructure.ProductProcessRouteRepository;
import com.cj.mesprototype.lot.infrastructure.LotRepository;
import com.cj.mesprototype.lot.presentation.dto.LotPageResponse;
import com.cj.mesprototype.lot.presentation.dto.LotFilterOptionsResponse;
import com.cj.mesprototype.lot.presentation.dto.LotSummaryResponse;
import com.cj.mesprototype.lot.presentation.dto.CreateLotRequest;
import com.cj.mesprototype.lot.presentation.dto.UpdateLotRequest;
import com.cj.mesprototype.lot.presentation.dto.LotRegistrationOptionsResponse;
import com.cj.mesprototype.lot.presentation.dto.LotRegistrationProcessOptionResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Year;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
public class LotService {
    private static final int MAX_PAGE_SIZE = 100;
    private static final Pattern LOT_NUMBER_PATTERN = Pattern.compile("LOT-(\\d{4})-(\\d+)");

    private final LotRepository lotRepository;
    private final LotProcessHistoryRepository lotProcessHistoryRepository;
    private final LotNumberSequenceRepository lotNumberSequenceRepository;
    private final ProductRepository productRepository;
    private final ProcessDefinitionRepository processDefinitionRepository;
    private final ProductProcessRouteRepository productProcessRouteRepository;

    @Transactional(readOnly = true)
    public LotPageResponse getLots(String keyword, LotStatus status, String productCode, String process, String tester, Pageable pageable) {
        if (pageable.getPageNumber() < 0 || pageable.getPageSize() < 1
                || pageable.getPageSize() > MAX_PAGE_SIZE) {
            throw new BusinessException(ErrorCode.LOT_INVALID_PAGINATION);
        }

        Page<LotSummaryResponse> page = lotRepository.search(keyword, status, productCode, process, tester, pageable)
                .map(LotSummaryResponse::from);
        return LotPageResponse.from(page);
    }

    /** 목록 검색에 쓰는 제품·공정·Tester 선택지를 현재 LOT 데이터에서 반환한다. */
    @Transactional(readOnly = true)
    public LotFilterOptionsResponse getFilterOptions() {
        return LotFilterOptionsResponse.of(
                lotRepository.findDistinctProductCodes(),
                lotRepository.findDistinctProcesses(),
                lotRepository.findDistinctTesters(),
                lotRepository.existsByTesterIsNull());
    }

    /** 등록 시점에는 생산 결과를 만들지 않고, 대기 상태 LOT만 저장한다. */
    @Transactional
    public LotSummaryResponse createLot(CreateLotRequest request) {
        String lotCode = nextLotCode();
        Product product = productRepository.findById(request.productId())
                .orElseThrow(() -> new BusinessException(ErrorCode.LOT_PRODUCT_NOT_FOUND));
        ProcessDefinition process = processDefinitionRepository.findById(request.processId())
                .orElseThrow(() -> new BusinessException(ErrorCode.LOT_PROCESS_NOT_FOUND));
        if (!productProcessRouteRepository.existsByProductIdAndProcessId(product.getId(), process.getId())) {
            throw new BusinessException(ErrorCode.LOT_PROCESS_NOT_IN_PRODUCT_ROUTE);
        }

        Lot lot = Lot.create(
                lotCode,
                product.getProductCode(),
                product.getProductName(),
                LotStatus.WAIT,
                process.getProcessName(),
                null,
                normalizeOptional(request.tester()),
                request.quantity(),
                null,
                null);
        lot.moveTo(product, process, null);
        return LotSummaryResponse.from(lotRepository.save(lot));
    }

    /** 생산 시작 전 WAIT LOT만 제품 경로와 계획 정보를 다시 선택할 수 있다. */
    @Transactional
    public LotSummaryResponse updateLot(Long lotId, UpdateLotRequest request) {
        Lot lot = lotRepository.findById(lotId)
                .orElseThrow(() -> new BusinessException(ErrorCode.LOT_NOT_FOUND));
        if (lot.getStatus() != LotStatus.WAIT) {
            throw new BusinessException(ErrorCode.LOT_UPDATE_NOT_ALLOWED);
        }

        Product product = productRepository.findById(request.productId())
                .orElseThrow(() -> new BusinessException(ErrorCode.LOT_PRODUCT_NOT_FOUND));
        ProcessDefinition process = processDefinitionRepository.findById(request.processId())
                .orElseThrow(() -> new BusinessException(ErrorCode.LOT_PROCESS_NOT_FOUND));
        if (!productProcessRouteRepository.existsByProductIdAndProcessId(product.getId(), process.getId())) {
            throw new BusinessException(ErrorCode.LOT_PROCESS_NOT_IN_PRODUCT_ROUTE);
        }

        lot.updateWaitingLot(product, process, normalizeOptional(request.tester()), request.quantity());
        return LotSummaryResponse.from(lot);
    }

    /** 생산 이력과 번호 추적을 보존하기 위해 이력이 없는 WAIT LOT만 제거한다. */
    @Transactional
    public void deleteLot(Long lotId) {
        Lot lot = lotRepository.findById(lotId)
                .orElseThrow(() -> new BusinessException(ErrorCode.LOT_NOT_FOUND));
        if (lot.getStatus() != LotStatus.WAIT || lotProcessHistoryRepository.existsByLotId(lotId)) {
            throw new BusinessException(ErrorCode.LOT_DELETE_NOT_ALLOWED);
        }
        lotRepository.delete(lot);
    }

    @Transactional(readOnly = true)
    public LotRegistrationOptionsResponse getRegistrationOptions() {
        return LotRegistrationOptionsResponse.of(productRepository.findAllByOrderByProductCodeAsc());
    }

    @Transactional(readOnly = true)
    public java.util.List<LotRegistrationProcessOptionResponse> getRegistrationProcessOptions(Long productId) {
        if (!productRepository.existsById(productId)) {
            throw new BusinessException(ErrorCode.LOT_PRODUCT_NOT_FOUND);
        }
        return LotRegistrationProcessOptionResponse.from(
                productProcessRouteRepository.findAllByProductIdOrderBySequenceNoAsc(productId));
    }

    private String normalizeOptional(String value) {
        if (value == null || value.isBlank()) return null;
        return value.trim();
    }

    /** 기존 샘플 LOT의 마지막 번호를 이어 받아 연도별 채번을 시작한다. */
    private String nextLotCode() {
        int year = Year.now().getValue();
        LotNumberSequence sequence = lotNumberSequenceRepository.findByYearForUpdate(year)
                .orElseGet(() -> lotNumberSequenceRepository.save(
                        LotNumberSequence.start(year, findLastNumberForYear(year))));
        return "LOT-" + year + "-" + sequence.nextNumber();
    }

    private int findLastNumberForYear(int year) {
        return lotRepository.findAll().stream()
                .map(Lot::getLotCode)
                .map(LOT_NUMBER_PATTERN::matcher)
                .filter(Matcher::matches)
                .filter(matcher -> Integer.parseInt(matcher.group(1)) == year)
                .mapToInt(matcher -> Integer.parseInt(matcher.group(2)))
                .max()
                .orElse(0);
    }
}
