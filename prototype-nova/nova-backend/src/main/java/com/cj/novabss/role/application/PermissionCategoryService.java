package com.cj.novabss.role.application;

import com.cj.novabss.role.domain.PermissionCategory;
import com.cj.novabss.role.infrastructure.PermissionCategoryRepository;
import com.cj.novabss.role.presentation.dto.CreatePermissionCategoryRequest;
import com.cj.novabss.role.presentation.dto.UpdatePermissionCategoryRequest;
import java.time.OffsetDateTime;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class PermissionCategoryService {
    private final PermissionCategoryRepository repository;

    public PermissionCategoryService(PermissionCategoryRepository repository) { this.repository = repository; }

    @Transactional(readOnly = true)
    public List<PermissionCategory> findAll() { return repository.findAllByOrderBySortOrderAscCategoryCodeAsc(); }

    @Transactional(readOnly = true)
    public PermissionCategory getById(Long id) { return repository.findById(id).orElseThrow(() -> notFound(id)); }

    @Transactional
    public PermissionCategory create(CreatePermissionCategoryRequest request) {
        String code = request.categoryCode().trim().toUpperCase();
        if (repository.existsByCategoryCode(code)) throw new PermissionCommandException(HttpStatus.CONFLICT, "DUPLICATE_PERMISSION_CATEGORY_CODE", "이미 존재하는 권한 분류 코드입니다.");
        return repository.save(PermissionCategory.create(code, request.name(), request.description(), request.sortOrder(), OffsetDateTime.now()));
    }

    @Transactional
    public PermissionCategory update(Long id, UpdatePermissionCategoryRequest request) {
        PermissionCategory category = getById(id);
        category.changeDetails(request.name(), request.description(), request.sortOrder());
        return category;
    }

    @Transactional
    public PermissionCategory changeEnabled(Long id, boolean enabled) {
        PermissionCategory category = getById(id);
        category.changeEnabled(enabled);
        return category;
    }

    private PermissionCommandException notFound(Long id) { return new PermissionCommandException(HttpStatus.NOT_FOUND, "PERMISSION_CATEGORY_NOT_FOUND", "권한 분류를 찾을 수 없습니다: " + id); }
}
