package com.cj.mesprototype.equipment.domain;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Entity
@Table(name = "equipment_status_histories")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class EquipmentStatusHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "equipment_id", nullable = false)
    private Equipment equipment;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private EquipmentStatus status;

    @Column(length = 500)
    private String reason;

    @Column(name = "changed_at", nullable = false)
    private Instant changedAt;

    public static EquipmentStatusHistory create(Equipment equipment, EquipmentStatus status, String reason, Instant changedAt) {
        EquipmentStatusHistory history = new EquipmentStatusHistory();
        history.equipment = equipment;
        history.status = status;
        history.reason = reason;
        history.changedAt = changedAt;
        return history;
    }
}
