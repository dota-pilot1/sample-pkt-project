package com.cj.mesprototype.playbook.infrastructure;

import com.cj.mesprototype.playbook.domain.PlaybookSpace;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PlaybookSpaceRepository extends JpaRepository<PlaybookSpace, Long> {
    Optional<PlaybookSpace> findByCode(String code);
}
