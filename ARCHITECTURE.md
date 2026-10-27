# 設計

## 目的と実装範囲

五線譜の三和音を4択で答える学習用SPAです。自然音C〜Bをルートとするメジャー／マイナー14コード、ト音記号、基本形、調号なしに限定します。構成音の完全な一覧と操作仕様は[README.md](README.md)に記載しています。

承認済み計画の実装範囲は、型付き音楽データ、出題・回答状態、スマートフォン向け画面、SVG楽譜、静的／統合／ブラウザテスト、既存SWAへの品質ゲート付き配信、開発・設計文書です。ログイン、音声、難易度・音域設定、転回形、ヘ音記号、履歴、永続保存、PWA、オフライン保証、PRプレビュー、新規Azureリソースは対象外です。

## 技術選定

React 19とTypeScript 5.9で画面と状態を構成し、Vite 8でビルドします。TypeScript strictとESLint 10を使用し、typescript-eslintのpeer条件（TypeScript 6.1未満）との互換性を維持します。Tailwind CSS 4はViteプラグインで統合します。Node.jsは24系、依存の再現はnpmのlockfileが担います。

楽譜はVexFlow 5のSVG描画を採用します。音符配置、臨時記号、加線を手作業で描画するのではなく、楽譜専用ライブラリへ委ねます。実際のimportは`vexflow/bravura`で、このパッケージエントリーにbase64で含まれるBravura・Academico・AcademicoBoldを同梱します。追加フォントパッケージ、CDN、実行時の外部フォント取得は不要です。同梱はオフライン動作の保証ではなく、Service Workerは導入しません。

フォントの配布通知は`public/third-party-notices.txt`として同梱します。VexFlow 5.0.0のupstream lockfileにある`@vexflow-fonts/bravura@1.0.2`と`@vexflow-fonts/academico@1.0.1`のWOFF2を埋め込みデータと照合し、対応する著作権表示・OFL全文を保持しています。VexFlowやReact等の依存ライセンスはViteの`build.license`が`dist/dependency-licenses.txt`へ出力します。フォントのライセンスはVexFlow自体のMITライセンスとは別です。

フォントと描画ライブラリを含むため、JavaScriptのバンドルは大きめになります。実装時点のビルド報告では約948 kB（gzip約459 kB）で、依存更新やビルド条件によって変動します。サイズや初期表示速度の性能上限は約束していません。

小さな単一画面であり、サーバーと共有するデータもないため、Reactのローカルstateで完結します。状態管理ライブラリ、クライアント／バックエンドのルーター、API、DBを追加しません。成績のlocalStorage等への保存もなく、アプリの再起動で初期化します。Azure接続情報やSecretをブラウザへ渡す必要はありません。

## データと出題の分離

`src/music/chords.ts`はコードの識別子・表示名・種別と、3音の音名・オクターブ・臨時記号を明示する型付きデータを保持します。ルートはC4〜B4です。たとえばBメジャーはB4・D♯5・F♯5、BマイナーはB4・D5・F♯5であり、同じ半音の別名へ置き換えません。音程の正しさと和音としての綴りは別々に保証します。

`src/quiz/questions.ts`は出題と選択肢生成の純粋関数を担当します。初回は14コード、その後は直前を除く13コードから選びます。正解・同ルート別種別・他ルートの2コードを重複なく選び、4択をシャッフルします。乱数を外部から受け取れる形にしてテストを再現可能にし、通常実行では標準の乱数を使います。

音楽データや出題ロジックをVexFlowの型・DOMから独立させることで、表記と選択肢の検証を描画の都合に依存させません。

## 回答状態

`src/quiz/useQuiz.ts`は未回答／回答済みを区別した状態と成績を管理します。

| 現在の状態 | 操作 | 次の状態と副作用 |
| --- | --- | --- |
| 初期化 | 起動 | 初問を生成し、未回答・正解数0・回答数0 |
| 未回答 | 4択のいずれかを回答 | 回答済みへ遷移し、回答数を1加算。正答時のみ正解数を1加算 |
| 回答済み | 再回答・連打 | 状態と成績を変更しない |
| 回答済み | 次の問題 | 直前とは異なる問題を生成。判定と選択状態を消し、成績は維持 |
| 任意 | リロード | メモリ内stateを破棄して初期化 |

判定は回答時に一度だけ確定し、自動で次問へ進みません。選択肢の無効化だけに依存せず、状態更新でも重複回答を拒否します。レンダーやeffectの再実行を成績加算の契機にしません。

## 画面と楽譜

`App`が楽譜・4択・判定・次問・成績を組み合わせ、`AnswerChoices`が選択肢と操作を担当します。ネイティブbutton、44×44 CSS px以上の操作領域、320 CSS px幅での収まりを重視します。結果は文字とライブリージョンで通知し、次問操作後のフォーカスを管理します。

`main.tsx`は読み込み中の表示後、`ChordStaff`が提供する`prepareNotation()`を待ちます。この関数は`document.fonts.load()`でBravuraとAcademicoを読み込み、読み込まれたフォントの存在と状態を確認します。成功後に初問を生成してAppを表示し、失敗時は`console.error`で記録して共通の`ErrorNotice`へ切り替えます。

`ChordStaff`は音楽データからVexFlow用の音符と臨時記号を作り、SVGを描画します。再描画と後始末をこの境界で扱い、StrictMode・次問・リサイズでもSVGを重複させません。読み上げ用の構成音説明は回答前の正解コード名を漏らしません。`QuizErrorBoundary`は楽譜だけでなくQuiz全体を覆い、描画失敗を`console.error`へ記録します。失敗時は選択肢を残さずQuiz全体をエラー画面と再読み込み導線に置き換えます。

## テストトロフィーとE2E

静的チェックと利用者に近い統合テストを中心に、価値のある純粋関数テストと厚めのブラウザE2Eを組み合わせます。実装内部の細かな呼び出しや大量のモックを主要な保証にはしません。

| 層 | 検証対象 |
| --- | --- |
| TypeScript strict／ESLint | 型の整合性、React Hooks等の静的な誤り |
| Vitestの純粋関数テスト | 独立した14コード期待値、音程・綴り、直前除外、4択の一意性と構成 |
| Testing Library統合テスト | 正答／誤答、成績、回答拒否、次問リセット、通知・フォーカス、描画エラー |
| Playwright操作テスト | 本番ビルドでの実操作、累積成績、リロード、タッチ、キーボード、幅320px、SVG重複防止 |
| Linux Desktop Chromium画像比較 | 全14コードの実SVGの音符位置・臨時記号・加線 |

`src/test/setup.ts`は共通セットアップを置き、`e2e/`はブラウザシナリオを置きます。jsdomのSVG計測制約に対応する置き換えは描画境界に限定します。Playwrightでは実際のVexFlowと同梱フォントを使用します。テスト側の固定入力と独立した期待値で確認し、アプリの正解値を読み取っただけで正しさを判断しません。本番用のテスト専用URLや正解暴露APIは設けません。

Playwright 1.64.1のDesktop Chromium・モバイルChromium・モバイルWebKitを使用します。画像比較はLinux Desktop Chromiumだけに限定し、基準画像を構成音表と照合します。モバイルエミュレーションは実機Safariの代替ではなく、フォントや実端末固有の差異は別途確認が必要です。

基準画像の更新時は、自動比較だけでなく構成音表に基づく目視確認も行います。画像生成の成功と、楽譜としての正しさは区別して検証します。

初回実装では、ローカルUbuntu 22.04で全14コードの目視照合・3ブラウザプロジェクトの座標検証・14枚の基準画像比較を完了しました。最終E2Eは82件成功・1件意図的スキップです。CIのUbuntu 24.04では未実行のため、ローカル成功をCI成功とは扱いません。検証環境と詳細は[README.md](README.md#初回実装の検証記録2026-10-27)に記載しています。

## 品質ゲートと成果物の配信

既存Azure workflowはmain向けPRを検証専用とし、main pushだけを本番配信候補にします。Ubuntu 24.04でlockfileから復元し、型チェック、lint、Vitest、本番ビルド、Playwrightを順に実行します。ブラウザはChromiumとWebKitを`--with-deps`で導入します。E2Eはビルド済みdistをVite previewで配信し、テスト後の再ビルドはありません。

成功したchecks jobはdistをimmutable artifactとして保存し、そのartifact IDをdeploy jobへ渡します。deploy jobはそのIDを指定して取得し、`index.html`と`staticwebapp.config.json`の存在を確認します。SWA actionには`app_location: dist`、空の`output_location`と`api_location`、`skip_app_build: true`と`skip_api_build: true`を指定します。ビルド・ブラウザテスト・配信の間で成果物を作り直しません。

失敗時はPlaywrightレポート・trace・画像差分を14日間保存します。成功distは7日間保存します。チェックの失敗は配信を停止し、既存の公開内容を変更しません。

OIDCはdeploy jobのgithub-scriptに提供される`core.getIDToken()`を使用します。既存の`AZURE_STATIC_WEB_APPS_API_TOKEN_GENTLE_SEA_07C4C7800`とともにSWA actionへ渡します。`id-token: write`はdeploy jobだけに付与し、その他は`contents: read`だけです。PRにはAzure SecretやOIDCを渡さず、PR upload／close jobも設けません。

## 配信順序の保証と限界

deploy jobだけを直列化すると、テスト完了順の逆転によって古い成果物が後から配信される可能性があります。そこでworkflow全体をrefごとのconcurrency groupに含め、`cancel-in-progress: false`で検証から配信まで直列化します。GitHubはFIFOを保証せず、待機中の実行を置き換えるため、各コミットが必ず配信されるわけではありません。

さらに配信直前にmainの現在SHAをGitHub APIで取得し、実行のSHAと不一致ならnoticeを残してスキップします。APIやOIDC取得の失敗は成功扱いにしません。古い実行の再実行も最新mainでなければ配信しません。

SHA確認とAzureへの送信は原子的な操作ではありません。確認後に新しいpushが来た場合、進行中の旧SHAが一時的に配信される可能性はありますが、新しい実行の配信はその完了後になるため、このworkflowで配信済みの新しい内容を古い実行が後から上書きすることはありません。別workflowや手動のAzure操作はこのロックの対象外です。

## SWA設定と運用上の未確認事項

Viteは`public/staticwebapp.config.json`をdist直下へコピーします。設定は`/index.html`へのnavigation fallbackを持ち、`/assets/*`と列挙した静的ファイル拡張子を除外します。対象の存在しない静的ファイルにSPAのHTMLを返さず404にし、認証やロールによる制限は追加しません。複数のワイルドカードを含む`/*.*`はSWAでサポートされないため、公式の`/*.{拡張子,...}`形式を使います。assets外に新しい種類の静的ファイルを追加する場合は除外拡張子も更新します。未知の画面URLへのfallbackは配信設定であり、アプリ側にルーターを追加するものではありません。

Vite previewはSWAの配信ルールを再現しません。GitHub上のworkflow成功と実際のSWAでのアセット配信・欠落ファイル404・画面fallbackは別の確認です。公開URLおよび実際のデプロイ成功は未確認であり、公開済みとは主張しません。許可されたpush後にAzureとGitHubで結果を確認し、実端末を含む起動・回答・次問・リロードを確認します。
