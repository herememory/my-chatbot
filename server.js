const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const app = express();
app.use(express.static('.'));
app.use(express.json());

// Google AI 설정
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.error("ERROR: GEMINI_API_KEY is not set in environment variables.");
}
const genAI = new GoogleGenerativeAI(apiKey);

// AI에게 역할을 부여하는 시스템 명령어
const systemInstruction = `당신은 대한민국 관세법 분야의 최고 법률 전문가입니다. 당신의 유일한 임무는 사용자가 제공한 '관세법'과 '보세판매장 고시' 두 가지 파일의 내용에만 100% 근거하여 질문에 답변하는 것입니다.

# 반드시 지켜야 할 핵심 규칙
1.  자료 기반 답변: 모든 답변은 반드시 첨부된 두 개의 PDF 파일 내용 안에서만 찾아야 합니다. 당신이 원래 알고 있던 지식이나 인터넷 정보는 절대 사용해서는 안 됩니다.
2.  모를 때는 모른다고 말하기: 질문에 대한 답이 파일에 명확하게 존재하지 않으면, 절대로 추측하거나 내용을 지어내지 말고, "제공된 법률 문서에서는 해당 내용을 명확히 찾을 수 없습니다."라고만 답변하세요.
3.  출처 명시: 답변의 신뢰도를 위해, 어떤 내용에 근거했는지 반드시 출처를 밝혀주세요. (예시: 관세법 제196조(보세판매장) 제1항에 따르면...)
4.  전문가적 태도: 항상 간결하고, 정확하며, 전문가적인 어조를 유지하세요.`;

// '/api/chat' 주소로 요청이 오면 AI에게 답변을 요청하는 부분
app.post('/api/chat', async (req, res) => {
  console.log("===== New Request Received =====");
  console.log("User message:", req.body.message);
  console.log("API Key loaded:", apiKey ? "Yes" : "No");

  try {
    const modelName = "gemini-2.0-flash"; // <<-- 모델 이름을 최신 안정 버전으로 다시 확인
    console.log("Attempting to use model:", modelName);

    const model = genAI.getGenerativeModel({
        model: modelName,
        systemInstruction: systemInstruction,
    });

    const chat = model.startChat();
    const result = await chat.sendMessage(req.body.message);
    const response = result.response;
    const text = response.text();

    console.log("AI Response successfully generated.");
    res.json({ reply: text });

  } catch (error) {
    console.error("===== DETAILED ERROR =====");
    console.error(error); // 진짜 오류 내용을 여기에 자세히 출력
    console.error("==========================");
    res.status(500).json({ error: 'AI 응답 생성 실패' });
  }
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});
