package com.novelstudio.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "characters")
@Data
@NoArgsConstructor
public class Character {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "novel_id", nullable = false)
    private Novel novel;

    @Column(nullable = false)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String personality;

    @Column(columnDefinition = "TEXT")
    private String background;

    @Column(name = "speech_style", columnDefinition = "TEXT")
    private String speechStyle;

    @Column(columnDefinition = "TEXT")
    private String ability;

    /** 与其他角色的关系描述，JSON 字符串存储 */
    @Column(columnDefinition = "TEXT")
    private String relations;
}
