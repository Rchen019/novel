package com.novelstudio.repository;

import com.novelstudio.model.Chapter;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ChapterRepository extends JpaRepository<Chapter, Long> {

    List<Chapter> findByNovelIdOrderByOrderIndexAsc(Long novelId);

    /** 取最近 N 章用于 Memory Manager */
    @Query("SELECT c FROM Chapter c WHERE c.novel.id = :novelId ORDER BY c.orderIndex DESC LIMIT :limit")
    List<Chapter> findRecentChapters(Long novelId, int limit);

    /** 下一个排序号 */
    @Query("SELECT COALESCE(MAX(c.orderIndex), 0) + 1 FROM Chapter c WHERE c.novel.id = :novelId")
    int nextOrderIndex(Long novelId);
}
