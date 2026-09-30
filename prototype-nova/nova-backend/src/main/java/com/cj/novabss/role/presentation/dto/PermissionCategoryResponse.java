package com.cj.novabss.role.presentation.dto;

import com.cj.novabss.role.domain.PermissionCategory;

public record PermissionCategoryResponse(Long id, String categoryCode, String name, String description, int sortOrder, boolean enabled) {
    public static PermissionCategoryResponse from(PermissionCategory category) {
        return new PermissionCategoryResponse(category.getId(), category.getCategoryCode(), category.getName(), category.getDescription(), category.getSortOrder(), category.isEnabled());
    }
}
