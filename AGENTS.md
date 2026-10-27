# 開発作業ガイド

## このアプリの境界

自然音7ルートのメジャー／マイナー14コードを、ト音記号・基本形で4択出題するフロントエンドです。承認済みの範囲は[README.md](README.md)に記載しています。成績はReactのメモリ内stateだけで管理し、リロードで初期化します。バックエンド、API、DB、ルーター、永続保存、ログインはありません。

## ファイルの責務

| 場所 | 責務 |
| --- | --- |
| `src/music/chords.ts` | 型付き14コード定義、音名・オクターブ・臨時記号 |
| `src/quiz/questions.ts` | 乱数を受け取る出題・4択生成・シャッフル |
| `src/quiz/useQuiz.ts` | 未回答／回答済みの遷移、回答拒否、成績 |
| `src/components/ChordStaff.tsx` | フォント準備関数、VexFlow SVG描画、後始末、読み上げ説明 |
| `src/components/QuizErrorBoundary.tsx` | Quiz全体の描画エラー捕捉、ログ、共通エラー画面 |
| `src/components/AnswerChoices.tsx` | 4択の表示と回答操作 |
| `src/App.tsx`、`src/main.tsx`、`src/index.css` | 画面構成、起動、Tailwindと共通スタイル |
| `src/**/*.test.ts(x)`、`src/test/setup.ts` | 純粋関数・統合テストと共通セットアップ |
| `playwright.config.ts`、`e2e/` | 本番ビルドに対するブラウザ操作と画像比較 |
| `public/staticwebapp.config.json` | SWA配信設定。ビルド時にdist直下へコピー |
| `public/third-party-notices.txt` | VexFlowに埋め込まれたフォントの著作権表示とOFL全文 |
| 既存`.github/workflows/azure-static-web-apps-gentle-sea-07c4c7800.yml` | 品質ゲートとmain限定配信 |

## 変更時に保つ条件

TypeScript strictを維持し、VexFlow固有の型は描画境界に閉じ込めます。型・関数・コンポーネントの既存パターンに合わせてください。TypeScript 5.9とtypescript-eslintのpeer条件（6.1未満）、ESLint 10の互換性を依存更新時に確認します。

構成音はREADMEの14コード表を基準とし、半音数だけから異名同音へ置き換えないでください。ルートはC4〜B4、第三音・第五音は上に積み、調号なしで臨時記号を表示します。特にBとBmの第五音はどちらもF♯5です。

出題は直前のコードを除外します。4択は一意で、正解と同ルート別種別、他ルートの2コードを含めます。回答確定後の連打・再回答をロジック側でも拒否し、成績を二重加算しません。React StrictModeで問題の意図しない変更やSVGの重複を起こさないよう、描画の後始末を維持します。

乱数依存の検証には固定入力を使い、独立した期待値と照合します。テスト用の隠しURLパラメーターや正解暴露APIは追加しません。jsdomの制約で描画を置き換える場合も境界を限定し、実際のVexFlow描画はブラウザで検証します。`vexflow/bravura`にbase64で含まれるBravura・Academico・AcademicoBoldを使用し、追加フォントパッケージや実行時CDNは不要です。`main.tsx`で`prepareNotation()`を待ってからAppを表示する初期化と、Quiz全体を覆うエラー境界を保ちます。

320 CSS px幅、44×44 CSS px以上の操作領域、ネイティブbutton、キーボード操作、フォーカス、ライブ通知、色以外での正誤表示を保ちます。楽譜の読み上げ説明に回答前のコード名を含めず、描画失敗はエラーと再読み込み導線で明示します。

Secretやトークンをソース・クライアント環境変数・ログへ記載しないでください。AzureのSecretはdeploy jobだけが使用します。

VexFlowやフォントを更新する場合は、埋め込みフォントの配布元・バージョンと`public/third-party-notices.txt`を照合してください。著作者や年を推測せず、対応する配布物の通知を保持します。JavaScript依存の通知はViteの`build.license`で自動生成しますが、埋め込みフォントのOFL通知は別に必要です。

## 実行と検証

Node.jsは`.node-version`の24系を使用します。初回は`npm ci`、開発は`npm run dev`です。

変更に対応するテストを実行し、コード変更の統合時には`npm run typecheck`、`npm run lint`、`npm run test`、`npm run build`、`npm run test:e2e`で確認します。`build`も型チェックを実行します。監視は`npm run test:watch`、E2E調査は`npm run test:e2e:ui`です。

E2Eは起動済みのDockerを使い、`npm run test:e2e`からローカル・CI共通の固定Linux/amd64コンテナで実行します。Playwright更新時はlockfileと`e2e/Dockerfile`のバージョン・digestを揃えてください。生成済みdistを読み取り専用で渡してpreviewで配信するので、ソース変更後はビルドしてから実行します。PlaywrightのwebServer内で再ビルドしません。14コードの楽譜画像比較と基準更新は共通コンテナ経由に限定します。更新コマンドは`npm run test:e2e -- --project=visual-chromium-linux --update-snapshots`です。画像更新は構成音・臨時記号・加線の目視確認を伴わせ、別環境の基準画像で置き換えないでください。基準画像生成や自動比較の成功だけを目視確認完了として報告しません。ホスト上の操作テスト用UIだけは`npx playwright install --with-deps chromium webkit`で準備します。モバイルWebKitのエミュレーションと実機Safariの検証は区別します。

配信設定の変更はYAML／JSONの構文とactionの入力を確認し、PRが検証のみであること、全チェック成功後の同一distを配信すること、main SHA確認・workflow全体の直列化・deploy限定OIDC権限を保ちます。Vite previewではSWAルールを保証できません。公開後の確認とローカル検証結果を区別して報告してください。
