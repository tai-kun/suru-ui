# suru-ui

[![Canary Release on NPM](https://github.com/tai-kun/suru-ui/actions/workflows/canary-release.yaml/badge.svg)](https://github.com/tai-kun/suru-ui/actions/workflows/canary-release.yaml)
[![Release on NPM](https://github.com/tai-kun/suru-ui/actions/workflows/release.yaml/badge.svg)](https://github.com/tai-kun/suru-ui/actions/workflows/release.yaml)
[![Test](https://github.com/tai-kun/suru-ui/actions/workflows/test.yaml/badge.svg)](https://github.com/tai-kun/suru-ui/actions/workflows/test.yaml)
[![npm package](https://badge.fury.io/js/suru-ui.svg)](https://badge.fury.io/js/suru-ui)

## TODO

### base

| コンポーネント名           | 状況 | モバイル対応 | 説明 |
| :--------------------- | :-: | :-------: | :-- |
| ButtonBase             |     |           | ボタンの基本的な実装とスタイルを提供します。様々な種類のボタンを作成するために使用できます。 |
| DialogBase             | ✅  |           | ダイアログの基本的な実装とスタイルを提供します。モーダルダイアログやアラートダイアログなど、様々な種類のダイアログを作成するために使用できます。 |
| PopoverBase            | ✅  |           | Popover API を利用したポップオーバーの基本的な実装とスタイルを提供します。ツールチップやメニューなど、様々な種類のポップオーバーを作成するために使用できます。 |

### core

| コンポーネント名           | 状況 | モバイル対応 | 説明 |
| :--------------------- | :-: | :-------: | :-- |
| Accordion              |     |           | 複数のパネルを折りたたみ式で表示することができます。 |
| Alert                  |     |           | 画面端にアラートメッセージを表示するコンポーネントです。情報、警告、エラーなど、様々な種類のメッセージを表示することができます。 |
| AlertDialog            |     |           | モーダルダイアログとして表示されるコンポーネントです。重要なメッセージや確認メッセージを表示する際に使用されます。 |
| Breadcrumbs            |     |           | パンくずリストです。現在のページの位置を視覚的に示すことができます。 |
| Button                 |     |           | 様々なスタイルのバリエーションを持つボタンです。クリックイベントなどを処理することができます。 |
| Checkbox               |     |           | チェックボックスコンです。オン/オフを切り替えることができます。 |
| Dialog                 |     |           | ウィンドウにオーバーレイされるモーダルダイアログです。背後にあるコンテンツはすべて不活性化されます。 |
| Divider                |     |           | コンテンツを区切るための仕切り線です。 |
| Drawer                 |     |           | 画面端に表示されるドロワーメニューコンポーネントです。ナビゲーションメニューなどに使用されます。 |
| Heading                |     |           | 見出しテキストを表示するコンポーネントです。H1 から H5 までのサイズを設定することができます。 |
| Icon                   |     |           | アイコンを表示するコンポーネントです。`suru-ui/icons` で提供されるアイコンの定義をレンダリングします。 |
| IconButton             |     |           | アイコン付きのボタンです。クリックイベントなどを処理することができます。 |
| InlineAlert            |     |           | インラインでアラートが表示されるコンポーネントです。短いメッセージを表示する際に使用されます。 |
| Label                  |     |           | テキストラベルを表示するコンポーネントです。フォーム入力欄などに使用されます。 |
| Link                   |     |           | リンクを作成するコンポーネントです。内部リンクや外部リンクを設定することができます。利便性のために不活性用の `disabled` 属性を持ちます。 |
| Loader                 |     |           | 読み込みアニメーションを表示するコンポーネントです。データ読み込み中などの待ち時間に表示されます。 |
| Menu                   |     |           | リスト形式のドロップダウンメニューです。 |
| MenuList               |     |           | 階層化されたリストを表示するコンポーネントです。 |
| Pagination             |     |           | ページ送りの機能を提供するコンポーネントです。複数ページにわたるコンテンツを分割して表示することができます。 |
| Popover                |     |           | トリガーの周囲に浮かぶ非モーダルダイアログです。ユーザーにコンテキスト情報を表示するために使用され、クリック可能なトリガー要素を組み合わせて使います。 |
| ProgressBar            |     |           | ファイルのダウンロードや画像のアップロードなどのタスクの進行状況を線形に示すために使用できます。 |
| ProgressCircle         |     |           | ファイルのダウンロードや画像のアップロードなどのタスクの進行状況を円形に示すために使用できます。 |
| Radio                  |     |           | ラジオボタンです。複数選択肢から1つを選択することができます。 |
| Select                 |     |           | ドロップダウンのリストコンポーネントです。リストの中から1つの項目を選択することができます。 |
| Suppl                  |     |           | 補足的な情報を表示するコンポーネントです。 |
| Text                   |     |           | テキストを表示するコンポーネントです。様々なスタイルを設定することができます。 |
| TextArea               |     |           | 複数行のテキストを入力できるコンポーネントです。 |
| TextField              |     |           | 1 行のテキストを入力できるコンポーネントです。 |

### lab

| コンポーネント名           | 状況 | モバイル対応 | 説明 |
| :--------------------- | :-: | :-------: | :-- |
| Avatar                 |     |           | プロフィール画像などを表示するアバターコンポーネントです。 |
| Badge                  |     |           | アイコンやテキストの上にバッジを表示するコンポーネントです。新着情報などを表示する際に使用されます。 |
| Clipboard              |     |           | テキストをクリップボードにコピーする機能を提供するコンポーネントです。 |
| CloseButton            |     |           | 閉じるボタンを表示するコンポーネントです。ダイアログやポップオーバーなどを閉じる際に使用されます。 |
| ContextualHelp         |     |           | ポップオーバーなどを用いて、マウスホバーまたはタッチで操作方法や説明を表示することができます。 |
| DataTable              |     |           | データをテーブル形式を表示するコンポーネントです。ソートやフィルタリングなどの機能を備えています。 |
| DateField              |     |           | 日付用の入力コンポーネントです。 |
| InlineBadge            |     |           | インラインで表示されるバッジコンポーネントです。 |
| Keyboard               |     |           | ショートカットキーなどのキーボード操作を受け付けることを表すコンポーネントです。 |
| Menubar                |     |           | 複数の連続に並んだ `Menu` コンポーネントをまとめて表示するコンポーネントです。 |
| Meter                  |     |           | メーターゲージを表示するコンポーネントです。 |
| NumberField            |     |           | 数値用の入力コンポーネントです。 |
| PasswordField          |     |           | パスワード用の入力コンポーネントです。 |
| RangeSlider            |     |           | 範囲を指定するためのスライダーコンポーネントです。 |
| SearchField            |     |           | 検索用の入力コンポーネントです。 |
| Skeleton               |     |           | コンテンツの読み込み中に表示されるプレースホルダーコンポーネントです。 |
| Slider                 |     |           | 数値を指定するためのスライダーコンポーネントです。 |
| Switch                 |     |           | オン/オフを切り替えるスイッチコンポーネントです。 |
| TableGrid              |     |           | テーブル形式でグリッド表示するコンポーネントです。 |
| Tabs                   |     |           | タブ形式でコンテンツを切り替えるコンポーネントです。 |
| Tag                    |     |           | タグを表示するコンポーネントです。ラベルや分類などに使用されます。 |
| TimeField              |     |           | 時刻用の入力コンポーネントです。 |
| Toggle                 |     |           | オン/オフで表示するコンポーネントを切り替えるトグルコンポーネントです。 |
| Tooltip                |     |           | ツールチップを表示するコンポーネントです。ホバー時に説明文などを表示することができます。 |
| TreeView               |     |           | ツリービューを表示するコンポーネントです。階層構造のデータを可視化することができます。 |
