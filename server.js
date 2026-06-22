require('dotenv').config(); // .envファイルを読み込む
const express = require('express');
const cors = require('cors');//フロントからのアクセス許可
const { Pool } = require('pg'); // PostgreSQLに接続するための部品

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());//全てのオリジンからのリクエストを許可
app.use(express.json());


// PostgreSQLへの接続設定
const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

// GET API
// GET API: タスク一覧取得（カテゴリー名も一緒に取得）
app.get('/api/tasks', async (req, res) => {
    try {
        // taskテーブルとcategoriesテーブルを結合して取得
        const query = `
            SELECT t.*, c.category_name 
            FROM task t
            LEFT JOIN categories c ON t.category_id = c.category_id
            ORDER BY t.task_id ASC;
        `;
        const result = await pool.query(query);
        res.json(result.rows);
    } catch (err) {
        console.error("接続エラー:", err);
        res.status(500).json({ error: "データベースに接続できませんでした" });
    }
});

//POST API
// POST API: タスク新規追加（category_id も保存）
app.post('/api/tasks', async (req, res) => {
    try {
        // 💡 due_date を新しく受け取る
        const { title, user_id, category_id, due_date } = req.body; 

        if (!title || title.trim() === '' ) {
            return res.status(400).json({ error: "タスクのタイトルを入力してください"})
        }
        if (!user_id) {
            return res.status(400).json({ error: "ユーザーIDが指定されていません"})
        }

        // 💡 SQLに due_date ($4) を追加
        const query = 'INSERT INTO task (title, user_id, status, category_id, due_date) VALUES ($1, $2, 0, $3, $4) RETURNING *;';
        // 💡 値の配列の4番目に due_date を追加
        const values = [title, user_id, category_id, due_date];

        const result = await pool.query(query, values);
        res.status(201).json(result.rows);
        
    } catch (err) {
        console.error("データ追加エラー:", err);
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

        if (status === undefined || typeof status !== 'number') {
            return res.status(400).json({ error : "正しいステータスを指定してください"})
        }

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

//カテゴリー一覧取得 API
app.get('/api/categories', async (req, res) => {
    try {
        // categories テーブルからすべてのデータをID順に取得
        const result = await pool.query('SELECT * FROM categories ORDER BY category_id ASC;');

        
        // 取得したデータをJSON形式でクライアントに返す
        res.json(result.rows);
    } catch (err) {
        console.error("カテゴリー取得エラー:", err);
        res.status(500).json({ error: "カテゴリー情報を取得できませんでした" });
    }
});

app.listen(PORT, () => {
    console.log(`サーバーが起動しました: http://localhost:${PORT}`);
});
