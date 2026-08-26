package com.cj.mesprototype.equipment.domain;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.Instant;

@Entity
@Table(name = "equipments", uniqueConstraints = @UniqueConstraint(columnNames = "code"))
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Equipment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100, unique = true)
    private String code;

    @Column(nullable = false, length = 200)
    private String name;

    @Column(name = "process_name", nullable = false, length = 100)
    private String processName;

    @Column(nullable = false, length = 100)
    private String location;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private EquipmentStatus status;

    @Column(name = "current_lot_number", length = 100)
    private String currentLotNumber;

    @Column(name = "status_changed_at", nullable = false)
    private Instant statusChangedAt;

    @Column(name = "status_reason", length = 500)
    private String statusReason;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    public static Equipment create(
            String code,
            String name,
            String processName,
            String location,
            EquipmentStatus status,
            String currentLotNumber,
            Instant statusChangedAt,
            String statusReason) {
        Equipment equipment = new Equipment();
        equipment.code = code;
        equipment.name = name;
        equipment.processName = processName;
        equipment.location = location;
        equipment.status = status == null ? EquipmentStatus.IDLE : status;
        equipment.currentLotNumber = currentLotNumber;
        equipment.statusChangedAt = statusChangedAt == null ? Instant.now() : statusChangedAt;
        equipment.statusReason = statusReason;
        return equipment;
    }

    public void changeStatus(EquipmentStatus nextStatus, String reason) {
        this.status = nextStatus;
        this.statusChangedAt = Instant.now();
        this.statusReason = reason;
        if (nextStatus != EquipmentStatus.RUNNING) {
            this.currentLotNumber = null;
        }
    }
}
