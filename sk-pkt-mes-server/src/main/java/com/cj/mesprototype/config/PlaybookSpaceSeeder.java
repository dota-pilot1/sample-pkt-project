package com.cj.mesprototype.config;

import com.cj.mesprototype.playbook.domain.PlaybookSpace;
import com.cj.mesprototype.playbook.infrastructure.PlaybookSpaceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Component
@Order(10)
@RequiredArgsConstructor
public class PlaybookSpaceSeeder implements ApplicationRunner {
    private final PlaybookSpaceRepository repository;

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        List.of(
                new SpaceSeed("BACKEND", "백엔드 플레이북"),
                new SpaceSeed("SPRING_BOOT", "Spring Boot 플레이북"),
                new SpaceSeed("FRONTEND", "프론트 플레이북"),
                new SpaceSeed("REACT", "모던 리액트 스킬"),
                new SpaceSeed("UIUX", "공통 컴포넌트"),
                new SpaceSeed("UI_NAV", "메뉴 & 네비게이션"),
                new SpaceSeed("UI_FORM", "폼 & 유효성 검사"),
                new SpaceSeed("UI_LAYOUT", "레이아웃 & 페이지 구성"),
                new SpaceSeed("UI_STATE", "인터랙션 & 상태 표현"),
                new SpaceSeed("DB", "DB 플레이북"),
                new SpaceSeed("AX", "AX 플레이북"),
                new SpaceSeed("TDD", "TDD 플레이북"),
                new SpaceSeed("RAG", "RAG 플레이북"),
                new SpaceSeed("SECURITY", "보안 플레이북"),
                new SpaceSeed("DEVOPS", "DevOps 플레이북"),
                new SpaceSeed("PKT_FRONT_LEV1", "PKT Front Lev1")
        ).forEach(seed -> repository.findByCode(seed.code())
                .orElseGet(() -> repository.save(PlaybookSpace.of(seed.code(), seed.name()))));
    }

    private record SpaceSeed(String code, String name) {}
}
