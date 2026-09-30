package com.cj.novabss.role.presentation.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record CreatePermissionCategoryRequest(
    @NotBlank @Pattern(regexp = "^[A-Z][A-Z0-9_]{1,49}") String categoryCode,
    @NotBlank @Size(max = 100) String name,
    @NotBlank @Size(max = 300) String description,
    int sortOrder
) {}
