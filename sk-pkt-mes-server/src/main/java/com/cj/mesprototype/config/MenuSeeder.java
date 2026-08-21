package com.cj.mesprototype.config;

import com.cj.mesprototype.menu.domain.Menu;
import com.cj.mesprototype.menu.infrastructure.MenuRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Set;

@Slf4j
@Component
@Order(4)
@RequiredArgsConstructor
public class MenuSeeder implements ApplicationRunner {

    private final MenuRepository menuRepository;

    private record MenuDef(
            String code, String parentCode, String label, String labelKey,
            String path, String icon, String requiredRole, int displayOrder
    ) {}

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        List<MenuDef> defs = List.of(
                new MenuDef("DASHBOARD", null, "메인", "nav.main", "/main", "LayoutDashboard", null, 0),

                new MenuDef("MASTER_DATA", null, "기준정보", "nav.masterData", null, "Database", null, 1),
                new MenuDef("BOM_MRP_ITEMS", "MASTER_DATA", "품목 관리", "nav.itemManagement", "/bom-mrp/items", "Package", null, 0),
                new MenuDef("BOM_MRP_INVENTORIES", "MASTER_DATA", "재고 관리", "nav.inventoryManagement", "/bom-mrp/inventories", "Boxes", null, 1),
                new MenuDef("BOM_MRP_BOMS", "MASTER_DATA", "BOM 관리", "nav.bomManagement", "/bom-mrp/boms", "Layers3", null, 2),

                new MenuDef("PLANNING", null, "계획", "nav.planning", null, "CalendarClock", null, 2),
                new MenuDef("MRP_CALCULATE", "PLANNING", "MRP 계산", "nav.mrpCalculate", "/bom-mrp/calculate", "Calculator", null, 0),
                new MenuDef("PRODUCTION_PLAN_BASIC", "PLANNING", "생산계획", "nav.productionPlan", "/production-plans", "CalendarClock", null, 1),

                new MenuDef("EXECUTION", null, "실행", "nav.execution", null, "ClipboardList", null, 3),
                new MenuDef("WORK_ORDER_PAGE", "EXECUTION", "작업지시", "nav.workOrder", "/work-orders", "ClipboardList", null, 0),
                new MenuDef("WORK_ORDER_WBS", "EXECUTION", "작업지시 WBS", "nav.workOrderWbs", "/work-orders/wbs", "ChartGantt", null, 1),
                new MenuDef("EQUIPMENT_RESERVATION_PAGE", "EXECUTION", "설비 예약", "nav.equipmentReservation", "/equipment-reservations", "Settings", null, 2),

                new MenuDef("ANALYSIS", null, "분석", "nav.analysis", null, "BarChart3", null, 4),
                new MenuDef("MONITORING_PAGE", "ANALYSIS", "모니터링", "nav.monitoring", "/monitoring", "BarChart3", null, 0),

                new MenuDef("LEARNING", null, "학습자료", "nav.learning", null, "BookOpen", null, 5),
                new MenuDef("BOM_MRP_ERD", "LEARNING", "BOM/MRP ERD", "nav.erd", "/bom-mrp/erd", "Database", null, 0),
                new MenuDef("PRODUCTION_PLAN_ERD", "LEARNING", "생산계획 ERD", "nav.productionPlanErd", "/production-plans/erd", "Database", null, 1),
                new MenuDef("PRODUCTION_PLAN_MANUAL", "LEARNING", "생산계획 매뉴얼", "nav.productionPlanManual", "/production-plans/manual", "BookOpen", null, 2),
                new MenuDef("WORK_ORDER_REVIEW", "LEARNING", "작업지시 리뷰", "nav.codeReview", "/work-orders/review", "ShieldCheck", null, 3),
                new MenuDef("EQUIPMENT_RESERVATION_REVIEW", "LEARNING", "설비예약 리뷰", "nav.codeReview", "/equipment-reservations/review", "ShieldCheck", null, 4),
                new MenuDef("MONITORING_REVIEW", "LEARNING", "모니터링 리뷰", "nav.codeReview", "/monitoring/review", "ShieldCheck", null, 5),

                new MenuDef("ADMIN", null, "시스템 관리", "nav.systemManagement", null, "Settings", RoleSeeder.ROLE_ADMIN, 6),
                new MenuDef("ADMIN_USERS", "ADMIN", "사용자 관리", "nav.users", "/users", "Users", RoleSeeder.ROLE_ADMIN, 0),
                new MenuDef("ADMIN_ROLES", "ADMIN", "역할 관리", "nav.roleManagement", "/roles", "BadgeCheck", RoleSeeder.ROLE_ADMIN, 1),
                new MenuDef("ADMIN_PERMISSIONS", "ADMIN", "권한 관리", "nav.permissions", "/permissions", "ShieldCheck", RoleSeeder.ROLE_ADMIN, 2),
                new MenuDef("ADMIN_ROLE_PERMISSIONS", "ADMIN", "역할-권한 매핑", "nav.rolePermissions", "/role-permissions", "ShieldCheck", RoleSeeder.ROLE_ADMIN, 3),
                new MenuDef("ADMIN_SITE_SETTINGS", "ADMIN", "사이트 설정", "nav.siteSettings", "/site-settings", "LayoutDashboard", RoleSeeder.ROLE_ADMIN, 4),
                new MenuDef("ADMIN_MENU_MANAGEMENT", "ADMIN", "메뉴 관리", "nav.menuManagement", "/menu-management", "Menu", RoleSeeder.ROLE_ADMIN, 5)
        );
        Set<String> visibleCodes = defs.stream().map(MenuDef::code).collect(java.util.stream.Collectors.toSet());

        menuRepository.findAll().forEach(menu -> {
            if (!visibleCodes.contains(menu.getCode()) && menu.isVisible()) {
                menu.update(
                        menu.getParent(),
                        menu.getLabel(),
                        menu.getLabelKey(),
                        menu.getPath(),
                        menu.getIcon(),
                        menu.isExternal(),
                        menu.getRequiredRole(),
                        menu.getRequiredPermission(),
                        false,
                        menu.getDisplayOrder()
                );
            }
        });

        for (MenuDef def : defs) {
            Menu parent = def.parentCode() != null
                    ? menuRepository.findByCode(def.parentCode()).orElse(null)
                    : null;
            menuRepository.findByCode(def.code())
                    .ifPresentOrElse(
                            menu -> menu.update(
                                    parent,
                                    def.label(),
                                    def.labelKey(),
                                    def.path(),
                                    def.icon(),
                                    false,
                                    def.requiredRole(),
                                    null,
                                    true,
                                    def.displayOrder()
                            ),
                            () -> {
                                menuRepository.save(Menu.create(
                                        def.code(), parent, def.label(), def.labelKey(),
                                        def.path(), def.icon(), false,
                                        def.requiredRole(), null, true, def.displayOrder()
                                ));
                                log.info("Seeded menu: {}", def.code());
                            }
                    );
        }
    }
}
