package com.novelstudio.controller;

import com.novelstudio.dto.ApiResponse;
import com.novelstudio.model.WorldSetting;
import com.novelstudio.service.WorldSettingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 世界观设定接口
 *
 * GET    /api/novels/{novelId}/world-settings    获取全部条目
 * POST   /api/novels/{novelId}/world-settings    创建条目
 * PUT    /api/world-settings/{id}                更新条目
 * DELETE /api/world-settings/{id}                删除条目
 */
@RestController
@RequiredArgsConstructor
public class WorldSettingController {

    private final WorldSettingService worldSettingService;

    @GetMapping("/api/novels/{novelId}/world-settings")
    public ResponseEntity<ApiResponse<List<WorldSetting>>> list(@PathVariable Long novelId) {
        return ResponseEntity.ok(ApiResponse.ok(worldSettingService.findByNovel(novelId)));
    }

    @PostMapping("/api/novels/{novelId}/world-settings")
    public ResponseEntity<ApiResponse<WorldSetting>> create(@PathVariable Long novelId,
                                                            @RequestBody WorldSetting setting) {
        return ResponseEntity.ok(ApiResponse.ok("条目创建成功", worldSettingService.create(novelId, setting)));
    }

    @PutMapping("/api/world-settings/{id}")
    public ResponseEntity<ApiResponse<WorldSetting>> update(@PathVariable Long id,
                                                            @RequestBody WorldSetting patch) {
        return ResponseEntity.ok(ApiResponse.ok("更新成功", worldSettingService.update(id, patch)));
    }

    @DeleteMapping("/api/world-settings/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        worldSettingService.delete(id);
        return ResponseEntity.ok(ApiResponse.ok("删除成功", null));
    }
}
