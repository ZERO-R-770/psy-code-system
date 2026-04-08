import { createClient } from '@vercel/kv';

export default async function handler(req, res) {
  try {
    const kv = createClient({
      url: process.env.KV_REST_API_URL,
      token: process.env.KV_REST_API_TOKEN,
    });

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    
    // 存入数据库：24小时有效(86400秒)，初始使用次数0
    await kv.set(code, JSON.stringify({ usedCount: 0 }), { ex: 86400 });

    res.status(200).json({ code, message: "验证码已生成，24h内有效" });
  } catch (error) {
    res.status(500).json({ error: error.message, details: "数据库连接失败" });
  }
}
