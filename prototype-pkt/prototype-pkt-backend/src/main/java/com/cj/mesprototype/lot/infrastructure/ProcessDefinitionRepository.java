package com.cj.mesprototype.lot.infrastructure;

import com.cj.mesprototype.lot.domain.ProcessDefinition;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.List;

public interface ProcessDefinitionRepository extends JpaRepository<ProcessDefinition, Long> {
    Optional<ProcessDefinition> findByProcessCode(String processCode);
    List<ProcessDefinition> findAllByOrderByProcessNameAsc();
}
