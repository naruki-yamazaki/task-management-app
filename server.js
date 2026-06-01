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

// GET API
app.get('/api/tasks', async (req, res) => {
    try {
        // データベースに現在の時刻を持ってくるように命令を送る
        const result = await pool.query('SELECT * FROM task ORDER BY task_id ASC;');

        
        res.json(result.rows);
    } catch (err) {
        console.error("接続エラー:", err);
        res.status(500).json({ error: "データベースに接続できませんでした" });
    }
});

//POST API
app.post('/api/tasks', async (req, res) => {
    try {
        const { title, user_id } = req.body;

        const query = 'INSERT INTO task (title, user_id, status) VALUES ($1, $2, 0) RETURNING *;';
        const values = [title, user_id];

        const result = await pool.query(query, values);


        res.status(201).json(result.rows[0])
        
    } catch (err) {
        console.error("データ追加エラー:", err)
        res.status(500).json({error: "データベースにデータを追加できませんでした"});

    }
});

app.listen(PORT, () => {
    console.log(`サーバーが起動しました: http://localhost:${PORT}`);
});
