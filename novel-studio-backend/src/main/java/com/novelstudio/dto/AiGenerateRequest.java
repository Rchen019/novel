package com.novelstudio.dto;

import lombok.Data;

/** 前端发送给 /api/ai/generate 的请求体 */
@Data
public class AiGenerateRequest {

    /** 当前小说 ID，用于 MemoryManager 注入上下文 */
    private Long novelId;

    /** 小说类型（玄幻/都市/历史…） */
    private String genre;

    /** 编辑器当前正文 */
    private String currentText;

    /** AI 操作：续写/润色/扩写/缩写/改写/对话优化 */
    private String action;

    /** 目标字数，默认 300 */
    private int targetWords = 300;

    /** OpenRouter model string，默认 deepseek/deepseek-chat */
    private String modelId;

    /** 前端临时传入的 API Key（可选，覆盖配置文件） */
    private String apiKey;
}
