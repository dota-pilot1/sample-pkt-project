package com.cj.mesprototype.hospital_playbook.presentation;

import com.cj.mesprototype.playbook.application.PlaybookService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** 공유 토큰을 가진 사람만 읽을 수 있는 로그인 없는 개발노트 API. */
@RestController
@RequestMapping("/api/public/hospital-playbook")
@RequiredArgsConstructor
public class PublicPlaybookController {

    private final PlaybookService service;

    @GetMapping("/documents/{token}")
    public PlaybookService.PublicDocumentResponse document(@PathVariable String token) {
        return service.publicDocument(token);
    }
}
