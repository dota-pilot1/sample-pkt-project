package com.cj.mesprototype.config;

import com.cj.mesprototype.menu.domain.Menu;
import com.cj.mesprototype.menu.infrastructure.MenuRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/** P&T 애플리케이션 헤더가 조회하는 메뉴 트리를 DB 기준정보로 유지한다. */
@Component
@Order(5)
@RequiredArgsConstructor
public class PackageTestMenuSeeder implements ApplicationRunner {
    private final MenuRepository menuRepository;

    private record MenuDef(String code, String parentCode, String label, String path, String icon, int displayOrder) {}

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        List<MenuDef> menus = List.of(
                new MenuDef("PT_PRODUCTION", null, "생산 실행", null, "ClipboardList", 0),
                new MenuDef("PT_WORK_ORDERS", "PT_PRODUCTION", "작업 지시", "/work-orders", "ClipboardList", 0),
                new MenuDef("PT_LOTS", "PT_PRODUCTION", "LOT 관리", "/lots", "PackageSearch", 1),
                new MenuDef("PT_LOT_QUALITY_STANDARDS", "PT_PRODUCTION", "LOT 품질 기준", "/quality-standards", "ClipboardCheck", 2),
                new MenuDef("PT_TEST", null, "테스트", null, "FlaskConical", 1),
                new MenuDef("PT_TEST_SPECS", "PT_TEST", "Test Spec", "/test-specs", "FileSliders", 0),
                new MenuDef("PT_TEST_RUNS", "PT_TEST", "Test 실행", "/test-runs", "FlaskConical", 1),
                new MenuDef("PT_TEST_RESULTS", "PT_TEST", "Test Result", "/test-results", "ClipboardCheck", 2),
                new MenuDef("PT_TEST_HISTORY", "PT_TEST", "불량 / 판정 이력", "/test-history", "History", 3),
                new MenuDef("PT_MASTER", null, "기준 정보", null, "Database", 2),
                new MenuDef("PT_PRODUCTS", "PT_MASTER", "제품", "/products", "Boxes", 0),
                new MenuDef("PT_PROCESSES", "PT_MASTER", "공정", "/processes", "Workflow", 1),
                new MenuDef("PT_EQUIPMENT", "PT_MASTER", "설비", "/equipment", "Settings", 2)
        );

        for (MenuDef definition : menus) {
            Menu parent = definition.parentCode() == null ? null
                    : menuRepository.findByCode(definition.parentCode()).orElseThrow();
            menuRepository.findByCode(definition.code()).ifPresentOrElse(
                    menu -> menu.update(parent, definition.label(), "pnt." + definition.code().toLowerCase(),
                            definition.path(), definition.icon(), false, null, null, true, definition.displayOrder()),
                    () -> menuRepository.save(Menu.create(definition.code(), parent, definition.label(),
                            "pnt." + definition.code().toLowerCase(), definition.path(), definition.icon(),
                            false, null, null, true, definition.displayOrder()))
            );
        }

        // 장비 측정 스펙 화면은 보존하되, 현재 프로토타입 흐름에서는 LOT 품질 기준을 사용한다.
        menuRepository.findByCode("PT_TEST").ifPresent(menu -> menu.update(
                menu.getParent(), menu.getLabel(), menu.getLabelKey(), menu.getPath(), menu.getIcon(),
                menu.isExternal(), menu.getRequiredRole(), menu.getRequiredPermission(), false, menu.getDisplayOrder()
        ));
    }
}
