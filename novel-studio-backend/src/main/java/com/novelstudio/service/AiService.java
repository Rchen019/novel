package com.novelstudio.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

/**
 * AiService — 负责与 OpenRouter 通信
 *
 * 支持模型：
 *   deepseek/deepseek-chat          中文写作最强
 *   qwen/qwen-2.5-72b-instruct      小说能力优秀
 *   mistralai/mistral-7b-instruct   稳定均衡
 *   meta-llama/llama-3.1-8b-instruct 英文强
 *   google/gemma-2-9b-it            均衡免费
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class AiService {

    @Value("${openrouter.api.url}")
    private String apiUrl;

    @Value("${openrouter.api.key}")
    private String apiKey;

    @Value("${openrouter.http-referer}")
    private String httpReferer;

    @Value("${openrouter.app-title}")
    private String appTitle;

    private final ObjectMapper objectMapper;
    private final MemoryManager memoryManager;

    /**
     * 核心调用方法
     *
     * @param novelId     小说 ID（用于 MemoryManager 注入上下文）
     * @param genre       小说类型
     * @param currentText 编辑器当前内容
     * @param action      AI 操作
     * @param targetWords 目标字数
     * @param modelId     OpenRouter model string
     * @param apiKeyOverride 前端传入的临时 Key（可覆盖配置文件）
     */
    public String generate(Long novelId, String genre, String currentText,
                           String action, int targetWords,
                           String modelId, String apiKeyOverride) {

        // 1. 用 MemoryManager 构建 Prompt
        String prompt = memoryManager.buildPrompt(novelId, genre, currentText, action, targetWords);

        // 2. 选择使用的 API Key
        String effectiveKey = (apiKeyOverride != null && !apiKeyOverride.isBlank())
                ? apiKeyOverride : apiKey;

        if (effectiveKey == null || effectiveKey.isBlank()) {
            throw new IllegalStateException("OpenRouter API Key 未配置，请在 application.properties 或请求中提供");
        }

        // 3. 构建请求体
        ObjectNode requestBody = objectMapper.createObjectNode();
        requestBody.put("model", modelId != null ? modelId : "deepseek/deepseek-chat");
        requestBody.put("max_tokens", Math.max(800, targetWords * 3));
        requestBody.put("temperature", 0.85);

        ArrayNode messages = requestBody.putArray("messages");
        ObjectNode userMsg = messages.addObject();
        userMsg.put("role", "user");
        userMsg.put("content", prompt);

        // 4. 发送 HTTP 请求
        RestTemplate restTemplate = new RestTemplate();
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(effectiveKey);
        headers.set("HTTP-Referer", httpReferer);
        headers.set("X-Title", appTitle);

        HttpEntity<String> entity;
        try {
            entity = new HttpEntity<>(objectMapper.writeValueAsString(requestBody), headers);
        } catch (Exception e) {
            throw new RuntimeException("序列化请求体失败", e);
        }

        log.info("Calling OpenRouter model={} targetWords={}", modelId, targetWords);

        ResponseEntity<String> response = restTemplate.exchange(
                apiUrl, HttpMethod.POST, entity, String.class);

        // 5. 解析响应
        return parseResponse(response.getBody());
    }

    private String parseResponse(String responseBody) {
        try {
            JsonNode root = objectMapper.readTree(responseBody);

            // 检查错误
            if (root.has("error")) {
                String errMsg = root.path("error").path("message").asText("Unknown error");
                log.error("OpenRouter API error: {}", errMsg);
                throw new RuntimeException("AI 服务错误：" + errMsg);
            }

            String content = root
                    .path("choices")
                    .path(0)
                    .path("message")
                    .path("content")
                    .asText("");

            if (content.isBlank()) {
                throw new RuntimeException("AI 返回内容为空");
            }

            log.debug("Generated {} chars", content.length());
            return content.trim();

        } catch (RuntimeException e) {
            throw e;
        } catch (Exception e) {
            throw new RuntimeException("解析 AI 响应失败：" + e.getMessage(), e);
        }
    }
}
