package com.cj.novabss.dashboard.presentation;

import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
@CrossOrigin(origins = "${app.cors.allowed-origin}")
public class NovaDashboardController {

    @GetMapping
    public ResponseEntity<NovaDashboardResponse> getDashboard() {
        return ResponseEntity.ok(new NovaDashboardResponse(
            List.of(
                new SummaryMetric("운영 중 요금제", "128", "+8", "이번 분기 게시 기준"),
                new SummaryMetric("검토 대기", "14", "-3", "상품·요금제 변경 요청"),
                new SummaryMetric("결합 상품", "37", "+2", "활성 판매 조합"),
                new SummaryMetric("AI 추천 반영", "76%", "+5.4%p", "시뮬레이션 기준")
            ),
            List.of(
                new Activity("요금제", "5G Flex 59", "검토 요청", "10분 전"),
                new Activity("결합상품", "NOVA Family Plus", "조건 변경", "35분 전"),
                new Activity("과금 정책", "6G Slice Starter", "초안 저장", "1시간 전")
            )
        ));
    }

    public record NovaDashboardResponse(List<SummaryMetric> metrics, List<Activity> activities) {}
    public record SummaryMetric(String label, String value, String change, String description) {}
    public record Activity(String category, String title, String status, String updatedAt) {}
}
