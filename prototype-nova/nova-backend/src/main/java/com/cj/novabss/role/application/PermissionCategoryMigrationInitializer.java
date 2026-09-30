package com.cj.novabss.role.application;

import com.cj.novabss.role.domain.PermissionCategory;
import com.cj.novabss.role.infrastructure.PermissionCategoryRepository;
import com.cj.novabss.role.infrastructure.PermissionRepository;
import java.time.OffsetDateTime;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/** 기존 권한에도 분류를 보장하는 일회성 호환 이관이다. 시드 실행 여부와 무관하게 동작한다. */
@Component
@Order(0)
public class PermissionCategoryMigrationInitializer implements ApplicationRunner {
    private final PermissionCategoryRepository categoryRepository;
    private final PermissionRepository permissionRepository;

    public PermissionCategoryMigrationInitializer(PermissionCategoryRepository categoryRepository, PermissionRepository permissionRepository) {
        this.categoryRepository = categoryRepository;
        this.permissionRepository = permissionRepository;
    }

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        OffsetDateTime now = OffsetDateTime.now();
        PermissionCategory ratePlan = findOrCreate("RATE_PLAN", "요금제 관리", "요금제와 상품 요금 정책을 관리합니다.", 10, now);
        PermissionCategory other = findOrCreate("OTHER", "기타", "아직 분류되지 않은 권한입니다.", 999, now);
        permissionRepository.findAll().stream().filter(permission -> permission.getCategory() == null).forEach(permission ->
            permission.changeCategory(permission.getPermissionCode().startsWith("RATE_PLAN_") ? ratePlan : other)
        );
    }

    private PermissionCategory findOrCreate(String code, String name, String description, int sortOrder, OffsetDateTime now) {
        return categoryRepository.findByCategoryCode(code)
            .orElseGet(() -> categoryRepository.save(PermissionCategory.create(code, name, description, sortOrder, now)));
    }
}
