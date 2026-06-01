package com.novelstudio.controller;

import com.novelstudio.dto.AiGenerateRequest;
import com.novelstudio.dto.AiGenerateResponse;
import com.novelstudio.dto.ApiResponse;
import com.novelstudio.service.AiService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * AI 生成接口
 *
 * POST /api/ai/generate     触发 AI 创作（续写/润色/扩写…）
 * GET  /api/ai/models       获取可用模型列表
 */
@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
@Slf4j
public class AiController {

    private final AiService aiService;

    /**
     * 核心接口：AI 生成
     *
     * 请求示例：
     * {
     *   "novelId": 1,
     *   "genre": "玄幻",
     *   "currentText": "林夜站在山巅……",
     *   "action": "续写",
     *   "targetWords": 300,
     *   "modelId": "deepseek/deepseek-chat",
     *   "apiKey": "sk-or-v1-…"
     * }
     */
    @PostMapping("/generate")
    public ResponseEntity<ApiResponse<AiGenerateResponse>> generate(
            @RequestBody AiGenerateRequest req) {

        log.info("AI generate request: novelId={} action={} targetWords={} model={}",
                req.getNovelId(), req.getAction(), req.getTargetWords(), req.getModelId());

        String content = aiService.generate(
                req.getNovelId(),
                req.getGenre(),
                req.getCurrentText(),
                req.getAction(),
                req.getTargetWords(),
                req.getModelId(),
                req.getApiKey()
        );

        int wordCount = content.replaceAll("\\s", "").length();
        AiGenerateResponse resp = new AiGenerateResponse(
                content,
                wordCount,
                req.getModelId(),
                req.getAction()
        );

        return ResponseEntity.ok(ApiResponse.ok(resp));
    }

    /** 返回前端可选的模型列表 */
    @GetMapping("/models")
    public ResponseEntity<ApiResponse<Object>> models() {
        var models = java.util.List.of(
                new ModelInfo("deepseek/deepseek-chat",           "DeepSeek Chat V3",  "中文强", true),
                new ModelInfo("qwen/qwen-2.5-72b-instruct",       "Qwen 2.5 72B",      "小说佳", true),
                new ModelInfo("mistralai/mistral-7b-instruct",    "Mistral 7B",        "稳定",   true),
                new ModelInfo("meta-llama/llama-3.1-8b-instruct", "Llama 3.1 8B",      "英文强", true),
                new ModelInfo("google/gemma-2-9b-it",             "Gemma 2 9B",        "均衡",   true)
        );
        return ResponseEntity.ok(ApiResponse.ok(models));
    }

    record ModelInfo(String id, String label, String tag, boolean free) {}
}
