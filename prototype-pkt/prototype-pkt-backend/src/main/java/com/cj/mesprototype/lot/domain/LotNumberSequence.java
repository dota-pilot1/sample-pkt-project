package com.cj.mesprototype.lot.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

/** 연도별 LOT 채번의 마지막 순번을 보관해 등록 요청마다 하나씩 증가시킨다. */
@Entity
@Table(name = "lot_number_sequences")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class LotNumberSequence {
    @Id
    @Column(name = "sequence_year")
    private Integer sequenceYear;

    @Column(name = "last_number", nullable = false)
    private Integer lastNumber;

    private LotNumberSequence(int sequenceYear, int lastNumber) {
        this.sequenceYear = sequenceYear;
        this.lastNumber = lastNumber;
    }

    public static LotNumberSequence start(int sequenceYear, int lastNumber) {
        return new LotNumberSequence(sequenceYear, lastNumber);
    }

    public int nextNumber() {
        lastNumber += 1;
        return lastNumber;
    }
}
