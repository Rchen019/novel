# 📖 AI Novel Studio

> 本地化 AI 小说创作平台 · 个人自用版

一个不依赖商业订阅、完全本地运行的 AI 辅助写作工作台。通过结构化管理角色设定与世界观，解决 AI 写作中人设崩坏、世界观矛盾、长篇遗忘等核心问题。

---

## ✨ 功能特性

- **AI 续写 / 润色 / 扩写 / 缩写 / 改写 / 对话优化** — 自定义输出字数（100~5000字）
- **Memory Manager** — 自动注入角色设定 + 世界观 + 最近章节，解决 AI 遗忘问题
- **角色管理** — 角色卡系统，性格、背景、口吻全部持久化，AI 创作时自动引用
- **世界观管理** — 按分类管理修炼体系、势力格局、地图等设定
- **章节编辑器** — Markdown 支持 + 实时预览 + 自动保存
- **多模型切换** — 支持 DeepSeek / Qwen / Mistral / Llama / Gemma（全部免费）
- **本地 SQLite** — 数据完全存储在本地，无需云端账户

---

## 🏗️ 技术栈

| 层级 | 技术 |
|------|------|
| 前端 | Vue 3 + Vite + TipTap + Pinia + Axios |
| 后端 | Spring Boot 3 + Spring Data JPA |
| 数据库 | SQLite（本地文件，零配置） |
| AI   | OpenRouter API（免费模型） |

---

## 📁 项目结构

```
novel/
├── frontend/                  # Vue3 前端
│   ├── src/
│   │   ├── components/        # 编辑器、角色卡、世界观等组件
│   │   ├── views/             # 页面视图
│   │   ├── stores/            # Pinia 状态管理
│   │   └── api/               # Axios 封装
│   └── vite.config.js
│
└── backend/                   # Spring Boot 后端
    └── src/main/java/com/novelstudio/
        ├── controller/        # REST API 接口
        ├── service/
        │   ├── MemoryManager  # 核心：上下文拼装
        │   └── AiService      # OpenRouter 调用
        ├── model/             # JPA 实体
        └── repository/        # 数据访问层
```

---

## 🚀 快速开始

### 前提条件

- Java 17+
- Node.js 18+
- Maven 3.8+
- [OpenRouter](https://openrouter.ai) 免费账户（获取 API Key）

---

### 启动后端

```bash
cd backend

# 创建数据库目录
mkdir data

# 配置 API Key（选其一）

# 方式一：环境变量（推荐，不会泄露 Key）
# Windows PowerShell
$env:OPENROUTER_API_KEY="sk-or-v1-你的key"

# macOS / Linux
export OPENROUTER_API_KEY="sk-or-v1-你的key"

# 方式二：直接写入配置文件（注意不要提交到 Git）
# 编辑 src/main/resources/application.properties
# openrouter.api.key=sk-or-v1-你的key

# 启动
mvn spring-boot:run
```

后端启动后访问 [http://localhost:8080](http://localhost:8080) 可看到服务状态。

---

### 启动前端

```bash
cd frontend
npm install
npm run dev
```

浏览器访问 [http://localhost:5173](http://localhost:5173)

---

### API Key 获取方式

1. 访问 [https://openrouter.ai](https://openrouter.ai)
2. 注册免费账户
3. 进入 Dashboard → Keys → 创建新 Key
4. 复制 `sk-or-v1-…` 开头的 Key

> 免费模型（DeepSeek / Qwen / Mistral 等）无需充值即可使用。

---

## 🔌 API 接口一览

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/health` | 服务健康检查 |
| GET | `/api/novels` | 获取小说列表 |
| POST | `/api/novels` | 创建小说 |
| GET | `/api/novels/{id}/chapters` | 获取章节列表 |
| POST | `/api/novels/{id}/chapters` | 创建章节 |
| PATCH | `/api/chapters/{id}/content` | 自动保存正文 |
| GET | `/api/novels/{id}/characters` | 获取角色列表 |
| POST | `/api/novels/{id}/characters` | 创建角色 |
| GET | `/api/novels/{id}/world-settings` | 获取世界观条目 |
| POST | `/api/ai/generate` | AI 生成（续写/润色等） |
| GET | `/api/ai/models` | 获取可用模型列表 |

---

## 🧠 Memory Manager 工作原理

普通 AI 聊天的问题是上下文有限，无法记住整本小说。Memory Manager 通过结构化拼装解决这个问题：

```
最终 Prompt =
  [世界观设定]        ← 自动从数据库读取
  + [角色信息]        ← 自动注入当前小说所有角色
  + [最近 N 章剧情]   ← 默认最近 2 章（可配置）
  + [当前正文]        ← 编辑器内容
  + [创作指令]        ← 续写/润色/扩写 + 目标字数
```

---

## ⚙️ 配置说明

`backend/src/main/resources/application.properties`

```properties
# 服务端口
server.port=8080

# 引入最近章节数（Memory Manager）
memory.recent-chapters=2

# OpenRouter 默认模型
# 通过环境变量 OPENROUTER_API_KEY 注入 Key，不要硬编码
openrouter.api.key=
```

---

## 📌 注意事项

- `application.properties` 中的 `openrouter.api.key` 请保持为空，通过环境变量注入，**避免将 API Key 提交到 Git**
- SQLite 数据库文件位于 `backend/data/novel_studio.db`，已加入 `.gitignore`
- 本项目为个人本地使用设计，未做用户鉴权

---

## 📄 License

MIT
