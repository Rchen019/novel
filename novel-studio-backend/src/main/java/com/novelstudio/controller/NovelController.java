package com.novelstudio.controller;

import com.novelstudio.dto.ApiResponse;
import com.novelstudio.model.Novel;
import com.novelstudio.service.NovelService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 小说管理接口
 *
 * GET    /api/novels            获取全部小说列表
 * POST   /api/novels            创建新小说
 * GET    /api/novels/{id}       获取单本小说（含章节/角色/世界观）
 * PUT    /api/novels/{id}       更新小说基本信息
 * DELETE /api/novels/{id}       删除小说（级联删除所有章节/角色/世界观）
 */
@RestController
@RequestMapping("/api/novels")
@RequiredArgsConstructor
public class NovelController {

    private final NovelService novelService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<Novel>>> list() {
        return ResponseEntity.ok(ApiResponse.ok(novelService.findAll()));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Novel>> create(@RequestBody Novel novel) {
        return ResponseEntity.ok(ApiResponse.ok("小说创建成功", novelService.create(novel)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Novel>> get(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(novelService.findById(id)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Novel>> update(@PathVariable Long id, @RequestBody Novel patch) {
        return ResponseEntity.ok(ApiResponse.ok("更新成功", novelService.update(id, patch)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        novelService.delete(id);
        return ResponseEntity.ok(ApiResponse.ok("删除成功", null));
    }
}
