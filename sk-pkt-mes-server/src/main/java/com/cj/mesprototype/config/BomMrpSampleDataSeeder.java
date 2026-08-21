package com.cj.mesprototype.config;

import com.cj.mesprototype.bom.domain.*;
import com.cj.mesprototype.bom.infrastructure.BomRepository;
import com.cj.mesprototype.bom.infrastructure.InventoryRepository;
import com.cj.mesprototype.bom.infrastructure.ItemRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

@Slf4j
@Component
@Order(6)
@RequiredArgsConstructor
public class BomMrpSampleDataSeeder implements ApplicationRunner {

    private final ItemRepository itemRepository;
    private final BomRepository bomRepository;
    private final InventoryRepository inventoryRepository;

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        Item taskChair = seedItem("ITM-001", "태스크 체어", ItemType.PRODUCT, "EA", "사무용 회전 의자 완제품");
        Item meetingTable = seedItem("ITM-002", "회의 테이블", ItemType.PRODUCT, "EA", "회의실용 테이블 완제품");
        Item seatBoard = seedItem("ITM-003", "성형 합판 좌판", ItemType.MATERIAL, "EA", "의자 좌판용 성형 합판");
        Item backFrame = seedItem("ITM-004", "등판 프레임", ItemType.MATERIAL, "EA", "의자 등판 지지 프레임");
        Item gasLift = seedItem("ITM-005", "가스 리프트", ItemType.MATERIAL, "EA", "의자 높이 조절 부품");
        Item tableTop = seedItem("ITM-006", "라미네이트 상판", ItemType.MATERIAL, "EA", "테이블 상판");
        Item steelLeg = seedItem("ITM-007", "철제 다리 프레임", ItemType.MATERIAL, "EA", "테이블 하부 프레임");
        Item boltSet = seedItem("ITM-008", "볼트 세트", ItemType.MATERIAL, "SET", "가구 조립용 체결 부품");

        seedInventory(seatBoard, "420");
        seedInventory(backFrame, "390");
        seedInventory(gasLift, "360");
        seedInventory(tableTop, "180");
        seedInventory(steelLeg, "220");
        seedInventory(boltSet, "900");

        seedTaskChairBom(taskChair, seatBoard, backFrame, gasLift, boltSet);
        seedMeetingTableBom(meetingTable, tableTop, steelLeg, boltSet);
    }

    private Item seedItem(
            String itemCode,
            String itemName,
            ItemType itemType,
            String unit,
            String description
    ) {
        return itemRepository.findByItemCode(itemCode)
                .orElseGet(() -> {
                    Item item = itemRepository.save(Item.create(
                            itemCode,
                            itemName,
                            itemType,
                            unit,
                            BigDecimal.ZERO,
                            description
                    ));
                    log.info("Seeded sample item: {} ({})", itemCode, itemName);
                    return item;
                });
    }

    private void seedInventory(Item item, String onHandQty) {
        if (inventoryRepository.findByItemId(item.getId()).isPresent()) {
            return;
        }

        inventoryRepository.save(Inventory.create(
                item,
                new BigDecimal(onHandQty),
                BigDecimal.ZERO
        ));
        log.info("Seeded sample inventory: {} {}", item.getItemCode(), onHandQty);
    }

    private void seedTaskChairBom(Item taskChair, Item seatBoard, Item backFrame, Item gasLift, Item boltSet) {
        if (bomRepository.existsByBomCode("BOM-001")) {
            return;
        }

        Bom bom = Bom.create(
                "BOM-001",
                "태스크 체어 표준 BOM",
                taskChair,
                "1.0",
                BomStatus.APPROVED,
                "좌판, 등판, 가스 리프트 조립 기준 BOM"
        );
        bom.addLine(BomLine.create(seatBoard, new BigDecimal("1"), BigDecimal.ZERO, "완제품 1개당 성형 합판 좌판 1EA"));
        bom.addLine(BomLine.create(backFrame, new BigDecimal("1"), BigDecimal.ZERO, "완제품 1개당 등판 프레임 1EA"));
        bom.addLine(BomLine.create(gasLift, new BigDecimal("1"), BigDecimal.ZERO, "완제품 1개당 가스 리프트 1EA"));
        bom.addLine(BomLine.create(boltSet, new BigDecimal("1"), BigDecimal.ZERO, "완제품 1개당 볼트 세트 1SET"));
        bomRepository.save(bom);
        log.info("Seeded sample BOM: BOM-001");
    }

    private void seedMeetingTableBom(Item meetingTable, Item tableTop, Item steelLeg, Item boltSet) {
        if (bomRepository.existsByBomCode("BOM-002")) {
            return;
        }

        Bom bom = Bom.create(
                "BOM-002",
                "회의 테이블 표준 BOM",
                meetingTable,
                "1.0",
                BomStatus.APPROVED,
                "상판, 철제 다리 프레임 조립 기준 BOM"
        );
        bom.addLine(BomLine.create(tableTop, new BigDecimal("1"), BigDecimal.ZERO, "완제품 1개당 라미네이트 상판 1EA"));
        bom.addLine(BomLine.create(steelLeg, new BigDecimal("2"), BigDecimal.ZERO, "완제품 1개당 철제 다리 프레임 2EA"));
        bom.addLine(BomLine.create(boltSet, new BigDecimal("2"), BigDecimal.ZERO, "완제품 1개당 볼트 세트 2SET"));
        bomRepository.save(bom);
        log.info("Seeded sample BOM: BOM-002");
    }
}
