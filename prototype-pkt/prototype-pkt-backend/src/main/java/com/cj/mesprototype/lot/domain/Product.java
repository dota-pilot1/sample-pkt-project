package com.cj.mesprototype.lot.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

/** LOT 흐름에서만 사용하는 제품 마스터. BOM/MRP의 items와 책임을 분리한다. */
@Entity
@Table(name = "products")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Product {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(name = "product_code", nullable = false, unique = true, length = 100)
    private String productCode;
    @Column(name = "product_name", nullable = false, length = 200)
    private String productName;

    private Product(String productCode, String productName) { this.productCode = productCode; this.productName = productName; }
    public static Product of(String productCode, String productName) { return new Product(productCode, productName); }
}
