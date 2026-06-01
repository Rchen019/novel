package com.novelstudio.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/** AI 生成结果返回体 */
@Data
@AllArgsConstructor
@NoArgsConstructor
public class AiGenerateResponse {
    private String content;      // 生成的正文内容
    private int wordCount;       // 实际字数
    private String model;        // 实际使用的模型
    private String action;       // 执行的操作
}
