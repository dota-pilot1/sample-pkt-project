package com.cj.novabss.role.infrastructure;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatIllegalArgumentException;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.cj.novabss.role.domain.Permission;
import java.time.OffsetDateTime;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.dao.DataIntegrityViolationException;

/** H2 인메모리 DB에서 Permission의 영속 규칙과 permissionCode 유일성을 검증한다. */
@SpringBootTest
class PermissionRepositoryTest {
    @Autowired
    private PermissionRepository permissionRepository;

    @BeforeEach
    void setUp() {
        permissionRepository.deleteAll();
    }

    @Test
    void savesPermissionWithCodeNameDescriptionAndCreationTime() {
        OffsetDateTime createdAt = OffsetDateTime.parse("2026-09-09T10:00:00+09:00");

        Permission permission = permissionRepository.saveAndFlush(
            Permission.create("PLAN_READ", "요금제 조회", "요금제 목록과 상세를 조회한다.", createdAt)
        );

        Permission found = permissionRepository.findByPermissionCode("PLAN_READ").orElseThrow();
        assertThat(found.getId()).isEqualTo(permission.getId());
        assertThat(found.getName()).isEqualTo("요금제 조회");
        assertThat(found.getDescription()).isEqualTo("요금제 목록과 상세를 조회한다.");
        assertThat(found.getCreatedAt()).isEqualTo(createdAt);
    }

    @Test
    void rejectsBlankRequiredFieldsBeforePersistence() {
        assertThatIllegalArgumentException()
            .isThrownBy(() -> Permission.create(" ", "요금제 조회", "요금제 목록을 조회한다.", OffsetDateTime.now()))
            .withMessage("permissionCode은(는) 필수입니다.");

        assertThatIllegalArgumentException()
            .isThrownBy(() -> Permission.create("PLAN_READ", "", "요금제 목록을 조회한다.", OffsetDateTime.now()))
            .withMessage("name은(는) 필수입니다.");
    }

    @Test
    void rejectsDuplicatePermissionCodeAtDatabaseConstraint() {
        permissionRepository.saveAndFlush(
            Permission.create("PLAN_READ", "요금제 조회", "요금제 목록을 조회한다.", OffsetDateTime.now())
        );

        assertThatThrownBy(() -> permissionRepository.saveAndFlush(
            Permission.create("PLAN_READ", "다른 이름", "중복 코드는 저장할 수 없다.", OffsetDateTime.now())
        )).isInstanceOf(DataIntegrityViolationException.class);
    }
}
