# 燕彩 ENSAI LP — スマホ可読性修正版

FV v2を基準に、375〜390pxで読める文字サイズと配置へ修正したデータ一式です。
変更点は `MOBILE_CHANGES.md`、確認済み／未確認は `QA_REPORT.md` を参照してください。
ENSAI は職業訓練の課題として制作している架空のブランド・店舗です。開店日・価格・特典などは制作課題上の設定であり、実在店舗の営業情報を確認したものではありません。
最初に `HANDOFF.md` を読み、Work への開始指示には `WORK_START.txt` を使ってください。

## まず表示する

1. ZIP を展開します。フォルダー構成はそのままにしてください。
2. ターミナルで、この `README.md` と `index.html` があるフォルダーへ移動します。
3. Python 3 が使える環境で、次のコマンドを実行します。

   ```sh
   python3 -m http.server 8000 --bind 127.0.0.1
   ```

   Windows で `python3` が使えない場合は `py -m http.server 8000 --bind 127.0.0.1` を使います。
4. WebGL 対応ブラウザーで `http://127.0.0.1:8000/` を開きます。
5. 終了するときは、ターミナルで Ctrl+C を押します。

3D 部分が JavaScript モジュールを読み込むため、`index.html` のダブルクリックによる `file://` 表示では動作しない場合があります。上記のローカルサーバー、または Work のプレビューサーバーを使ってください。Node.js や npm のインストールは閲覧に必須ではありません。

## 主なファイル

- `index.html`：LP の本文・構造。FV は最新 v2
- `styles.css`：元のLPの見た目・レスポンシブ設定（変更なし）
- `mobile.css`：本文・注記の下限と、600px以下のレイアウト調整
- `viewer/mobile.css`：3D画面のスマホ文字・ボタン調整
- `app.js`：LINE／ショップボタン、案内ダイアログ、3D 枠の高さ調整
- `config.js`：LINE とオンラインショップのリンク設定
- `viewer.html`：3D ビューアーの画面
- `viewer/`：3D の CSS、JavaScript。Three.js は `viewer.bundle.js` に同梱
- `assets/`：画像。`assets/viewer/` に 3D 用ロゴ・4 絵柄のテクスチャ
- `references/`：比較用の旧デザイン画像と FV の注釈付き指示画像
- `HANDOFF.md`：採用済みの変更、未解決事項、次に確認すること
- `QA_REPORT.md`：確認できたことと未確認のこと
- `ASSET_MANIFEST.json`：埋め込みから取り出した画像の照合情報
- `THIRD_PARTY_NOTICES.md`：既存コードのライセンス表示
- `tools/verify.py`：構文・参照先・埋め込みデータの再チェック
- `tools/test-app.cjs`：リンク／ダイアログ／高さ連携の簡易テスト（実ブラウザーではないテスト）

画像は別ファイルになっています。HTML に画像を Base64 で埋め込む単一ファイル版は含めていません。フォルダーごと渡してください。

## 公開前に必要な設定

`config.js` の `lineUrl` と `shopUrl` は空欄です。正規の HTTPS URL が分かってから設定してください。空欄のままでは、ボタンを押すと「リンク先は準備中です」と表示されます。

## 素材について

ヒーロー写真と白ロゴは提供された素材です。その他の多くの写真・商品画像は、提供デザイン画像からの切り出しです。高解像度の元画像を受け取り次第、構図を確認して差し替えてください。BLUE MOUNTAIN の背景と器の分離元素材は未受領です。

燕型チャームは提供画像の絵柄を維持しています。LP は `assets/swallow-charm.png` を表示し、編集用の輪郭は `assets/swallow-charm.svg`、その元画像は `assets/charm-source.png` に分離しています。SVG を `<img>` で読み込むと内部の外部画像が表示されないブラウザーがあるため、LP では PNG を使用します。チャームやロゴを新しく生成したものではありません。

## 確認状況

JavaScript 構文、相対参照、画像ファイル、埋め込みデータの除去、元ファイルの保持を確認しています。
今回の環境にはSitesスキル指定のブラウザー確認機能がないため、実画面・WebGL・スマートフォン実機は未確認です。375px／390pxの本文16px・注記12px以上は静的CSS解析で確認しています。実表示の確認箇所は `MOBILE_CHANGES.md`、詳しい検証結果は `QA_REPORT.md` を参照してください。

## 静的チェックを再実行する

フォルダー内で `python3 tools/verify.py` を実行します。Node.js があれば JavaScript 構文もチェックします。リンク処理の簡易テストは `node tools/test-app.cjs` で実行できます。これらは実ブラウザー・WebGL の検証を代替しません。
