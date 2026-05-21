const express = require('express');
const app = express();
const PORT = 3000;

// パソコンのブラウザからアクセスされたときに「Hello World」を返す
app.get('/', (req, res) => {
    res.send('タスク管理アプリのサーバーが起動しました！');
});

// サーバーを起動して待機状態にする
app.listen(PORT, () => {
    console.log(`サーバーが起動しました: http://localhost:${PORT}`);
});
