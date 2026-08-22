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
                new SpaceSeed("FRONTEND", "프론트 플레이북"),
                new SpaceSeed("REACT", "모던 리액트 스킬"),
                new SpaceSeed("UIUX", "Component Recipes"),
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
