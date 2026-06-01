require('dotenv').config(); // .envファイルを読み込む
const express = require('express');
const { Pool } = require('pg'); // PostgreSQLに接続するための部品

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());


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

        res.status(201).json(result.rows);


        
    } catch (err) {
        console.error("データ追加エラー:", err)
        res.status(500).json({error: "データベースにデータを追加できませんでした"});

    }
});

//DELETE API
app.delete('/api/tasks/:task_id', async (req,res) => {
    try {
        const { task_id } = req.params;

        const query = 'DELETE FROM task WHERE task_id = $1 RETURNING *;';
        const values = [task_id];

        const result = await pool.query(query,values);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "指定されたタスクが見つかりませんでした"});
        }

        res.status(200).json({
            message: "タスクを削除",
            deleted_task: result.rows
        });
    } catch (err) {
        console.error("データ削除エラー");
        res.status(500).json({ error: "データベースからデータを削除できませんでした"});
    }
});

//PATCH API
app.patch('/api/tasks/:task_id', async (req,res) => {
    try{
        const { task_id } = req.params;
        const { status } = req.body;

        const query = 'UPDATE task SET status = $1 WHERE task_id = $2 RETURNING *;';
        const values = [status,task_id];

        const result = await pool.query(query,values);

        if (result.rows.length === 0) {
            return res.status(404).json({error: "指定されたタスクが見つかりませんでした"});
        }

        res.status(200).json({
            message: "タスクを編集",
            patch_task: result.rows
        });
    } catch(err){
        console.error("データ編集エラー");
        res.status(500).json({error: "データベースからデータを編集できませんでした"})

    }

});

app.listen(PORT, () => {
    console.log(`サーバーが起動しました: http://localhost:${PORT}`);
});
