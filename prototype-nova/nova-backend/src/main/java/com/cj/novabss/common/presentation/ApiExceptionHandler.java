package com.cj.novabss.common.presentation;

import com.cj.novabss.plan.application.RatePlanCommandException;
import java.util.LinkedHashMap;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class ApiExceptionHandler {
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiErrorResponse> handleValidation(MethodArgumentNotValidException exception) {
        Map<String, String> fieldErrors = new LinkedHashMap<>();
        for (FieldError fieldError : exception.getBindingResult().getFieldErrors()) {
            fieldErrors.putIfAbsent(fieldError.getField(), fieldError.getDefaultMessage());
        }
        return ResponseEntity.badRequest().body(new ApiErrorResponse("INVALID_REQUEST", "요청 값을 확인해 주세요.", fieldErrors));
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ApiErrorResponse> handleUnreadableRequest(HttpMessageNotReadableException exception) {
        return ResponseEntity.badRequest().body(new ApiErrorResponse("INVALID_REQUEST", "요청 형식이 올바르지 않습니다.", Map.of()));
    }

    @ExceptionHandler(RatePlanCommandException.class)
    public ResponseEntity<ApiErrorResponse> handleRatePlanCommand(RatePlanCommandException exception) {
        return ResponseEntity.status(exception.getStatus())
            .body(new ApiErrorResponse(exception.getCode(), exception.getMessage(), Map.of()));
    }
}
