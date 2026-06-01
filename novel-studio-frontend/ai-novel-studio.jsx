import { useState, useRef, useEffect, useCallback } from "react";

// ─── Design tokens ───────────────────────────────────────────────────────────
const C = {
  bg: "#0e0c0a", surface: "#161310", card: "#1c1814",
  border: "#2a2420", borderHover: "#3d3530",
  accent: "#c8956c", accentDim: "#8c5e3c", accentGlow: "rgba(200,149,108,0.15)",
  text: "#e8ddd4", textMuted: "#8a7a6e", textDim: "#5a4e44",
  gold: "#d4a853", red: "#c85a5a", green: "#6cac6c",
};

// ─── OpenRouter model catalog ────────────────────────────────────────────────
const OR_MODELS = [
  { label: "DeepSeek Chat V3",    id: "deepseek/deepseek-chat",           tag: "中文强", free: true },
  { label: "Qwen 2.5 72B",        id: "qwen/qwen-2.5-72b-instruct",       tag: "小说佳", free: true },
  { label: "Mistral 7B",          id: "mistralai/mistral-7b-instruct",    tag: "稳定",   free: true },
  { label: "Llama 3.1 8B",        id: "meta-llama/llama-3.1-8b-instruct", tag: "英文强", free: true },
  { label: "Gemma 2 9B",          id: "google/gemma-2-9b-it",             tag: "均衡",   free: true },
];

const AI_ACTIONS = [
  { key: "续写",    desc: "从当前位置继续推进剧情" },
  { key: "润色",    desc: "提升文笔，优化表达" },
  { key: "扩写",    desc: "丰富细节，增加描写" },
  { key: "缩写",    desc: "精简内容，突出重点" },
  { key: "改写",    desc: "换一种表达方式" },
  { key: "对话优化", desc: "优化人物对白节奏" },
];

const WORD_PRESETS = [100, 200, 300, 500, 800, 1000];

// ─── Sample data ─────────────────────────────────────────────────────────────
const NOVEL = {
  id: 1, title: "龙渊传", genre: "玄幻",
  description: "一个天才少年在乱世中崛起的史诗故事。",
  chapters: [
    { id: 1, title: "序章·天坠之日",   content: "那一年，天穹裂开了一道口子。\n\n所有人都以为那是末日的征兆，却无人知晓，那不过是一个少年命运开始改变的前奏。\n\n苍澜大陆的历法，将那一天称为「天坠之日」。", order_index: 1 },
    { id: 2, title: "第一章·废柴之名", content: "林夜盘腿坐于破旧石台之上，眉目间尽是沉静之色。\n\n三年了。自从那次意外之后，他身体内的灵脉便如同彻底枯竭，任凭他如何修炼，灵力的涓涓细流始终无法汇聚成河。\n\n「废柴，」有人在身后笑道，「天才也不过如此。」\n\n林夜没有回头。他只是静静地看着远处连绵的山脉，眼神深邃，仿佛在思索某件旁人无法理解的事情。", order_index: 2 },
    { id: 3, title: "第二章·龙渊秘境", content: "深山之中，有一处无人知晓的秘境。\n\n传说龙渊是上古神龙的栖息之地，数千年前一场大战将它彻底封印。林夜循着那道若有若无的感应，在山中跋涉了整整七天。", order_index: 3 },
  ],
  characters: [
    { id: 1, name: "林夜",  personality: "冷静、少言、擅长谋略", background: "昔日天才，因突变失去修炼资质，被世人嘲笑为废柴", ability: "龙渊秘法（觉醒中）", speech_style: "言简意赅，少有情绪波动，偶尔反讽" },
    { id: 2, name: "苏瑶",  personality: "活泼、善良、有正义感", background: "苏家大小姐，与林夜青梅竹马", ability: "冰系灵力·霜华诀", speech_style: "直率、偶尔絮叨，关心人时会假装凶" },
    { id: 3, name: "玄老",  personality: "深不可测、睿智", background: "龙渊秘境守护者，身份成谜", ability: "未知", speech_style: "言语简练，常以问句反问" },
  ],
  worldSettings: [
    { id: 1, category: "修炼体系", title: "灵力六境", content: "凡·炼·灵·玄·圣·神，共六境，每境九层。突破需灵脉贯通，以天地灵气淬体。" },
    { id: 2, category: "修炼体系", title: "灵根品阶", content: "分甲乙丙丁四阶，甲阶最优。林夜原为甲阶上品，变故后灵根检测显示已断。" },
    { id: 3, category: "世界地图", title: "苍澜大陆", content: "分东、西、南、北四域，中央为禁区「龙渊」。四域各有主导势力，互相制衡。" },
    { id: 4, category: "势力格局", title: "三宗两阁", content: "天玄宗、苍云宗、幽冥宗，并列三大宗门；另有藏剑阁、问道阁两大中立势力。" },
  ],
};

// ─── Utilities ───────────────────────────────────────────────────────────────
const countWords = (s) => (s || "").replace(/\s/g, "").length;
const mkBtn = (active, extra = {}) => ({
  background: active ? C.accentGlow : "transparent",
  border: `1px solid ${active ? C.accent : C.border}`,
  color: active ? C.accent : C.textMuted,
  padding: "4px 10px", borderRadius: 3, cursor: "pointer", fontSize: 12,
  transition: "all 0.15s", ...extra,
});

// ─── Rich Toolbar (TipTap-style) ──────────────────────────────────────────────
function RichToolbar({ onFormat }) {
  const fmts = [
    { label: "B",    title: "加粗",     cmd: "bold",    style: { fontWeight: 700 } },
    { label: "I",    title: "斜体",     cmd: "italic",  style: { fontStyle: "italic" } },
    { label: "H1",   title: "大标题",   cmd: "h1",      style: { fontSize: 10 } },
    { label: "H2",   title: "小标题",   cmd: "h2",      style: { fontSize: 10 } },
    { label: "—",    title: "分隔线",   cmd: "divider", style: {} },
    { label: "「」", title: "书名号",   cmd: "quote",   style: {} },
    { label: "…",    title: "省略号",   cmd: "ellipsis",style: {} },
  ];
  return (
    <div style={{ display: "flex", gap: 4, padding: "6px 20px", borderBottom: `1px solid ${C.border}`, background: C.surface, flexShrink: 0, alignItems: "center" }}>
      <span style={{ fontSize: 10, color: C.textDim, marginRight: 6, letterSpacing: 1 }}>TipTap</span>
      {fmts.map(f => (
        <button key={f.cmd} title={f.title} onClick={() => onFormat(f.cmd)} style={{
          background: "transparent", border: `1px solid ${C.border}`,
          color: C.textMuted, padding: "3px 8px", borderRadius: 3, cursor: "pointer", fontSize: 13,
          transition: "all 0.12s", ...f.style,
        }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = C.accentDim; e.currentTarget.style.color = C.accent; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.color = C.textMuted; }}
        >{f.label}</button>
      ))}
      <div style={{ flex: 1 }} />
      <span style={{ fontSize: 10, color: C.textDim }}>Markdown 输入，实时预览</span>
    </div>
  );
}

// ─── Markdown preview renderer (lightweight) ──────────────────────────────────
function MarkdownPreview({ content }) {
  const html = content
    .replace(/^# (.+)$/gm, '<h1 style="font-size:1.6em;color:#e8ddd4;margin:1.2em 0 0.4em;font-family:Noto Serif SC,Georgia,serif">$1</h1>')
    .replace(/^## (.+)$/gm, '<h2 style="font-size:1.2em;color:#c8956c;margin:1em 0 0.3em;font-family:Noto Serif SC,Georgia,serif">$1</h2>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/^---$/gm, '<hr style="border:none;border-top:1px solid #2a2420;margin:1.5em 0"/>')
    .replace(/\n\n/g, '</p><p style="margin:0 0 1.2em">')
    .replace(/\n/g, '<br/>');
  return (
    <div
      dangerouslySetInnerHTML={{ __html: `<p style="margin:0 0 1.2em">${html}</p>` }}
      style={{ fontSize: 16, color: C.text, lineHeight: 2.3, fontFamily: "'Noto Serif SC',Georgia,serif", letterSpacing: "0.03em" }}
    />
  );
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────
function Sidebar({ active, setActive, activeChapter, setActiveChapter }) {
  const navs = [
    { key: "editor",     icon: "✦", label: "编辑器" },
    { key: "characters", icon: "◈", label: "角色管理" },
    { key: "world",      icon: "◉", label: "世界观" },
    { key: "settings",   icon: "⚙", label: "系统设置" },
  ];
  return (
    <div style={{ width: 240, background: C.surface, borderRight: `1px solid ${C.border}`, display: "flex", flexDirection: "column", flexShrink: 0 }}>
      <div style={{ padding: "18px 20px 14px", borderBottom: `1px solid ${C.border}` }}>
        <div style={{ fontSize: 10, letterSpacing: 3, color: C.accentDim, marginBottom: 3 }}>AI NOVEL STUDIO</div>
        <div style={{ fontSize: 17, color: C.text, fontWeight: 600 }}>{NOVEL.title}</div>
        <div style={{ display: "flex", gap: 6, marginTop: 6 }}>
          <span style={{ fontSize: 10, padding: "2px 7px", background: C.accentGlow, color: C.accent, borderRadius: 2, border: `1px solid ${C.accentDim}` }}>{NOVEL.genre}</span>
          <span style={{ fontSize: 10, padding: "2px 7px", color: C.textDim, borderRadius: 2, border: `1px solid ${C.border}` }}>本地版</span>
        </div>
      </div>
      <div style={{ borderBottom: `1px solid ${C.border}`, padding: "10px 0" }}>
        {navs.map(n => (
          <button key={n.key} onClick={() => setActive(n.key)} style={{
            width: "100%", textAlign: "left",
            background: active === n.key ? C.accentGlow : "transparent",
            border: "none", borderLeft: active === n.key ? `2px solid ${C.accent}` : "2px solid transparent",
            color: active === n.key ? C.accent : C.textMuted,
            padding: "9px 20px", cursor: "pointer", fontSize: 13,
            display: "flex", alignItems: "center", gap: 10, transition: "all 0.12s",
          }}>
            <span style={{ fontSize: 9 }}>{n.icon}</span>{n.label}
          </button>
        ))}
      </div>
      {active === "editor" && (
        <div style={{ flex: 1, overflow: "auto", padding: "10px 0" }}>
          <div style={{ padding: "4px 20px 8px", fontSize: 10, color: C.textDim, letterSpacing: 2 }}>章节目录</div>
          {NOVEL.chapters.map(ch => (
            <button key={ch.id} onClick={() => setActiveChapter(ch)} style={{
              width: "100%", textAlign: "left",
              background: activeChapter?.id === ch.id ? C.card : "transparent",
              border: "none", borderLeft: activeChapter?.id === ch.id ? `2px solid ${C.gold}` : "2px solid transparent",
              color: activeChapter?.id === ch.id ? C.text : C.textMuted,
              padding: "8px 20px", cursor: "pointer", fontSize: 13, transition: "all 0.12s",
            }}>
              <div style={{ fontSize: 10, color: C.textDim, marginBottom: 2 }}>第 {ch.order_index} 章</div>
              {ch.title}
            </button>
          ))}
          <button style={{ width: "calc(100% - 32px)", margin: "10px 16px 0", background: "transparent", border: `1px dashed ${C.border}`, color: C.textDim, padding: "7px", cursor: "pointer", fontSize: 12, borderRadius: 3 }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = C.accentDim; e.currentTarget.style.color = C.accent; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.color = C.textDim; }}
          >+ 新建章节</button>
        </div>
      )}
    </div>
  );
}

// ─── AI Panel ─────────────────────────────────────────────────────────────────
function AiPanel({ content, chapter }) {
  const [action, setAction]       = useState("续写");
  const [modelId, setModelId]     = useState(OR_MODELS[0].id);
  const [apiKey, setApiKey]       = useState("");
  const [wordTarget, setWordTarget] = useState(300);
  const [customWord, setCustomWord] = useState("");
  const [useCustom, setUseCustom]   = useState(false);
  const [output, setOutput]       = useState("");
  const [loading, setLoading]     = useState(false);
  const [accepted, setAccepted]   = useState(false);
  const [error, setError]         = useState("");
  const [appendedContent, setAppendedContent] = useState(null);

  const finalWords = useCustom ? (parseInt(customWord) || 300) : wordTarget;

  const buildPrompt = useCallback(() => {
    const chars = NOVEL.characters.map(c =>
      `【${c.name}】\n  性格：${c.personality}\n  背景：${c.background}\n  口吻：${c.speech_style}`
    ).join("\n");
    const world = NOVEL.worldSettings.map(w => `◆ ${w.title}：${w.content}`).join("\n");
    const recent = NOVEL.chapters.slice(-2).map(c => `《${c.title}》\n${c.content}`).join("\n\n---\n\n");
    const actionDesc = AI_ACTIONS.find(a => a.key === action)?.desc || action;

    return `你是顶级${NOVEL.genre}网文作家，熟悉行文节奏与读者口味。

═══ 【世界观设定】═══
${world}

═══ 【角色信息】═══
${chars}

═══ 【最近章节参考】═══
${recent}

═══ 【当前正文】═══
${content || "（空白，请开始创作）"}

═══ 【创作指令】═══
请对上述内容执行「${action}」操作（${actionDesc}）。
要求：
1. 严格保持角色性格与口吻一致
2. 遵循世界观规则，不得自相矛盾
3. 输出约 ${finalWords} 字，不含标注说明
4. 直接输出正文内容，勿添加"好的""以下是"等开场白
5. 使用第三人称叙事，符合${NOVEL.genre}写作风格`;
  }, [content, action, finalWords]);

  const run = async () => {
    if (!apiKey.trim()) { setError("请先填写 OpenRouter API Key（免费注册：openrouter.ai）"); return; }
    setLoading(true); setOutput(""); setError(""); setAccepted(false); setAppendedContent(null);
    try {
      const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`,
          "HTTP-Referer": "https://ai-novel-studio.local",
          "X-Title": "AI Novel Studio",
        },
        body: JSON.stringify({
          model: modelId,
          max_tokens: Math.max(800, finalWords * 3),
          messages: [{ role: "user", content: buildPrompt() }],
          temperature: 0.85,
        }),
      });
      const data = await res.json();
      if (data.error) setError(`API 错误：${data.error.message}`);
      else setOutput(data.choices?.[0]?.message?.content?.trim() || "（无输出）");
    } catch (e) {
      setError(`网络错误：${e.message}`);
    }
    setLoading(false);
  };

  return (
    <div style={{ width: 360, borderLeft: `1px solid ${C.border}`, background: C.surface, display: "flex", flexDirection: "column", flexShrink: 0, overflow: "hidden" }}>
      {/* Config area */}
      <div style={{ padding: "14px 18px", borderBottom: `1px solid ${C.border}`, overflow: "auto", maxHeight: "68%" }}>
        <div style={{ fontSize: 11, color: C.accent, letterSpacing: 2, marginBottom: 12 }}>◈ AI 创作助手</div>

        {/* Action */}
        <Label>功能选择</Label>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 14 }}>
          {AI_ACTIONS.map(a => (
            <button key={a.key} onClick={() => setAction(a.key)} title={a.desc} style={mkBtn(action === a.key)}>
              {a.key}
            </button>
          ))}
        </div>

        {/* Word count */}
        <Label>输出字数</Label>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 8 }}>
          {WORD_PRESETS.map(w => (
            <button key={w} onClick={() => { setWordTarget(w); setUseCustom(false); }} style={mkBtn(!useCustom && wordTarget === w)}>
              {w}字
            </button>
          ))}
          <button onClick={() => setUseCustom(true)} style={mkBtn(useCustom)}>自定义</button>
        </div>
        {useCustom && (
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <input type="number" min={50} max={5000} placeholder="例如：1500"
              value={customWord} onChange={e => setCustomWord(e.target.value)}
              style={{ flex: 1, background: C.card, border: `1px solid ${C.border}`, color: C.text, padding: "6px 10px", borderRadius: 3, fontSize: 13, outline: "none" }} />
            <span style={{ fontSize: 11, color: C.textDim }}>字</span>
          </div>
        )}
        <div style={{ fontSize: 11, color: C.textDim, marginBottom: 14 }}>
          目标：<span style={{ color: C.accent }}>{finalWords} 字</span>
          <span style={{ marginLeft: 8 }}>≈ {Math.ceil(finalWords * 1.8)} tokens</span>
        </div>

        {/* Model */}
        <Label>模型（OpenRouter · 均免费）</Label>
        <div style={{ display: "flex", flexDirection: "column", gap: 4, marginBottom: 14 }}>
          {OR_MODELS.map(m => (
            <button key={m.id} onClick={() => setModelId(m.id)} style={{
              ...mkBtn(modelId === m.id, { display: "flex", alignItems: "center", padding: "6px 10px", textAlign: "left", width: "100%" })
            }}>
              <span style={{ flex: 1, fontSize: 12 }}>{m.label}</span>
              <span style={{ fontSize: 10, padding: "1px 5px", background: C.accentGlow, borderRadius: 2, color: C.accentDim }}>{m.tag}</span>
              <span style={{ fontSize: 9, marginLeft: 5, color: C.green }}>FREE</span>
            </button>
          ))}
        </div>

        {/* API Key */}
        <Label>OpenRouter API Key</Label>
        <input type="password" placeholder="sk-or-v1-… （openrouter.ai 免费注册）"
          value={apiKey} onChange={e => { setApiKey(e.target.value); setError(""); }}
          style={{ width: "100%", background: C.card, border: `1px solid ${apiKey ? C.accentDim : C.border}`, color: C.text, padding: "7px 10px", borderRadius: 3, fontSize: 12, outline: "none", marginBottom: 12 }} />

        {/* Context badge */}
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 4, padding: "8px 12px", fontSize: 11, color: C.textDim, lineHeight: 1.9, marginBottom: 12 }}>
          <span style={{ color: C.textMuted }}>📎 自动注入上下文 </span>
          角色 ×{NOVEL.characters.length}　世界观 ×{NOVEL.worldSettings.length}　近 {Math.min(2, NOVEL.chapters.length)} 章
        </div>

        <button onClick={run} disabled={loading} style={{
          width: "100%", background: loading ? C.accentDim : C.accent,
          border: "none", color: "#0e0c0a", padding: "11px",
          borderRadius: 3, cursor: loading ? "default" : "pointer",
          fontSize: 14, fontWeight: 700, letterSpacing: 1,
        }}>
          {loading ? "生成中…" : `▶  ${action}（${finalWords} 字）`}
        </button>
        {error && <div style={{ marginTop: 8, fontSize: 11, color: C.red, lineHeight: 1.7 }}>{error}</div>}
      </div>

      {/* Output */}
      <div style={{ flex: 1, overflow: "auto", padding: "16px 18px" }}>
        {loading && (
          <div style={{ textAlign: "center", paddingTop: 40 }}>
            <div style={{ width: 28, height: 28, border: `2px solid ${C.border}`, borderTop: `2px solid ${C.accent}`, borderRadius: "50%", animation: "spin 0.9s linear infinite", margin: "0 auto 12px" }} />
            <div style={{ fontSize: 12, color: C.textDim }}>AI 正在创作，目标 {finalWords} 字…</div>
          </div>
        )}
        {output && !loading && (
          <>
            <div style={{ fontSize: 10, color: C.textDim, marginBottom: 10, display: "flex", justifyContent: "space-between" }}>
              <span>生成结果 · {countWords(output)} 字</span>
              {accepted && <span style={{ color: C.green }}>✓ 已追加到正文</span>}
            </div>
            <div style={{
              fontSize: 14, color: C.text, lineHeight: 2.1,
              fontFamily: "'Noto Serif SC',Georgia,serif",
              borderLeft: `2px solid ${C.accentDim}`, paddingLeft: 14,
              marginBottom: 14, whiteSpace: "pre-wrap",
            }}>{output}</div>
            <div style={{ display: "flex", gap: 6 }}>
              <button onClick={() => setAccepted(true)} style={{ ...mkBtn(false, { flex: 2, padding: "8px", fontSize: 12, fontWeight: 600, background: C.accentGlow, borderColor: C.accentDim, color: C.accent }) }}>
                ✓ 采用到正文
              </button>
              <button onClick={run} style={{ ...mkBtn(false, { flex: 1, padding: "8px", fontSize: 12 }) }}>↺ 重试</button>
              <button onClick={() => setOutput("")} style={{ ...mkBtn(false, { padding: "8px 10px", fontSize: 12 }) }}>✕</button>
            </div>
          </>
        )}
        {!output && !loading && (
          <div style={{ textAlign: "center", paddingTop: 40, color: C.textDim, fontSize: 12, lineHeight: 2.4 }}>
            填写 API Key 后<br />选择功能与字数<br />点击运行即可
          </div>
        )}
      </div>
    </div>
  );
}

function Label({ children }) {
  return <div style={{ fontSize: 10, color: C.textDim, marginBottom: 6, letterSpacing: 1 }}>{children}</div>;
}

// ─── Editor View ──────────────────────────────────────────────────────────────
function EditorView({ chapter }) {
  const [content, setContent] = useState(chapter?.content || "");
  const [preview, setPreview] = useState(false);
  const [showAi, setShowAi]   = useState(true);
  const [saved, setSaved]     = useState(true);
  const taRef   = useRef(null);
  const timer   = useRef(null);

  useEffect(() => { setContent(chapter?.content || ""); setSaved(true); }, [chapter]);

  const onChange = (v) => {
    setContent(v); setSaved(false);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setSaved(true), 1500);
  };

  const handleFormat = (cmd) => {
    const ta = taRef.current;
    if (!ta) return;
    const { selectionStart: s, selectionEnd: e, value } = ta;
    const sel = value.slice(s, e);
    const map = {
      bold:     `**${sel || "加粗文字"}**`,
      italic:   `*${sel || "斜体文字"}*`,
      h1:       `\n\n# ${sel || "大标题"}\n\n`,
      h2:       `\n\n## ${sel || "小标题"}\n\n`,
      divider:  "\n\n---\n\n",
      quote:    `「${sel || "对话内容"}」`,
      ellipsis: "……",
    };
    const ins = map[cmd] || sel;
    const next = value.slice(0, s) + ins + value.slice(e);
    onChange(next);
    setTimeout(() => { ta.focus(); ta.setSelectionRange(s + ins.length, s + ins.length); }, 0);
  };

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
      {/* Topbar */}
      <div style={{ borderBottom: `1px solid ${C.border}`, padding: "10px 20px", display: "flex", alignItems: "center", gap: 10, background: C.surface, flexShrink: 0 }}>
        <span style={{ flex: 1, fontSize: 14, color: C.text }}>{chapter?.title || "未选择章节"}</span>
        <span style={{ fontSize: 11, color: C.textDim }}>{countWords(content)} 字</span>
        <span style={{ fontSize: 11, color: saved ? C.green : C.gold }}>{saved ? "✓ 已保存" : "保存中…"}</span>
        <div style={{ width: 1, height: 16, background: C.border }} />
        <button onClick={() => setPreview(p => !p)} style={mkBtn(preview, { padding: "4px 12px" })}>
          {preview ? "编辑" : "预览"}
        </button>
        <button onClick={() => setShowAi(p => !p)} style={{
          background: showAi ? C.accent : "transparent",
          border: `1px solid ${showAi ? C.accent : C.border}`,
          color: showAi ? "#0e0c0a" : C.textMuted,
          padding: "5px 14px", borderRadius: 3, cursor: "pointer", fontSize: 12, fontWeight: 600,
        }}>AI 助手 {showAi ? "▶" : "◀"}</button>
      </div>

      {!preview && <RichToolbar onFormat={handleFormat} />}

      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        <div style={{ flex: 1, padding: "40px 72px", overflow: "auto", background: C.bg }}>
          {preview ? (
            <MarkdownPreview content={content} />
          ) : (
            <textarea
              ref={taRef}
              value={content}
              onChange={e => onChange(e.target.value)}
              placeholder={"开始创作你的故事……\n\n提示：选中文字后点击格式按钮可快速插入标记\n用 # 标题，**加粗**，*斜体*，「对话」"}
              spellCheck={false}
              style={{
                width: "100%", minHeight: "80vh",
                background: "transparent", border: "none", outline: "none",
                color: C.text, fontSize: 16, lineHeight: 2.3,
                fontFamily: "'Noto Serif SC','思源宋体',Georgia,serif",
                resize: "none", letterSpacing: "0.03em",
              }}
            />
          )}
        </div>
        {showAi && <AiPanel content={content} chapter={chapter} />}
      </div>
    </div>
  );
}

// ─── Characters View ──────────────────────────────────────────────────────────
function CharactersView() {
  const [sel, setSel] = useState(NOVEL.characters[0]);
  return (
    <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
      <div style={{ width: 200, borderRight: `1px solid ${C.border}`, padding: "18px 0" }}>
        <div style={{ padding: "0 20px 10px", fontSize: 10, color: C.textDim, letterSpacing: 2 }}>角色列表</div>
        {NOVEL.characters.map(c => (
          <button key={c.id} onClick={() => setSel(c)} style={{
            width: "100%", textAlign: "left",
            background: sel?.id === c.id ? C.accentGlow : "transparent",
            border: "none", borderLeft: sel?.id === c.id ? `2px solid ${C.accent}` : "2px solid transparent",
            color: sel?.id === c.id ? C.text : C.textMuted,
            padding: "10px 20px", cursor: "pointer", fontSize: 13,
          }}>
            <div style={{ fontSize: 15, marginBottom: 2 }}>{c.name}</div>
            <div style={{ fontSize: 10, color: C.textDim }}>{c.ability.slice(0, 10)}</div>
          </button>
        ))}
        <button style={{ width: "calc(100% - 32px)", margin: "10px 16px 0", background: "transparent", border: `1px dashed ${C.border}`, color: C.textDim, padding: "7px", cursor: "pointer", fontSize: 12, borderRadius: 3 }}>
          + 新建角色
        </button>
      </div>
      {sel && (
        <div style={{ flex: 1, padding: "36px 52px", overflow: "auto" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 30 }}>
            <div style={{ width: 60, height: 60, borderRadius: "50%", background: `linear-gradient(135deg,${C.accentDim},${C.card})`, border: `2px solid ${C.accentDim}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, color: C.accent }}>{sel.name[0]}</div>
            <div>
              <div style={{ fontSize: 22, color: C.text, fontFamily: "'Noto Serif SC',Georgia,serif", marginBottom: 4 }}>{sel.name}</div>
              <div style={{ fontSize: 12, color: C.accentDim }}>{sel.ability}</div>
            </div>
          </div>
          {[["性格特征", sel.personality], ["人物背景", sel.background], ["说话风格", sel.speech_style], ["能力技能", sel.ability]].map(([lbl, val]) => (
            <div key={lbl} style={{ marginBottom: 18 }}>
              <div style={{ fontSize: 10, color: C.accentDim, letterSpacing: 2, marginBottom: 7 }}>{lbl}</div>
              <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 4, padding: "12px 16px", color: C.text, fontSize: 14, lineHeight: 1.9, fontFamily: "'Noto Serif SC',Georgia,serif" }}>{val}</div>
            </div>
          ))}
          <div style={{ marginTop: 16, padding: "10px 14px", background: C.accentGlow, border: `1px solid ${C.accentDim}`, borderRadius: 4, fontSize: 11, color: C.accentDim }}>
            ✦ 此角色信息将在 AI 创作时自动注入 Prompt，保证人设不崩。
          </div>
        </div>
      )}
    </div>
  );
}

// ─── World View ───────────────────────────────────────────────────────────────
function WorldView() {
  const cats = [...new Set(NOVEL.worldSettings.map(w => w.category))];
  const [cat, setCat] = useState(cats[0]);
  return (
    <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
      <div style={{ width: 200, borderRight: `1px solid ${C.border}`, padding: "18px 0" }}>
        <div style={{ padding: "0 20px 10px", fontSize: 10, color: C.textDim, letterSpacing: 2 }}>分类</div>
        {cats.map(c => (
          <button key={c} onClick={() => setCat(c)} style={{ width: "100%", textAlign: "left", background: cat === c ? C.accentGlow : "transparent", border: "none", borderLeft: cat === c ? `2px solid ${C.accent}` : "2px solid transparent", color: cat === c ? C.text : C.textMuted, padding: "9px 20px", cursor: "pointer", fontSize: 13 }}>{c}</button>
        ))}
        <button style={{ width: "calc(100% - 32px)", margin: "10px 16px 0", background: "transparent", border: `1px dashed ${C.border}`, color: C.textDim, padding: "7px", cursor: "pointer", fontSize: 12, borderRadius: 3 }}>+ 添加分类</button>
      </div>
      <div style={{ flex: 1, padding: "36px 52px", overflow: "auto" }}>
        <div style={{ fontSize: 18, color: C.text, marginBottom: 22, fontFamily: "'Noto Serif SC',Georgia,serif" }}>{cat}</div>
        {NOVEL.worldSettings.filter(w => w.category === cat).map(w => (
          <div key={w.id} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 6, padding: "18px 22px", marginBottom: 14 }}>
            <div style={{ fontSize: 14, color: C.accent, marginBottom: 8 }}>{w.title}</div>
            <div style={{ fontSize: 14, color: C.text, lineHeight: 1.9, fontFamily: "'Noto Serif SC',Georgia,serif" }}>{w.content}</div>
          </div>
        ))}
        <button style={{ width: "100%", background: "transparent", border: `1px dashed ${C.border}`, color: C.textDim, padding: "10px", cursor: "pointer", fontSize: 12, borderRadius: 4 }}>+ 添加条目</button>
      </div>
    </div>
  );
}

// ─── Settings View ────────────────────────────────────────────────────────────
function SettingsView() {
  const [ctxLen, setCtxLen]   = useState(2);
  const [temp, setTemp]       = useState(85);
  const [backendUrl, setBackendUrl] = useState("http://localhost:8080");

  return (
    <div style={{ flex: 1, padding: "40px 64px", overflow: "auto" }}>
      <div style={{ maxWidth: 600 }}>
        <div style={{ fontSize: 20, color: C.text, marginBottom: 6, fontFamily: "'Noto Serif SC',Georgia,serif" }}>系统设置</div>
        <div style={{ fontSize: 12, color: C.textDim, marginBottom: 32 }}>Spring Boot 后端 · OpenRouter · Memory Manager</div>

        {[
          { label: "Spring Boot 后端地址", desc: "本地部署时默认 http://localhost:8080", el: <input value={backendUrl} onChange={e => setBackendUrl(e.target.value)} style={{ width: "100%", background: C.card, border: `1px solid ${C.border}`, color: C.text, padding: "8px 12px", borderRadius: 4, fontSize: 13, outline: "none" }} /> },
          { label: `引入最近章节：${ctxLen} 章`, desc: "章节越多上下文越准确，但 Token 消耗增加", el: <div style={{ display: "flex", alignItems: "center", gap: 12 }}><input type="range" min={1} max={5} value={ctxLen} onChange={e => setCtxLen(+e.target.value)} style={{ flex: 1, accentColor: C.accent }} /><span style={{ fontSize: 13, color: C.accent, width: 30 }}>{ctxLen}</span></div> },
          { label: `Temperature：${(temp / 100).toFixed(2)}`, desc: "越高越有创意，建议小说续写 0.80~0.90", el: <div style={{ display: "flex", alignItems: "center", gap: 12 }}><input type="range" min={10} max={100} value={temp} onChange={e => setTemp(+e.target.value)} style={{ flex: 1, accentColor: C.accent }} /><span style={{ fontSize: 13, color: C.accent, width: 40 }}>{(temp / 100).toFixed(2)}</span></div> },
        ].map(s => (
          <div key={s.label} style={{ marginBottom: 26 }}>
            <div style={{ fontSize: 13, color: C.text, marginBottom: 4 }}>{s.label}</div>
            <div style={{ fontSize: 11, color: C.textDim, marginBottom: 9 }}>{s.desc}</div>
            {s.el}
          </div>
        ))}

        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 6, padding: "18px 20px", fontSize: 12, color: C.textDim, lineHeight: 2.1, marginTop: 8 }}>
          <div style={{ color: C.accentDim, marginBottom: 8, fontSize: 13 }}>◉ 完整调用链路（接入后端后）</div>
          <div>① Vue 前端 → POST /api/ai/generate</div>
          <div>② Spring Boot AiService 拼装 Memory Prompt</div>
          <div>③ 调用 OpenRouter API（DeepSeek / Qwen / Llama）</div>
          <div>④ 返回生成内容，前端展示</div>
          <div>⑤ 用户确认 → POST /api/chapters/{"{id}"}/content → SQLite 持久化</div>
        </div>
      </div>
    </div>
  );
}

// ─── App root ─────────────────────────────────────────────────────────────────
export default function App() {
  const [section, setSection] = useState("editor");
  const [chapter, setChapter] = useState(NOVEL.chapters[1]);

  const views = {
    editor:     <EditorView chapter={chapter} />,
    characters: <CharactersView />,
    world:      <WorldView />,
    settings:   <SettingsView />,
  };

  return (
    <div style={{ display: "flex", height: "100vh", background: C.bg, color: C.text, overflow: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@300;400;600&display=swap');
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #2a2420; border-radius: 2px; }
        textarea::placeholder { color: #5a4e44; }
        input::placeholder { color: #5a4e44; }
        select option { background: #1c1814; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
      <Sidebar active={section} setActive={setSection} activeChapter={chapter} setActiveChapter={setChapter} />
      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        {views[section]}
      </div>
    </div>
  );
}
