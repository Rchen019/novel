package com.novelstudio.service;

import com.novelstudio.model.Chapter;
import com.novelstudio.model.Novel;
import com.novelstudio.repository.ChapterRepository;
import com.novelstudio.repository.NovelRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class ChapterService {

    private final ChapterRepository chapterRepo;
    private final NovelRepository novelRepo;

    public List<Chapter> findByNovel(Long novelId) {
        return chapterRepo.findByNovelIdOrderByOrderIndexAsc(novelId);
    }

    public Chapter findById(Long id) {
        return chapterRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("章节不存在：id=" + id));
    }

    public Chapter create(Long novelId, Chapter chapter) {
        Novel novel = novelRepo.findById(novelId)
                .orElseThrow(() -> new RuntimeException("小说不存在：id=" + novelId));
        chapter.setNovel(novel);
        // 自动计算排序号
        if (chapter.getOrderIndex() == null || chapter.getOrderIndex() == 0) {
            chapter.setOrderIndex(chapterRepo.nextOrderIndex(novelId));
        }
        return chapterRepo.save(chapter);
    }

    public Chapter updateContent(Long id, String content) {
        Chapter chapter = findById(id);
        chapter.setContent(content);
        return chapterRepo.save(chapter);
    }

    public Chapter update(Long id, Chapter patch) {
        Chapter existing = findById(id);
        if (patch.getTitle() != null)      existing.setTitle(patch.getTitle());
        if (patch.getContent() != null)    existing.setContent(patch.getContent());
        if (patch.getOrderIndex() != null) existing.setOrderIndex(patch.getOrderIndex());
        return chapterRepo.save(existing);
    }

    public void delete(Long id) {
        chapterRepo.deleteById(id);
    }
}
