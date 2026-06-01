package com.novelstudio.controller;

import com.novelstudio.dto.ApiResponse;
import com.novelstudio.model.Chapter;
import com.novelstudio.service.ChapterService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * 章节接口
 *
 * GET    /api/novels/{novelId}/chapters          获取章节列表
 * POST   /api/novels/{novelId}/chapters          创建章节
 * GET    /api/chapters/{id}                      获取单章内容
 * PUT    /api/chapters/{id}                      更新章节（标题/排序）
 * PATCH  /api/chapters/{id}/content              仅更新正文（自动保存专用）
 * DELETE /api/chapters/{id}                      删除章节
 */
@RestController
@RequiredArgsConstructor
public class ChapterController {

    private final ChapterService chapterService;

    @GetMapping("/api/novels/{novelId}/chapters")
    public ResponseEntity<ApiResponse<List<Chapter>>> list(@PathVariable Long novelId) {
        return ResponseEntity.ok(ApiResponse.ok(chapterService.findByNovel(novelId)));
    }

    @PostMapping("/api/novels/{novelId}/chapters")
    public ResponseEntity<ApiResponse<Chapter>> create(@PathVariable Long novelId,
                                                       @RequestBody Chapter chapter) {
        return ResponseEntity.ok(ApiResponse.ok("章节创建成功", chapterService.create(novelId, chapter)));
    }

    @GetMapping("/api/chapters/{id}")
    public ResponseEntity<ApiResponse<Chapter>> get(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(chapterService.findById(id)));
    }

    @PutMapping("/api/chapters/{id}")
    public ResponseEntity<ApiResponse<Chapter>> update(@PathVariable Long id,
                                                       @RequestBody Chapter patch) {
        return ResponseEntity.ok(ApiResponse.ok("更新成功", chapterService.update(id, patch)));
    }

    /**
     * 自动保存专用接口 — 仅更新 content 字段
     * 前端每隔 1.5s 调用一次，避免整个对象传输
     */
    @PatchMapping("/api/chapters/{id}/content")
    public ResponseEntity<ApiResponse<Chapter>> saveContent(@PathVariable Long id,
                                                            @RequestBody Map<String, String> body) {
        String content = body.get("content");
        return ResponseEntity.ok(ApiResponse.ok("保存成功", chapterService.updateContent(id, content)));
    }

    @DeleteMapping("/api/chapters/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        chapterService.delete(id);
        return ResponseEntity.ok(ApiResponse.ok("删除成功", null));
    }
}
