package com.novelstudio.controller;

import com.novelstudio.dto.ApiResponse;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.servlet.resource.NoResourceFoundException;

/**
 * 全局异常处理 — 统一返回格式
 */
@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

    /**
     * 访问不存在的静态资源或路径（例如浏览器直接 GET /）
     * Spring Boot 3.x 抛出 NoResourceFoundException，必须在 RuntimeException 之前拦截，
     * 否则会被当成 500 处理。
     */
    @ExceptionHandler(NoResourceFoundException.class)
    public ResponseEntity<ApiResponse<Void>> handleNoResource(
            NoResourceFoundException e, HttpServletRequest req) {
        log.debug("No resource found: {}", req.getRequestURI());
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(ApiResponse.error("路径不存在：" + req.getRequestURI()
                        + "  ·  所有接口均以 /api/ 开头"));
    }

    @ExceptionHandler(HttpClientErrorException.class)
    public ResponseEntity<ApiResponse<Void>> handleHttpClient(HttpClientErrorException e) {
        log.error("HTTP client error: {} - {}", e.getStatusCode(), e.getResponseBodyAsString());
        String msg = "AI API 调用失败（" + e.getStatusCode() + "）：" + e.getResponseBodyAsString();
        return ResponseEntity.status(HttpStatus.BAD_GATEWAY).body(ApiResponse.error(msg));
    }

    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<ApiResponse<Void>> handleIllegalState(IllegalStateException e) {
        return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
    }

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<ApiResponse<Void>> handleRuntime(RuntimeException e) {
        log.error("Runtime error: {}", e.getMessage());
        return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Void>> handleGeneric(Exception e) {
        log.error("Unexpected error", e);
        return ResponseEntity.internalServerError()
                .body(ApiResponse.error("服务器内部错误：" + e.getMessage()));
    }
}
