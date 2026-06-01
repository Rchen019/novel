package com.novelstudio.service;

import com.novelstudio.model.Novel;
import com.novelstudio.repository.NovelRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class NovelService {

    private final NovelRepository novelRepo;

    public List<Novel> findAll() {
        return novelRepo.findAllByOrderByUpdatedAtDesc();
    }

    public Novel findById(Long id) {
        return novelRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("小说不存在：id=" + id));
    }

    public Novel create(Novel novel) {
        return novelRepo.save(novel);
    }

    public Novel update(Long id, Novel patch) {
        Novel existing = findById(id);
        if (patch.getTitle() != null)       existing.setTitle(patch.getTitle());
        if (patch.getDescription() != null) existing.setDescription(patch.getDescription());
        if (patch.getGenre() != null)       existing.setGenre(patch.getGenre());
        return novelRepo.save(existing);
    }

    public void delete(Long id) {
        novelRepo.deleteById(id);
    }
}
