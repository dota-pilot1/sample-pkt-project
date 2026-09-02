package com.cj.mesprototype.lot.application;

import com.cj.mesprototype.common.exception.BusinessException;
import com.cj.mesprototype.common.exception.ErrorCode;
import com.cj.mesprototype.lot.domain.Product;
import com.cj.mesprototype.lot.infrastructure.ProductRepository;
import com.cj.mesprototype.lot.presentation.dto.CreateProductRequest;
import com.cj.mesprototype.lot.presentation.dto.ProductResponse;
import com.cj.mesprototype.lot.presentation.dto.UpdateProductRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Locale;

@Service
@RequiredArgsConstructor
public class ProductService {
    private final ProductRepository productRepository;

    @Transactional(readOnly = true)
    public List<ProductResponse> getProducts() {
        return productRepository.findAllByOrderByProductCodeAsc().stream()
                .map(ProductResponse::from)
                .toList();
    }

    @Transactional
    public ProductResponse createProduct(CreateProductRequest request) {
        String productCode = request.productCode().trim().toUpperCase(Locale.ROOT);
        if (productRepository.findByProductCode(productCode).isPresent()) {
            throw new BusinessException(ErrorCode.PRODUCT_CODE_DUPLICATE);
        }
        return ProductResponse.from(productRepository.save(
                Product.create(productCode, request.productName(), request.packageType(), request.classification())));
    }

    @Transactional
    public ProductResponse updateProduct(Long productId, UpdateProductRequest request) {
        Product product = getProduct(productId);
        product.update(request.productName(), request.packageType(), request.classification(), request.active());
        return ProductResponse.from(product);
    }

    private Product getProduct(Long productId) {
        return productRepository.findById(productId)
                .orElseThrow(() -> new BusinessException(ErrorCode.PRODUCT_NOT_FOUND));
    }
}
