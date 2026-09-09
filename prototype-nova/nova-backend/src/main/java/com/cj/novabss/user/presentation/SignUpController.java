package com.cj.novabss.user.presentation;

import com.cj.novabss.user.application.SignUpService;
import com.cj.novabss.user.presentation.dto.SignUpRequest;
import com.cj.novabss.user.presentation.dto.SignUpResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
@CrossOrigin(origins = "${app.cors.allowed-origin}")
public class SignUpController {
    private final SignUpService signUpService;

    public SignUpController(SignUpService signUpService) {
        this.signUpService = signUpService;
    }

    @PostMapping("/signup")
    // 형식 검증은 HTTP 경계에서 끝내고, 가입 규칙과 저장 순서는 Service에 위임한다.
    public ResponseEntity<SignUpResponse> signUp(@Valid @RequestBody SignUpRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(signUpService.signUp(request));
    }
}
