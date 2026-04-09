import { createClient } from '@vercel/kv';

export default async function handler(req, res) {
    const { code } = req.query;

    // 1. 验证参数是否存在，防止后续逻辑崩溃
    if (!code) {
        return res.status(400).json({ success: false, message: "参数错误：缺少验证码" });
    }

    try {
        // 2. 初始化客户端
        const kv = createClient({
            url: process.env.KV_REST_API_URL,
            token: process.env.KV_REST_API_TOKEN,
        });

        // 3. 获取数据
        const data = await kv.get(code);

        if (!data) {
            return res.status(400).json({ success: false, message: "验证码无效或已过期" });
        }

        // 4. 解析数据（处理 KV 返回值可能的格式问题）
        let parsedData;
        try {
            parsedData = typeof data === 'string' ? JSON.parse(data) : data;
        } catch (e) {
            return res.status(500).json({ success: false, message: "数据解析异常" });
        }

        const { usedCount = 0 } = parsedData; // 设置默认值防止 undefined

        // 5. 逻辑判断
        if (usedCount >= 3) {
            return res.status(400).json({ success: false, message: "验证码使用次数已达上限" });
        }

        // 6. 更新数据：次数加1
        await kv.set(code, JSON.stringify({ usedCount: usedCount + 1 }), { keepTTL: true });

        // 7. 返回结果
        return res.status(200).json({ 
            success: true, 
            message: `验证通过，剩余次数: ${2 - usedCount}` 
        });

    } catch (error) {
        // 8. 错误处理
        console.error("KV Error:", error); // 建议在后台打印日志方便排查
        return res.status(500).json({ success: false, error: error.message });
    }
}
