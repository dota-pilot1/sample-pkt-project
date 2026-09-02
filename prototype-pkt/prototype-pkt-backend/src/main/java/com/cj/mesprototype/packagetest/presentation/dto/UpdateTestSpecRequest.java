package com.cj.mesprototype.packagetest.presentation.dto;

import com.cj.mesprototype.packagetest.domain.TestSpecStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record UpdateTestSpecRequest(
        @NotBlank @Size(max = 150) String specName,
        @NotBlank @Size(max = 50) String testStage,
        TestSpecStatus status
) {}
