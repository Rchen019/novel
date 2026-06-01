package com.novelstudio.service;

import com.novelstudio.model.Character;
import com.novelstudio.model.Novel;
import com.novelstudio.repository.CharacterRepository;
import com.novelstudio.repository.NovelRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class CharacterService {

    private final CharacterRepository characterRepo;
    private final NovelRepository novelRepo;

    public List<Character> findByNovel(Long novelId) {
        return characterRepo.findByNovelId(novelId);
    }

    public Character findById(Long id) {
        return characterRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("角色不存在：id=" + id));
    }

    public Character create(Long novelId, Character character) {
        Novel novel = novelRepo.findById(novelId)
                .orElseThrow(() -> new RuntimeException("小说不存在：id=" + novelId));
        character.setNovel(novel);
        return characterRepo.save(character);
    }

    public Character update(Long id, Character patch) {
        Character existing = findById(id);
        if (patch.getName() != null)        existing.setName(patch.getName());
        if (patch.getPersonality() != null) existing.setPersonality(patch.getPersonality());
        if (patch.getBackground() != null)  existing.setBackground(patch.getBackground());
        if (patch.getSpeechStyle() != null) existing.setSpeechStyle(patch.getSpeechStyle());
        if (patch.getAbility() != null)     existing.setAbility(patch.getAbility());
        if (patch.getRelations() != null)   existing.setRelations(patch.getRelations());
        return characterRepo.save(existing);
    }

    public void delete(Long id) {
        characterRepo.deleteById(id);
    }
}
