# Etymon Tools

Etymon キャラクターネーミング作業支援ツール。

## 概要

[vocab-app](https://github.com/Dr-sakamoto/vocab-app) のキャラクター名称管理ファイル（`ETYMON_NAMES.md`）に対してタグ付け・新規採用・更新・GitHub 反映を行うブラウザツールです。バニラ JS・CSS のみで構成されており、サーバー不要でローカルで動作します。

## 関連リポジトリ

| リポジトリ | 役割 |
|---|---|
| [Dr-sakamoto/vocab-app](https://github.com/Dr-sakamoto/vocab-app) | データソース（`ETYMON_NAMES.md` を管理） |
| このリポジトリ | 編集ツール |

## セットアップ

```bash
npm install
npm run fetch        # ETYMON_NAMES.md を取得して names_cache.json を生成
npm run fetch:areas  # lib/habitatSprites.json を取得して areas_cache.json を生成（エリアスプライト用）
```

その後 `src/tagger/index.html` をブラウザで開く（サーバー不要）。

## GitHub PAT の取得

1. GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. 「Generate new token」をクリック
3. スコープ：`public_repo` にチェック
4. 生成されたトークンをコピー
5. ツール起動時のモーダルに貼り付け

PAT は localStorage に保存されます。設定画面から削除・変更できます。

## 使い方

### タグ付け

1. 左ペインで「採用済み」タブを選択
2. 中央のキャラ一覧からキャラクターを選択（オレンジ枠＝未タグ付け）
3. 右ペインの編集フォームで `生息地タグ` と `属性タグ` を設定
4. 「💾 保存」で即座に localStorage に保存
5. 「次の未タグ付け →」で未タグのキャラに順番に移動

### 新規採用

1. ヘッダーの「✅ 新規採用」ボタンをクリック
2. 必要事項を入力して「確認」→「確定して追加」
3. localStorage に保存され、ヘッダーの「未反映 X件」バッジが更新される

### vocab-app への反映

1. ヘッダーの「🔄 vocab-appに反映」ボタンをクリック
2. 確認ダイアログで「反映する」を押す
3. GitHub API 経由で `ETYMON_NAMES.md` のキャラクター一覧テーブルが一括更新される

### タグマスタ管理

「⚙️」ボタン → 設定画面でタグの追加・リネーム・削除が可能。

### エリアスプライト設定

キャラクターと同じ設定・反映フローで、エリア（ハビタット）ごとの背景スプライトを
設定できます。

1. ヘッダーの「🗺️ エリア」ボタンをクリック
2. 「🔄 vocab-appから取得」で最新のエリア一覧を取得（初回は同梱の
   `areas_cache.json` が使われる。`npm run fetch:areas` でも更新可）
3. 各エリアに **スプライト画像パス / URL** を入力（入力は即 localStorage に保存）
   - 画像は vocab-app の `public/` 配下に置き、そのパス（例: `/areas/elmuria.png`）を入力
   - 外部 URL も可。フォールバック画像は任意
4. 「🔄 vocab-appに反映」で GitHub API 経由 `lib/habitatSprites.json` を一括更新
5. vocab-app 側はこの JSON を直接読み、非遭遇時は「現在地」表記の背景、遭遇時は
   出現エティモンの背景としてスプライトを表示する

`sprite` が空欄のエリアは vocab-app では従来どおり画像なしで表示されます。

## ETYMON_NAMES.md フォーマット仕様

| フィールド | 型 | 説明 |
|---|---|---|
| 内部ID | 文字列 | 英数字（ハイフン可）。ポケモン ID またはカスタム識別子 |
| 基本形 | 文字列 | 第 1 進化前の名前。未設定は `—` |
| 中間形 | 文字列 | 3 段階進化の中間名。未設定は `—` |
| 最終形 | 文字列 | 最終的な採用名。未設定は `—` |
| ステージ | 数値/文字 | `2`、`3`、`単独`、または `—`（未定） |
| 動物イメージ | 文字列 | モチーフとなる動物。未設定は `—` |
| status | 文字列 | `confirmed`、`pending`、`rejected` |
| section | 文字列 | `A`〜`E`、`standalone`、`—`（未定） |
| habitat | 文字列 | 生息地タグ。複数は `・` 区切り |
| type | 文字列 | 属性タグ。複数は `・` 区切り |
| memo | 文字列 | 不採用理由・備考など自由記述 |
