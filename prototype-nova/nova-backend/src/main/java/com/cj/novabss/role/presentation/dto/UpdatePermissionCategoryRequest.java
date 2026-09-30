package com.cj.novabss.role.presentation.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record UpdatePermissionCategoryRequest(
    @NotBlank @Size(max = 100) String name,
    @NotBlank @Size(max = 300) String description,
    int sortOrder
) {}
