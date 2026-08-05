# sentence · 摘抄本

个人摘抄本网站：随手记录看到的文段，按标签分类、按关键词搜索。前端用 Vite + React，数据存在 Cloudflare D1（云端 SQLite），全部部署在 Cloudflare Pages 上（网页 + 数据库同一个平台，只需要一个账号）。

## 1. 创建 D1 数据库

都在 Cloudflare 网页后台操作，不需要装任何命令行工具：

1. 打开 https://dash.cloudflare.com ，左侧菜单找到 **Workers & Pages** → **D1 SQL Database** → **Create database**。
2. 起个名字，比如 `sentence-db`，创建。
3. 进入这个数据库，点 **Console**（或叫 Query）标签，把仓库里 `d1/schema.sql` 的内容整个粘贴进去，执行。这会建好摘录表。

## 2. 把数据库绑定到网站

1. 回到你的 Pages 项目（就是之前部署 `sentence` 的那个）→ **Settings** → **Functions**。
2. 找到 **D1 database bindings** → **Add binding**。
   - Variable name 填：`DB`（必须是这个名字，代码里认的就是它）
   - D1 database 选：刚才建的 `sentence-db`
3. 保存后，回到 **Deployments** 页，触发一次新部署（推一次代码，或者点 `···` → Retry deployment）——绑定要新部署一次才会生效。

## 3. 完成

部署好之后，网站里"记一笔"存的数据就是真的存在云端数据库里了，手机、电脑打开都是同一份数据。

> 安全提示：这个项目暂时没有登录系统，任何拿到你网站地址的人理论上都能通过网站的增删改查接口读写这张表。这对"个人随手记"够用，但请不要存真正敏感的隐私内容。以后想加登录，需要在 `functions/` 里加一层身份校验。

## 数据库升级：新增"作者"字段

如果你的 D1 数据库是在这个字段加入之前建的（表已经存在），需要手动加一列，把 `d1/migrations/0001_add_author.sql` 的内容粘贴到 D1 Console 执行一次（或 `npx wrangler d1 execute sentence-db --remote --file=./d1/migrations/0001_add_author.sql`）。本地开发库同理，执行 `npm run db:local:migrate`。全新建库直接用最新的 `d1/schema.sql` 不需要这一步。

## 本地开发

```bash
npm install
npm run db:local:init   # 只需执行一次，建好本地数据库
npm run dev:full
```

打开命令行提示的地址（通常是 http://localhost:8788）。**不要**只用 `npm run dev`——那样只会跑前端界面，摘录存不进数据库（因为读写数据库的接口 `functions/` 需要 wrangler 才能跑起来）。

## 项目结构

```
src/
  components/   界面组件（卡片、表单、标签徽章等）
  hooks/        useExcerpts：调用 /api/excerpts 做增删改查
functions/
  api/excerpts/ Cloudflare Pages Functions，读写 D1 数据库的接口
d1/
  schema.sql    数据表结构
```
