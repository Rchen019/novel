package com.novelstudio.service;

import com.novelstudio.model.Novel;
import com.novelstudio.model.WorldSetting;
import com.novelstudio.repository.NovelRepository;
import com.novelstudio.repository.WorldSettingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class WorldSettingService {

    private final WorldSettingRepository worldSettingRepo;
    private final NovelRepository novelRepo;

    public List<WorldSetting> findByNovel(Long novelId) {
        return worldSettingRepo.findByNovelId(novelId);
    }

    public WorldSetting findById(Long id) {
        return worldSettingRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("世界观条目不存在：id=" + id));
    }

    public WorldSetting create(Long novelId, WorldSetting setting) {
        Novel novel = novelRepo.findById(novelId)
                .orElseThrow(() -> new RuntimeException("小说不存在：id=" + novelId));
        setting.setNovel(novel);
        return worldSettingRepo.save(setting);
    }

    public WorldSetting update(Long id, WorldSetting patch) {
        WorldSetting existing = findById(id);
        if (patch.getTitle() != null)    existing.setTitle(patch.getTitle());
        if (patch.getContent() != null)  existing.setContent(patch.getContent());
        if (patch.getCategory() != null) existing.setCategory(patch.getCategory());
        return worldSettingRepo.save(existing);
    }

    public void delete(Long id) {
        worldSettingRepo.deleteById(id);
    }
}
