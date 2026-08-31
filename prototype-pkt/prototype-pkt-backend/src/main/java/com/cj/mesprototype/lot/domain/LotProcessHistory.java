package com.cj.mesprototype.lot.domain;

import com.cj.mesprototype.equipment.domain.Equipment;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.Instant;

/** LOT이 실제로 공정을 시작·완료한 이력. lots의 현재 상태와 구분해 과거를 보존한다. */
@Entity
@Table(name = "lot_process_histories")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class LotProcessHistory {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "lot_id", nullable = false)
    private Lot lot;

    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "process_id", nullable = false)
    private ProcessDefinition process;

    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "equipment_id")
    private Equipment equipment;

    @Column(name = "input_quantity", nullable = false)
    private int inputQuantity;
    @Column(name = "good_quantity") private Integer goodQuantity;
    @Column(name = "defect_quantity") private Integer defectQuantity;
    @Column(nullable = false, length = 30) private String status;
    @Column(name = "started_at", nullable = false) private Instant startedAt;
    @Column(name = "completed_at") private Instant completedAt;

    private LotProcessHistory(Lot lot, ProcessDefinition process, Equipment equipment, int inputQuantity) {
        this.lot = lot;
        this.process = process;
        this.equipment = equipment;
        this.inputQuantity = inputQuantity;
        this.status = "IN_PROGRESS";
        this.startedAt = Instant.now();
    }

    public static LotProcessHistory start(Lot lot, ProcessDefinition process, Equipment equipment, int inputQuantity) {
        return new LotProcessHistory(lot, process, equipment, inputQuantity);
    }

    public void complete(int goodQuantity, int defectQuantity) {
        this.goodQuantity = goodQuantity;
        this.defectQuantity = defectQuantity;
        this.status = "COMPLETED";
        this.completedAt = Instant.now();
    }
}
