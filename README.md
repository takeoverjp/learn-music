# learn-music

五線譜に表示された三和音のコード名、または有名なクラシック曲のメロディを4択で答える、日本語・スマートフォン優先の学習アプリです。ReactとVexFlowでブラウザ内だけで動作し、ログインやAzure接続はローカル起動に不要です。

## 使い方と出題範囲

「コード」または「名曲メロディ」を選び、楽譜を見て4択に答えます。名曲メロディでは再生ボタンで表示中の旋律を聴けます。回答はその場で確定し、再選択できません。「次の問題」を押すまで同じ問題を保持します。問題数の上限はなく、クイズの種類ごとに正解数と回答数を表示します。成績はメモリ内だけに保持し、リロードで初期化します。

自然音7ルートのメジャー／マイナー、計14コードが対象です。ト音記号・基本形・調号なしで、ルートをC4〜B4に固定し、第三音と第五音を上へ積みます。♯・♭は各音の臨時記号として表示します。C4は中央ドです。

| コード | 種別 | ルート | 第三音 | 第五音 |
| --- | --- | --- | --- | --- |
| C | メジャー | C4 | E4 | G4 |
| Cm | マイナー | C4 | E♭4 | G4 |
| D | メジャー | D4 | F♯4 | A4 |
| Dm | マイナー | D4 | F4 | A4 |
| E | メジャー | E4 | G♯4 | B4 |
| Em | マイナー | E4 | G4 | B4 |
| F | メジャー | F4 | A4 | C5 |
| Fm | マイナー | F4 | A♭4 | C5 |
| G | メジャー | G4 | B4 | D5 |
| Gm | マイナー | G4 | B♭4 | D5 |
| A | メジャー | A4 | C♯5 | E5 |
| Am | マイナー | A4 | C5 | E5 |
| B | メジャー | B4 | D♯5 | F♯5 |
| Bm | マイナー | B4 | D5 | F♯5 |

初問は14コードからランダムに選び、以後は直前と同じコードを除外します。4択は正解・同じルートの別種別・他ルートのコード2個で構成し、重複なくシャッフルします。

名曲メロディは、著作権保護期間が終了した次の6作品を、曲当て用に2小節へ整えた短い旋律で出題します。初問は6曲からランダムに選び、以後は直前と同じ曲を除外します。正解を含む重複のない4択をシャッフルします。

| 曲名 | 作曲者 |
| --- | --- |
| 交響曲第9番「歓喜の歌」 | ベートーヴェン |
| エリーゼのために | ベートーヴェン |
| アイネ・クライネ・ナハトムジーク | モーツァルト |
| 「四季」より 春 | ヴィヴァルディ |
| メヌエット ト長調 | ペツォールト |
| カノン | パッヘルベル |

再生音は同梱した音符データからWeb Audio APIでブラウザ内生成し、録音音源や外部配信サービスを使用しません。楽譜と再生は同じ音高・音価データを参照します。

320 CSS px幅での表示、44×44 CSS px以上のタップ領域、キーボード操作、フォーカス表示、正誤の文字表示とライブ通知を対象にしています。楽譜には音の読み上げ用説明を設け、回答前に正解名を含めません。描画に失敗した場合はエラーと再読み込み導線を表示し、再生に失敗した場合も画面上で明示します。

対象外はログイン・認可、録音音源、難易度設定、転回形、ヘ音記号、セブンス等の拡張コード、成績履歴、永続化、PWA、オフライン保証です。

## ローカル開発

Node.js 24系（`.node-version`）とnpmを使用します。依存関係は`package-lock.json`で固定します。

```sh
npm ci
npm run dev
```

Viteが表示するローカルURLをブラウザで開いてください。スマートフォンから確認する場合は、同じ信頼できるLAN内で次を実行し、端末から開発PCのLANアドレスと表示されたポートへ接続します。

```sh
npm run dev -- --host 0.0.0.0
```

これは開発サーバーを全ネットワークインターフェースで待ち受けさせます。公共Wi-Fiやインターネットへの公開は避け、OSのファイアウォールと接続範囲を確認してください。

技術構成はReact 19、TypeScript 5.9、Vite 8、Tailwind CSS 4のViteプラグイン、VexFlow 5、ESLint 10です。TypeScriptはtypescript-eslintのpeer条件（6.1未満）との互換性を保ちます。`vexflow/bravura`エントリーに含まれるbase64のBravura・Academico・AcademicoBoldを同梱するため、追加のフォントパッケージや実行時CDN、外部フォント取得は不要です。起動時にBravuraとAcademicoの読み込み完了を待ってからクイズを表示します。初期化・描画の失敗はコンソールへ記録し、選択肢を表示せず再読み込み画面に切り替えます。

アプリの設定に秘密情報は不要です。クライアントにAPIキー・AzureのSecret・トークンを埋め込まないでください。`VITE_`環境変数も公開される値です。バックエンド、API、DB、クライアントルーター、localStorage等の永続保存はありません。メロディ再生にはブラウザ標準のWeb Audio APIを使用します。

### 同梱ライセンス

フォントの著作権表示とSIL Open Font License 1.1全文は[public/third-party-notices.txt](public/third-party-notices.txt)に保持し、配信時は`/third-party-notices.txt`で参照できます。VexFlow 5.0.0に埋め込まれたフォントと、同バージョンのupstream lockfileが指定するBravura 1.0.2／Academico 1.0.1パッケージのWOFF2が一致することを確認したうえで、そのパッケージのライセンスを転載しています。Academicoの通知はBoldも対象です。

VexFlow・React等のJavaScript依存ライセンスは、Viteの`build.license`設定で本番ビルド時に`dist/dependency-licenses.txt`へ自動出力します。配信時の参照先は`/dependency-licenses.txt`です。フォントの埋め込みは通常のnpm依存一覧だけでは捕捉できないため、フォント通知は別途同梱します。

両ファイルを本番成果物のルートに配布します。`dependency-licenses.txt`は開発サーバーでは生成されないため、確認にはビルド後のpreviewを使ってください。画面にライセンスへのリンクは設けません。SWAのフォールバックは`.txt`を除外しており、通知ファイルが欠落した場合にアプリのHTMLで置き換えません。

## チェックとテスト

| コマンド | 用途 |
| --- | --- |
| `npm run typecheck` | TypeScript strictの型チェック |
| `npm run lint` | ESLint、警告も失敗扱い |
| `npm run test` | VitestとTesting Libraryの一括実行 |
| `npm run test:watch` | Vitestの監視実行 |
| `npm run build` | 型チェック後にViteで`dist/`を生成 |
| `npm run preview` | 生成済み`dist/`のローカル配信 |
| `npm run test:e2e` | ローカル・CI共通の固定Docker環境でPlaywright E2E |
| `npm run test:e2e:ui` | ホスト上のPlaywright調査用UI（操作テストのみ） |

E2Eには起動済みのDocker EngineまたはDocker Desktop（Linuxコンテナ）が必要です。Playwright 1.64.1の公式Ubuntu 24.04イメージをdigestで固定し、ローカル・CIともLinux/amd64で実行します。Node.js 24、ブラウザ、システムライブラリを共通化するため、ホストへのブラウザインストールは不要です。ARMホストではDockerのamd64エミュレーションが必要です。初回はイメージの取得とコンテナ内の`npm ci`を行い、以降はDockerのビルドキャッシュを使います。

```sh
npm run build
npm run test:e2e
```

E2Eは生成済み`dist/`を読み取り専用でコンテナに渡し、Vite previewで配信します。コンテナ内で再ビルドしないため、CIは検証したものと同じ`dist/`を配信します。ソースを変更したら先に再ビルドしてください。Desktop Chromium、モバイルChromium、モバイルWebKitでクイズ切替・回答・次問・成績・メロディ再生・リロード・タッチ・キーボード・レスポンシブ表示を確認します。モバイルはエミュレーションであり、実機Safariの動作保証ではありません。

`npm run test:e2e -- --project=visual-chromium-linux`のようにPlaywrightの引数も渡せます。調査用UIだけはホスト上で動くため、事前に`npx playwright install --with-deps chromium webkit`を実行してください（Linuxでは管理者権限が必要な場合があります）。UIでは環境依存の画像比較を実行せず、操作テストだけを対象にします。

テストトロフィーの考え方に沿い、静的チェックと利用者の操作に近い統合テストを土台にし、小さな純粋関数テストとブラウザE2Eを組み合わせます。音楽データと出題条件は独立した期待値・固定乱数で検証します。jsdomでSVG描画を代替しても、実ブラウザではVexFlowを実描画します。14コードの音符位置・臨時記号・加線は、LinuxのDesktop Chromium専用プロジェクトで楽譜領域のスクリーンショット基準画像と比較します。SVGが存在するだけでは正確な楽譜の検証になりません。基準画像を更新する際は構成音表と照合し、差分を確認してください。

基準画像を意図的に更新する場合も、必ず共通コンテナ経由で次を実行し、全14コードを構成音表と照合してください。画像を生成できたことだけで正しい楽譜と判断せず、差分と音符・臨時記号・加線を確認します。

```sh
npm run test:e2e -- --project=visual-chromium-linux --update-snapshots
```

失敗時はホストに出力される`playwright-report/html/`と`test-results/playwright/`のレポート・trace・画像差分を調べます。`npx playwright show-report playwright-report/html`でHTMLレポートを開けます。画像比較はOS、フォント、ブラウザに依存するため、共通コンテナ以外で基準を上書きしないでください。Playwright更新時は`package.json`・lockfileと`e2e/Dockerfile`のバージョン・digestを揃え、画像差分を確認してください。

### 初回実装の検証記録（2026-10-27）

ローカルUbuntu 22.04で、基準画像生成前に全14コードの楽譜画像を独立した構成音表と目視照合しました。3つのブラウザ操作プロジェクトで音符・臨時記号・加線の座標を検証し、その後に生成した14枚のPNG基準画像との比較も成功しています。最終の本番ビルドに対するPlaywright結果は82件成功・1件意図的スキップ（デスクトップのタッチ専用テスト）です。320px幅の横スクロール修正も3プロジェクトで確認済みです。

これはローカルの検証結果です。WebKitはローカルに展開した不足ライブラリを`LD_PRELOAD`で指定して実行しました。この環境対応をアプリやCI設定には含めていません。Ubuntu 22.04で生成した基準画像はGitHub Actions（Ubuntu 24.04）のレンダリングと約72ピクセル差が出て失敗したため、基準画像を同CIの実画像に差し替えました。差し替え前に全14コードを構成音表と目視照合済みです。差し替え後のCI再実行結果とSWAへの配信成功は未確認です。

## Azure Static Web Appsへの配信

既存の`.github/workflows/azure-static-web-apps-gentle-sea-07c4c7800.yml`を使用します。新しいAzureリソースやPRプレビューは作成しません。

| イベント | 実行内容 |
| --- | --- |
| main向けPRの作成・更新・再オープン・レビュー準備完了 | 品質チェックのみ。Azure Secret・OIDC・デプロイを使用しない |
| mainへのpush | 同じ品質チェックを実施し、全成功かつ配信直前に最新mainのSHAと一致する場合のみ配信 |
| PRのclose | 実行しない。プレビューの作成・close jobなし |

Ubuntu 24.04とNode.js 24で`npm ci`、型チェック、lint、Vitest、本番ビルド、Chromium/WebKitの`--with-deps`インストール、Playwrightを順に実行します。失敗を無視して配信する経路はありません。失敗レポートは14日間、全チェック成功後の`dist`は7日間artifactとして保持します。E2Eより前の失敗ではPlaywrightレポートが存在しない場合があります。

deploy jobはchecks jobが返すartifact IDで**その実行のブラウザ検証済みdist**を取得します。再ビルドや依存関係のインストールは行いません。`app_location: dist`、`output_location: ""`、`api_location: ""`、`skip_app_build: true`、`skip_api_build: true`でSWAへ送信します。

既存Secret名は`AZURE_STATIC_WEB_APPS_API_TOKEN_GENTLE_SEA_07C4C7800`です。値はGitHubの設定で管理します。OIDCはdeploy jobの`actions/github-script`に提供される`core.getIDToken()`で取得し、既存の連携を維持します。通常の権限は`contents: read`だけで、`id-token: write`はdeploy jobだけに付与します。OIDC取得のための追加`npm install`はありません。

### 古い実行による上書きの防止

workflow全体をworkflow名とrefごとのconcurrency groupで直列化し、`cancel-in-progress: false`で配信中の実行を自動中断しません。deploy jobだけの直列化では、古いコミットのテストが遅れて完了し、新しいコミットの配信後に上書きする可能性があります。そのためテストから配信まで同じロックの範囲に置き、さらに配信直前にGitHub APIから取得したmainのSHAと実行のSHAを比較します。不一致ならnoticeを残して配信をスキップし、OIDCも取得しません。古い実行の再実行も同じ判定を受けます。

GitHubのconcurrencyはFIFOを保証せず、待機中の実行が新しい待機実行に置き換わることがあります。すべてのpushが配信される設計ではありません。SHA確認後にpushされた場合、進行中の旧SHAの配信は完了できますが、新しい実行はその後に開始するため、**新しい実行が配信した内容を古い実行が後から上書きすることは防ぎます**。最新コミットのチェックが失敗した場合は、最後に正常配信された内容を維持します。この制御はこのworkflow経由の配信が対象で、手動のAzure操作や別workflowの配信をロックしません。

### 配信ルールと公開後の確認

`public/staticwebapp.config.json`はViteにより`dist/`直下へコピーされます。存在しない画面URLは`/index.html`へフォールバックしますが、`/assets/*`と設定に列挙した拡張子（HTML、CSS、JS、JSON、画像、フォント、テキスト等）は除外します。欠落したJS・CSS・フォント・画像等にアプリのHTMLを返してエラーを隠しません。SWAがサポートする`/*.{拡張子,...}`形式を使い、未対応の`/*.*`は使用しません。新しい種類のファイルをassets外で配信する際は除外拡張子も更新してください。認証必須のrouteやロール制限はありません。

**Vite previewはSWA固有のフォールバックや配信ルールを検証しません。** 公開URLとデプロイ成功は、このリポジトリの設定だけでは確認できません。公開済みとは扱わず、許可されたmain pushの後にGitHub ActionsとAzureで実際のURL・配信結果を確認してください。

公開後は起動、正答／誤答、次問、リロード、未知の画面URLのフォールバック、実際のアセットのContent-Type、欠落アセット・欠落ファイルの404を確認します。配信失敗時はchecksの最初の失敗、artifactの有無、古いSHAのスキップnotice、Secretの設定とOIDC権限、SWA actionのログの順に調べます。Secretの値をログやissueへ貼り付けないでください。

設計判断は[ARCHITECTURE.md](ARCHITECTURE.md)、変更時の作業情報は[AGENTS.md](AGENTS.md)を参照してください。
