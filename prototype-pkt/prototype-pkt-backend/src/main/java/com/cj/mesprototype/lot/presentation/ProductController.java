package com.cj.mesprototype.lot.presentation;

import com.cj.mesprototype.lot.application.ProductService;
import com.cj.mesprototype.lot.presentation.dto.CreateProductRequest;
import com.cj.mesprototype.lot.presentation.dto.ProductResponse;
import com.cj.mesprototype.lot.presentation.dto.UpdateProductRequest;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
@Tag(name = "Product", description = "P&T 제품 기준정보 관리")
public class ProductController {
    private final ProductService productService;

    @GetMapping
    @Operation(summary = "제품 목록 조회")
    public List<ProductResponse> getProducts() {
        return productService.getProducts();
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "제품 등록")
    public ResponseEntity<ProductResponse> createProduct(@Valid @RequestBody CreateProductRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(productService.createProduct(request));
    }

    @PutMapping("/{productId}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "제품 수정 및 활성 상태 변경")
    public ProductResponse updateProduct(@PathVariable Long productId, @Valid @RequestBody UpdateProductRequest request) {
        return productService.updateProduct(productId, request);
    }
}
