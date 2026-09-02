package com.cj.mesprototype.packagetest.presentation.dto;

import com.cj.mesprototype.packagetest.domain.TestSpecStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

public record CreateTestSpecRequest(
        @NotNull Long productId,
        @NotBlank @Size(max = 150) String specName,
        @Positive Integer version,
        @NotBlank @Size(max = 50) String testStage,
        TestSpecStatus status
) {}
