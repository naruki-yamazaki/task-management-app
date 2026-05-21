require('dotenv').config(); // .envファイルを読み込む
const express = require('express');
const { Pool } = require('pg'); // PostgreSQLに接続するための部品

const app = express();
const PORT = process.env.PORT || 3000;

// PostgreSQLへの接続設定（.envファイルから自動で読み込まれます）
const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

// 【テスト用API】ブラウザでアクセスしたときに、データベースと通信する
app.get('/api/test-db', async (req, res) => {
    try {
        // データベースに「現在の時刻を教えて」と命令（SQL）を送る
        const result = await pool.query('SELECT NOW();');
        res.json({
            message: "DockerのPostgreSQLと通信成功しました！",
            db_time: result.rows[0].now
        });
    } catch (err) {
        console.error("接続エラー:", err);
        res.status(500).json({ error: "データベースに接続できませんでした" });
    }
});

app.listen(PORT, () => {
    console.log(`サーバーが起動しました: http://localhost:${PORT}`);
});
