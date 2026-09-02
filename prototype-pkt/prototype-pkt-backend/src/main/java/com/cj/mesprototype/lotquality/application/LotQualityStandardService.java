package com.cj.mesprototype.lotquality.application;

import com.cj.mesprototype.common.exception.BusinessException;
import com.cj.mesprototype.common.exception.ErrorCode;
import com.cj.mesprototype.lot.domain.Product;
import com.cj.mesprototype.lot.infrastructure.ProductRepository;
import com.cj.mesprototype.lotquality.domain.*;
import com.cj.mesprototype.lotquality.infrastructure.LotQualityStandardRepository;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

@Service
@RequiredArgsConstructor
public class LotQualityStandardService {
    private final LotQualityStandardRepository standardRepository;
    private final ProductRepository productRepository;

    @Transactional(readOnly = true)
    public List<StandardResponse> getAll() { return standardRepository.findAllByOrderByProductProductCodeAscStandardNameAscVersionDesc().stream().map(StandardResponse::from).toList(); }
    @Transactional(readOnly = true)
    public StandardResponse getOne(Long id) { return StandardResponse.from(find(id)); }

    @Transactional
    public StandardResponse create(CreateRequest request) {
        Product product = productRepository.findById(request.productId()).orElseThrow(() -> new BusinessException(ErrorCode.PRODUCT_NOT_FOUND));
        if (!product.isActive()) throw new BusinessException(ErrorCode.PRODUCT_INACTIVE);
        int version = request.version() == null ? 1 : request.version();
        if (standardRepository.existsByProductIdAndStandardNameAndVersion(product.getId(), request.standardName().trim(), version)) throw new BusinessException(ErrorCode.VALIDATION_FAILED);
        validateThresholds(request.minimumYieldRate(), request.minimumGoodQuantity());
        LotQualityStandard standard = LotQualityStandard.create(product, request.standardName(), version, request.requiredLotStatus(), request.minimumYieldRate(), request.minimumGoodQuantity(), request.passDisposition(), request.failDisposition(), request.description());
        return StandardResponse.from(standardRepository.save(standard));
    }

    @Transactional
    public StandardResponse update(Long id, UpdateRequest request) {
        LotQualityStandard standard = find(id);
        ensureDraft(standard);
        if (standardRepository.existsByProductIdAndStandardNameAndVersionAndIdNot(standard.getProduct().getId(), request.standardName().trim(), standard.getVersion(), id)) throw new BusinessException(ErrorCode.VALIDATION_FAILED);
        validateThresholds(request.minimumYieldRate(), request.minimumGoodQuantity());
        standard.update(request.standardName(), request.requiredLotStatus(), request.minimumYieldRate(), request.minimumGoodQuantity(), request.passDisposition(), request.failDisposition(), request.description());
        return StandardResponse.from(standard);
    }

    @Transactional public StandardResponse approve(Long id) { LotQualityStandard standard = find(id); ensureDraft(standard); try { standard.approve(); } catch (IllegalStateException e) { throw new BusinessException(ErrorCode.VALIDATION_FAILED); } return StandardResponse.from(standard); }
    @Transactional public void delete(Long id) { LotQualityStandard standard = find(id); ensureDraft(standard); standardRepository.delete(standard); }
    @Transactional public StandardResponse inactivate(Long id) { LotQualityStandard standard = find(id); standard.inactivate(); return StandardResponse.from(standard); }

    private void validateThresholds(BigDecimal yieldRate, Integer goodQuantity) { if (outOfPercentage(yieldRate) || goodQuantity == null || goodQuantity < 0) throw new BusinessException(ErrorCode.VALIDATION_FAILED); }
    private boolean outOfPercentage(BigDecimal value) { return value == null || value.signum() < 0 || value.compareTo(BigDecimal.valueOf(100)) > 0; }
    private LotQualityStandard find(Long id) { return standardRepository.findById(id).orElseThrow(() -> new BusinessException(ErrorCode.VALIDATION_FAILED)); }
    private void ensureDraft(LotQualityStandard standard) { try { standard.ensureDraft(); } catch (IllegalStateException e) { throw new BusinessException(ErrorCode.VALIDATION_FAILED); } }

    public record CreateRequest(@NotNull Long productId, @NotBlank String standardName, @Min(1) Integer version, @NotBlank String requiredLotStatus, @NotNull BigDecimal minimumYieldRate, @NotNull @Min(0) Integer minimumGoodQuantity, @NotBlank String passDisposition, @NotBlank String failDisposition, String description) {}
    public record UpdateRequest(@NotBlank String standardName, @NotBlank String requiredLotStatus, @NotNull BigDecimal minimumYieldRate, @NotNull @Min(0) Integer minimumGoodQuantity, @NotBlank String passDisposition, @NotBlank String failDisposition, String description) {}
    public record StandardResponse(Long id, Long productId, String productCode, String productName, String standardName, int version, LotQualityStandardStatus status, String requiredLotStatus, BigDecimal minimumYieldRate, Integer minimumGoodQuantity, String passDisposition, String failDisposition, String description, Instant approvedAt) { static StandardResponse from(LotQualityStandard value) { return new StandardResponse(value.getId(), value.getProduct().getId(), value.getProduct().getProductCode(), value.getProduct().getProductName(), value.getStandardName(), value.getVersion(), value.getStatus(), value.getRequiredLotStatus(), value.getMinimumYieldRate(), value.getMinimumGoodQuantity(), value.getPassDisposition(), value.getFailDisposition(), value.getDescription(), value.getApprovedAt()); } }
}
