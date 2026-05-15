const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { defineSecret } = require('firebase-functions/params');
const OpenAI = require("openai");

// 서버 비밀 금고에 저장할 API 키 이름입니다.
const openAiKey = defineSecret('OPENAI_API_KEY');

exports.chatProxy = onCall({
    secrets: [openAiKey],
    region: "asia-northeast3", // 한국 리전
    cors: true
}, async (request) => {
    // 로그인이 되어 있는지 확인 (상용 제품 보안 핵심!)
    if (!request.auth) {
        throw new HttpsError("unauthenticated", "로그인이 필요한 서비스입니다냥!");
    }

    try {
        const openai = new OpenAI({ apiKey: openAiKey.value() });
        const { messages, model, temperature } = request.data;

        const completion = await openai.chat.completions.create({
            model: model || "gpt-4o-mini",
            messages: messages,
            temperature: temperature || 0.7,
        });

        return { content: completion.choices[0].message.content };
    } catch (error) {
        console.error("OpenAI Error:", error);
        throw new HttpsError("internal", error.message);
    }
});
