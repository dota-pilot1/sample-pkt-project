package com.cj.novabss.user.application;

import static org.assertj.core.api.Assertions.assertThat;

import com.cj.novabss.role.infrastructure.RoleRepository;
import com.cj.novabss.role.infrastructure.UserRoleRepository;
import com.cj.novabss.user.infrastructure.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.DefaultApplicationArguments;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest(properties = "app.seed.enabled=true")
class SecuritySeedDataInitializerTest {
    @Autowired
    private SecuritySeedDataInitializer initializer;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserRoleRepository userRoleRepository;

    @Test
    void createsRoleSpecificUsersAndDoesNotDuplicateThemWhenRunAgain() {
        assertThat(roleRepository.count()).isEqualTo(3);
        assertThat(userRepository.count()).isEqualTo(3);
        assertThat(userRoleRepository.count()).isEqualTo(3);

        initializer.run(new DefaultApplicationArguments());

        assertThat(roleRepository.count()).isEqualTo(3);
        assertThat(userRepository.count()).isEqualTo(3);
        assertThat(userRoleRepository.count()).isEqualTo(3);
        assertThat(roleRepository.findByRoleCode("SYSTEM_ADMIN")).isPresent();
        assertThat(roleRepository.findByRoleCode("PRODUCT_OPERATOR")).isPresent();
        assertThat(roleRepository.findByRoleCode("CUSTOMER")).isPresent();
        assertThat(userRepository.findByLoginId("admin")).isPresent();
        assertThat(userRepository.findByLoginId("operator")).isPresent();
        assertThat(userRepository.findByLoginId("customer")).isPresent();
    }
}
