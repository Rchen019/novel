package com.novelstudio.service;

import com.novelstudio.model.Character;
import com.novelstudio.model.*;
import com.novelstudio.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

/**
 * MemoryManager — 项目灵魂
 *
 * 负责将小说的「角色设定 + 世界观 + 最近剧情 + 当前内容」
 * 拼装成结构化 Prompt，送入 AI 模型。
 *
 * 解决的核心问题：
 *  - AI 遗忘角色人设
 *  - 世界观前后矛盾
 *  - 长篇章节无法持续创作
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class MemoryManager {

    private final CharacterRepository characterRepo;
    private final WorldSettingRepository worldSettingRepo;
    private final ChapterRepository chapterRepo;

    @Value("${memory.recent-chapters:2}")
    private int recentChaptersCount;

    /**
     * 构建完整 Prompt
     *
     * @param novelId      当前小说 ID
     * @param genre        小说类型（玄幻/都市…）
     * @param currentText  编辑器当前正文
     * @param action       AI 操作（续写/润色/扩写…）
     * @param targetWords  目标字数
     */
    public String buildPrompt(Long novelId, String genre, String currentText,
                              String action, int targetWords) {

        String charSection   = buildCharacterSection(novelId);
        String worldSection  = buildWorldSection(novelId);
        String recentSection = buildRecentSection(novelId);
        String actionDesc    = resolveActionDesc(action);

        String prompt = """
                你是顶级%s网文作家，熟悉行文节奏与读者口味。

                ═══ 【世界观设定】═══
                %s

                ═══ 【角色信息】═══
                %s

                ═══ 【最近章节参考（勿重复）】═══
                %s

                ═══ 【当前正文】═══
                %s

                ═══ 【创作指令】═══
                请对上述内容执行「%s」操作（%s）。
                要求：
                1. 严格保持角色性格与口吻一致，不得人设崩坏
                2. 遵循世界观规则，不得自相矛盾
                3. 输出约 %d 字，不含任何标注说明
                4. 直接输出正文内容，勿添加"好的""以下是"等开场白
                5. 使用第三人称叙事，符合%s写作风格
                """.formatted(
                genre, worldSection, charSection, recentSection,
                currentText == null ? "（空白）" : currentText,
                action, actionDesc, targetWords, genre
        );

        log.debug("Built prompt for novel={} action={} targetWords={}", novelId, action, targetWords);
        return prompt;
    }

    // ─── Private builders ────────────────────────────────────────────────────

    private String buildCharacterSection(Long novelId) {
        List<Character> chars = characterRepo.findByNovelId(novelId);
        if (chars.isEmpty()) return "（暂无角色设定）";

        return chars.stream().map(c -> """
                【%s】
                  性格：%s
                  背景：%s
                  口吻：%s
                  能力：%s
                """.formatted(
                c.getName(),
                nullSafe(c.getPersonality()),
                nullSafe(c.getBackground()),
                nullSafe(c.getSpeechStyle()),
                nullSafe(c.getAbility())
        )).collect(Collectors.joining("\n"));
    }

    private String buildWorldSection(Long novelId) {
        List<WorldSetting> settings = worldSettingRepo.findByNovelId(novelId);
        if (settings.isEmpty()) return "（暂无世界观设定）";

        return settings.stream()
                .collect(Collectors.groupingBy(WorldSetting::getCategory))
                .entrySet().stream()
                .map(entry -> {
                    String cat = entry.getKey();
                    String items = entry.getValue().stream()
                            .map(w -> "  ◆ " + w.getTitle() + "：" + w.getContent())
                            .collect(Collectors.joining("\n"));
                    return "【" + cat + "】\n" + items;
                })
                .collect(Collectors.joining("\n\n"));
    }

    private String buildRecentSection(Long novelId) {
        List<Chapter> recent = chapterRepo.findRecentChapters(novelId, recentChaptersCount);
        if (recent.isEmpty()) return "（暂无章节内容）";

        // 倒序拿到的，翻转为正序
        java.util.Collections.reverse(recent);

        return recent.stream()
                .map(c -> "《" + c.getTitle() + "》\n" + truncate(c.getContent(), 600))
                .collect(Collectors.joining("\n\n---\n\n"));
    }

    private String resolveActionDesc(String action) {
        return switch (action) {
            case "续写"    -> "从当前位置继续推进剧情";
            case "润色"    -> "提升文笔，优化表达，保持原意";
            case "扩写"    -> "丰富细节，增加场景描写与内心独白";
            case "缩写"    -> "精简内容，删除冗余，突出核心情节";
            case "改写"    -> "换一种表达方式，改变句式结构";
            case "对话优化" -> "优化人物对白节奏，使对话更自然生动";
            default       -> action;
        };
    }

    private String nullSafe(String s) {
        return s == null ? "未设定" : s;
    }

    private String truncate(String s, int maxLen) {
        if (s == null) return "";
        return s.length() <= maxLen ? s : s.substring(0, maxLen) + "…";
    }
}
