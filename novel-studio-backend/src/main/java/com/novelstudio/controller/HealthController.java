package com.novelstudio.controller;

import com.novelstudio.dto.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.Map;

/**
 * 根路径 + 健康检查
 * 浏览器访问 http://localhost:8080/ 或 /api/health 时返回服务信息
 */
@RestController
public class HealthController {

    @GetMapping("/")
    public ResponseEntity<ApiResponse<Map<String, Object>>> root() {
        return ResponseEntity.ok(ApiResponse.ok(info()));
    }

    @GetMapping("/api/health")
    public ResponseEntity<ApiResponse<Map<String, Object>>> health() {
        return ResponseEntity.ok(ApiResponse.ok(info()));
    }

    private Map<String, Object> info() {
        return Map.of(
                "app",     "AI Novel Studio",
                "version", "1.0.0",
                "status",  "running",
                "time",    LocalDateTime.now().toString(),
                "apis", Map.of(
                        "novels",       "GET/POST /api/novels",
                        "chapters",     "GET/POST /api/novels/{id}/chapters",
                        "characters",   "GET/POST /api/novels/{id}/characters",
                        "worldSettings","GET/POST /api/novels/{id}/world-settings",
                        "aiGenerate",   "POST /api/ai/generate",
                        "aiModels",     "GET  /api/ai/models"
                )
        );
    }
}
