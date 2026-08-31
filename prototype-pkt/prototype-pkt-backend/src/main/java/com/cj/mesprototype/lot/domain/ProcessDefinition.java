package com.cj.mesprototype.lot.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

/** PKT LOT이 진행하는 공정의 기준 정보다. */
@Entity
@Table(name = "processes")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class ProcessDefinition {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "process_code", nullable = false, unique = true, length = 100)
    private String processCode;

    @Column(name = "process_name", nullable = false, length = 100)
    private String processName;

    private ProcessDefinition(String processCode, String processName) {
        this.processCode = processCode;
        this.processName = processName;
    }

    public static ProcessDefinition of(String processCode, String processName) {
        return new ProcessDefinition(processCode, processName);
    }
}
