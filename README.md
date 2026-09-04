# MCG UTM 官方回憶錄、靈修與青年成長平台

這是為 Mandarin Care Group (MCG) UTM 打造的現代化官方網站。本網站旨在提供一個具備「高級感」與「靜謐感」的數位空間，結合靈修工具、生活技能文章與歷年活動紀錄，成為陪伴青年團員全人發展的數位庇護所。

## 💡 技術架構 (Tech Stack)

本專案採用最先進且低成本的 Jamstack 架構設計，讓非技術背景的委員也能輕鬆維護：
* **前端框架**: [Next.js (App Router)](https://nextjs.org/) + React 19
* **樣式排版**: Tailwind CSS + Framer Motion (精緻微動畫)
* **文章與資料庫**: [Notion API](https://developers.notion.com/) (作為無頭 CMS，網站資料由 Notion 即時同步)
* **圖床與影片優化**: [Cloudinary](https://cloudinary.com/) (免費且強大的多媒體 CDN)

---

## 📝 網站維護教學：如何新增文章？

文章可以屬於 Lifestyle、Spiritual、Community 或 News，也可以連結相關活動。公開網站只讀取 `Status = Published` 的內容。

### 1. 確認您的 Notion 文章資料庫格式
請確保您的 Notion 文章資料庫包含以下屬性 (Properties)，且**大小寫必須完全一致**：
* `Title` (Type: Title) - 文章的大標題
* `Slug` (Type: Text) - 網址路徑（只能使用小寫英文與連字號，例如：`my-first-post`）
* `PublishedAt` (Type: Date) - 發布日期
* `Tags` (Type: Multi-select) - 文章分類標籤（例如：Time Management）
* `Author` (Type: Text) - 作者名稱（選填，預設為 MCG Team）
* `Excerpt` (Type: Text) - 文章列表顯示的簡介短文
* `Section` (Type: Select) - `lifestyle`、`spiritual`、`community` 或 `news`
* `Events` (Type: Relation) - 可選擇連結一場或多場活動
* `Status` (Type: Select) - `Draft`、`Review`、`Published` 或 `Archived`

### 2. 新增文章步驟
1. 在 Notion 資料庫中新增一行（一頁）。
2. 填寫好上述的 `Title`、`Slug`、`PublishedAt` 等欄位。
3. **點開該頁面**，直接在下方像平常使用 Notion 一樣撰寫文章內容。
4. 網站支援大部分的 Notion 區塊（包含大小標題、粗體、清單、引言等）。
5. 審核後把 `Status` 改為 `Published`，再由技術負責人執行 `npm run content:sync` 保存可攜快照。

---

## 📸 網站維護教學：如何新增 Gallery 照片與影片？

為了保證網站載入速度，所有的照片與影片都會先上傳到專門的圖床 (Cloudinary)，再把網址貼到 Notion 記錄。

### 1. 確認您的 Notion Media data source 格式
請確保您的 Notion 相簿資料庫包含以下屬性 (Properties)：
* `Title` (Type: Title) - 照片或影片的標題 / 活動名稱
* `URL` (Type: URL) - 填入 Cloudinary 的網址
* `Date` (Type: Date) - 照片拍攝的日期
* `AltText` (Type: Text) - 具體描述照片內容，供無障礙閱讀
* `Event` (Type: Relation) - 必須連結一場活動
* `Type` (Type: Select) - `image` 或 `video`
* `SortOrder` (Type: Number) - 活動頁中的展示順序
* `Status` (Type: Select) - 只有 `Published` 會公開

### 2. 新增照片 / 影片步驟
1. 登入您的 [Cloudinary](https://cloudinary.com/) 後台。
2. 點擊右上角的 **Upload**，將您的照片或短影片 (`.mp4`, `.mov` 等) 拖曳上傳。
3. 上傳完成後，點擊該檔案旁邊的「複製網址」按鈕 (`</>` 符號或 Copy URL)。
   *(網址通常長這樣：`https://res.cloudinary.com/您的帳號/image/upload/v12345/xxx.jpg` 或 `.../video/upload/xxx.mp4`)*
4. 回到 Notion Media data source 新增一行。
5. 將網址貼到 `URL`，填寫必要欄位並連結 `Event`。
6. 每場活動公開精選最多 30 個媒體項目；完整原檔保留在 MCG 控制的雲端硬碟。

> **💡 關於影片的溫馨提示**
> 只要您的網址結尾是影片格式 (`.mp4`)，系統就會自動將它辨識為影片。它會在相簿牆上**自動靜音播放**（像 GIF 一樣），點擊放大後才會出現聲音與控制列！

---

## 🗂️ Notion data sources

欄位名稱與大小寫必須一致；公開資料的 `Status` 必須使用 **Select**，選項為 `Draft`、`Review`、`Published`、`Archived`。

| Data source | 必要欄位 |
|---|---|
| Terms | `Name` Title、`Slug` Text、`Dates` Date range、`Status` Select |
| Series | `Name` Title、`Slug` Text、`Summary` Text、`Status` Select |
| People | `Name` Title、`Slug` Text、`PortraitURL` URL/Files、`Bio` Text、`ConsentToPublish` Checkbox、`Status` Select |
| Committee Roles | `Role` Title、`Person` Relation、`Term` Relation、`SortOrder` Number、`Status` Select |
| Events | `Title` Title、`Slug` Text、`Summary` Text、`Dates` Date range、`Location` Text、`Term` Relation、`Series` Relation、`CoverImageURL` URL/Files、`Featured` Checkbox、`Status` Select |
| Media | `Title` Title、`URL` URL、`AltText` Text、`Date` Date、`Event` Relation、`Type` Select、`SortOrder` Number、`Status` Select |
| Articles | `Title` Title、`Slug` Text、`Excerpt` Text、`PublishedAt` Date、`Author` Text、`Section` Select、`Tags` Multi-select、`Events` Relation、`Status` Select |
| Registration | `Name` Title、`Email` Email、`Phone` Phone、`MajorYear` Text、`Message` Text、`Consent` Checkbox |

請分享原始 data source 給 Notion integration；不要只分享 linked view。一般參與者不放入 People，People 只有在 `ConsentToPublish` 勾選後才可進入公開快照。

---

## 💻 開發者指南：如何在本地端運行？

如果您是下一屆的技術負責人，需要接手開發本網站，請依照以下步驟設定您的環境：

### 1. 安裝環境
請確認您的電腦已安裝 [Node.js](https://nodejs.org/en) (建議版本 20 以上)。
```bash
git clone <repository-url>
cd mcg-utm-website
npm install
```

### 2. 環境變數設定
在專案根目錄建立一個 `.env.local` 檔案，並填入以下金鑰：
```env
NOTION_API_KEY=您的_Notion_Integration_Secret
NOTION_TERMS_DATA_SOURCE_ID=屆期資料表_ID
NOTION_SERIES_DATA_SOURCE_ID=活動系列資料表_ID
NOTION_PEOPLE_DATA_SOURCE_ID=公開人物資料表_ID
NOTION_COMMITTEE_ROLES_DATA_SOURCE_ID=執委職務資料表_ID
NOTION_EVENTS_DATA_SOURCE_ID=活動資料表_ID
NOTION_MEDIA_DATA_SOURCE_ID=精選媒體資料表_ID
NOTION_ARTICLES_DATA_SOURCE_ID=文章資料表_ID
NOTION_REGISTRATION_DATA_SOURCE_ID=加入表單資料表_ID
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=您的_Cloudinary_名稱

# Filebase 音檔儲存（只供伺服器使用，請勿加 NEXT_PUBLIC_）
FILEBASE_ACCESS_KEY=您的_Filebase_Access_Key
FILEBASE_SECRET_KEY=您的_Filebase_Secret_Key
FILEBASE_BUCKET=taize-audio
FILEBASE_ENDPOINT=https://s3.filebase.io
```
*(備註：請向上一屆負責人索取金鑰，或自行至 Notion Developers 與 Cloudinary 重新建立。)*

早期 Vercel 部署若仍只有 `NOTION_DATABASE_ID`，網站會自動從該 database container 找出文章 data source，作為遷移期間的相容模式。正式設定仍應在 Vercel Production 補齊上列七個 `NOTION_*_DATA_SOURCE_ID`；不要把任何 secret 提交到 Git。

### 3. Filebase 音檔設定與上傳

太澤音樂頁會由 Vercel 伺服器讀取 Filebase；瀏覽器不會直接取得 Filebase 密鑰，因此私有 bucket 不需要為網站開放 CORS。請在 Filebase 控制台把 MP3 上傳到 `FILEBASE_BUCKET` 指定的 bucket，並在 Vercel Project Settings → Environment Variables 為 **Production、Preview、Development** 設定上述四個變數。儲存後必須重新部署，既有 deployment 不會自動取得新值。

程式也兼容 Filebase 官方範例常見的 `FILEBASE_KEY` / `FILEBASE_SECRET` 名稱，但新設定建議統一使用 `FILEBASE_ACCESS_KEY` / `FILEBASE_SECRET_KEY`。若 `/api/audio?fresh=true` 回傳 `FILEBASE_CONFIGURATION_ERROR`，代表缺少環境變數；若回傳 `FILEBASE_ACCESS_DENIED`，請重新產生同一 Filebase 帳號的 S3 Access Key，並確認 `FILEBASE_BUCKET` 拼字與實際 bucket 完全一致。密鑰不可提交到 Git。

### 4. 啟動開發伺服器
```bash
npm run dev
```
打開瀏覽器前往 [http://localhost:3000](http://localhost:3000) 即可預覽網站。

### 5. 內容模型與安全發布

後端以 `Series → Event → Term` 為活動主軸，人物透過 `CommitteeRole` 連結屆期，文章與精選媒體再連結單次 Event。Terms、Series、People、Committee Roles、Events、Media 與 Articles 都必須有 `Status` Select 欄位。

```bash
npm run content:sync
```

此命令只在所有公開資料通過 schema、關聯、slug 唯一性與每場 30 個媒體上限後，才會更新 `src/content/snapshot.json`。網站連不上 Notion 或資料驗證失敗時，會繼續展示這份最後成功快照；快照不包含報名個資、密鑰或照片原檔。公開頁面最長約 5 分鐘重新驗證一次內容。
