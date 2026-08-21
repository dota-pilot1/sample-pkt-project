package com.cj.mesprototype.kiosk.presentation;

import com.cj.mesprototype.auth.security.UserPrincipal;
import com.cj.mesprototype.kiosk.application.KioskAnalyticsService;
import com.cj.mesprototype.kiosk.application.KioskHandoffService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/** 직원 콘솔용 키오스크 운영 API. /api/kiosk/manage 는 permitAll 목록에 없어 JWT 인증이 필요하다. */
@RestController
@RequestMapping("/api/kiosk/manage")
@RequiredArgsConstructor
public class KioskManageController {

    private final KioskHandoffService handoffs;
    private final KioskAnalyticsService analytics;

    @GetMapping("/analytics/summary")
    public KioskAnalyticsService.Summary summary() {
        return analytics.summary();
    }

    @GetMapping("/handoffs")
    public List<KioskHandoffService.Response> list(@RequestParam(defaultValue = "false") boolean completed) {
        return handoffs.list(completed);
    }

    @PatchMapping("/handoffs/{id}/accept")
    public KioskHandoffService.Response accept(@PathVariable Long id, @AuthenticationPrincipal UserPrincipal principal) {
        return handoffs.accept(id, principal.getId());
    }

    @PatchMapping("/handoffs/{id}/complete")
    public KioskHandoffService.Response complete(@PathVariable Long id) {
        return handoffs.complete(id);
    }
}
