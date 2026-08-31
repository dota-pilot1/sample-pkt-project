package com.cj.mesprototype.lot.presentation.dto;

import com.cj.mesprototype.lot.domain.Product;

import java.util.List;

/** LOT 등록 폼이 제품·공정을 자유 입력하지 않도록 마스터 선택지를 제공한다. */
public record LotRegistrationOptionsResponse(
        List<ProductOption> products
) {
    public static LotRegistrationOptionsResponse of(List<Product> products) {
        return new LotRegistrationOptionsResponse(
                products.stream().map(ProductOption::from).toList());
    }

    public record ProductOption(Long id, String productCode, String productName) {
        private static ProductOption from(Product product) {
            return new ProductOption(product.getId(), product.getProductCode(), product.getProductName());
        }
    }
}
