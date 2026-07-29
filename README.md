# sentence · 摘抄本

个人摘抄本网站：随手记录看到的文段，按标签分类、按关键词搜索。数据存在 Supabase（云端 Postgres），前端用 Vite + React，部署到 Cloudflare Pages。

## 1. 创建 Supabase 项目

1. 打开 https://supabase.com ，用 GitHub 账号登录，免费额度够个人用。
2. 点 "New project"，随便起个名字（比如 `sentence`），选一个离你近的区域，设置一个数据库密码（记下来，但日常用不到）。
3. 项目建好后，进入左侧 **SQL Editor**，新建一个 query，把仓库里 `supabase/schema.sql` 的内容整个粘贴进去，点 Run。这会建好摘录表，并配置好读写权限。
4. 进入左侧 **Project Settings → API**，你会看到：
   - **Project URL**（形如 `https://xxxx.supabase.co`）
   - **anon public** key（一长串字符）

## 2. 本地配置

在项目根目录新建 `.env.local`（已在 `.gitignore` 里，不会被提交）：

```
VITE_SUPABASE_URL=你的-project-url
VITE_SUPABASE_ANON_KEY=你的-anon-key
```

然后：

```bash
npm install
npm run dev
```

打开 http://localhost:5173 ，如果顶部的黄色提示条消失了，说明连接成功。

> 安全提示：这个项目暂时没有登录系统，anon key 会出现在打包后的前端代码里——也就是说，任何拿到你网站地址的人理论上都能读写这张表。这对"个人随手记"够用，但请不要在里面存真正敏感的隐私内容。以后想加登录也很容易，把 `supabase/schema.sql` 里的 RLS 策略换成基于 `auth.uid()` 的判断即可。

## 3. 部署到 Cloudflare Pages

1. 把仓库推到 GitHub。
2. Cloudflare Pages 里新建项目，连接这个仓库。
3. 构建命令 `npm run build`，输出目录 `dist`。
4. 在 Cloudflare Pages 的环境变量里加上 `VITE_SUPABASE_URL` 和 `VITE_SUPABASE_ANON_KEY`（跟 `.env.local` 里一样的值）。

## 项目结构

```
src/
  components/   界面组件（卡片、表单、标签徽章等）
  hooks/        useExcerpts：对 Supabase 的增删改查
  lib/          Supabase 客户端、日期格式化
supabase/
  schema.sql    数据表结构 + 行级安全策略
```
