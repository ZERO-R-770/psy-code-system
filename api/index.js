import { createClient } from '@vercel/kv';

export default async function handler(req, res) {
  try {
    // 1. 初始化客户端（修正了重复声明和嵌套错误）
    const kv = createClient({
      url: process.env.KV_REST_API_URL,
      token: process.env.KV_REST_API_TOKEN,
    });

    // 2. 生成 6 位数字验证码
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    
    // 3. 存入数据库：24小时有效 (86400秒)，初始使用次数 0
    // 使用 JSON.stringify 确保存储格式统一
    await kv.set(code, JSON.stringify({ usedCount: 0 }), { ex: 10 });

    // 4. 返回成功响应
    return res.status(200).json({ 
      success: true,
      code, 
      message: "验证码已生成，24h内有效" 
    });

  } catch (error) {
    // 5. 错误处理：区分内部错误和外部提示
    console.error("KV Storage Error:", error);
    return res.status(500).json({ 
      success: false,
      error: error.message, 
      details: "服务器内部错误或数据库连接失败" 
    });
  }
}
