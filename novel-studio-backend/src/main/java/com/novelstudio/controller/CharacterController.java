package com.novelstudio.controller;

import com.novelstudio.dto.ApiResponse;
import com.novelstudio.model.Character;
import com.novelstudio.service.CharacterService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 角色管理接口
 *
 * GET    /api/novels/{novelId}/characters        获取角色列表
 * POST   /api/novels/{novelId}/characters        创建角色
 * GET    /api/characters/{id}                    获取角色详情
 * PUT    /api/characters/{id}                    更新角色
 * DELETE /api/characters/{id}                    删除角色
 */
@RestController
@RequiredArgsConstructor
public class CharacterController {

    private final CharacterService characterService;

    @GetMapping("/api/novels/{novelId}/characters")
    public ResponseEntity<ApiResponse<List<Character>>> list(@PathVariable Long novelId) {
        return ResponseEntity.ok(ApiResponse.ok(characterService.findByNovel(novelId)));
    }

    @PostMapping("/api/novels/{novelId}/characters")
    public ResponseEntity<ApiResponse<Character>> create(@PathVariable Long novelId,
                                                         @RequestBody Character character) {
        return ResponseEntity.ok(ApiResponse.ok("角色创建成功", characterService.create(novelId, character)));
    }

    @GetMapping("/api/characters/{id}")
    public ResponseEntity<ApiResponse<Character>> get(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(characterService.findById(id)));
    }

    @PutMapping("/api/characters/{id}")
    public ResponseEntity<ApiResponse<Character>> update(@PathVariable Long id,
                                                         @RequestBody Character patch) {
        return ResponseEntity.ok(ApiResponse.ok("更新成功", characterService.update(id, patch)));
    }

    @DeleteMapping("/api/characters/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        characterService.delete(id);
        return ResponseEntity.ok(ApiResponse.ok("删除成功", null));
    }
}
