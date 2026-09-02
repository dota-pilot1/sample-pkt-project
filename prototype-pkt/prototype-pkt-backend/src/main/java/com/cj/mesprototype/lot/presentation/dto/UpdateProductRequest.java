package com.cj.mesprototype.lot.presentation.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import com.cj.mesprototype.lot.domain.ProductClassification;

public record UpdateProductRequest(
        @NotBlank @Size(max = 200) String productName,
        @Size(max = 50) String packageType,
        ProductClassification classification,
        @NotNull Boolean active
) {
}
