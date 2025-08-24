const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();
const fs = require('fs'); // 파일을 읽기 위한 모듈 추가

const app = express();
app.use(express.static('.'));
app.use(express.json());

// --- AI 교과서(법률 텍스트) 미리 읽어두기 ---
let lawContext = '';
try {
    const lawFileContent = fs.readFileSync('관세법.txt', 'utf8');
    const noticeFileContent = fs.readFileSync('보세판매장_고시.txt', 'utf8');
    const enforcementRuleContent = fs.readFileSync('관세법_시행규칙.txt', 'utf8');

    // 세 개의 파일 내용을 하나로 합쳐서 컨텍스트를 만듭니다.
    lawContext = `[참고 자료 1: 관세법]\n${lawFileContent}\n\n[참고 자료 2: 보세판매장 운영에 관한 고시]\n${noticeFileContent}\n\n[참고 자료 3: 관세법 시행규칙]\n${enforcementRuleContent}`;
    
    console.log("법률 텍스트 파일들을 성공적으로 읽었습니다.");
} catch (err) {
    console.error("오류: 법률 텍스트 파일을 읽는 데 실패했습니다.", err);
}
// -----------------------------------------

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.post('/api/chat', async (req, res) => {
    try {
        // ✨ 모델 이름을 요청하신 gemini-2.0-flash 로 변경했습니다.
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
        const userMessage = req.body.message;

        // AI에게 보낼 최종 질문 (역할 부여 + 교과서 내용 + 실제 질문)

const finalPrompt = `당신은 대한민국 관세법 분야의 친절한 안내원입니다. 오직 아래에 제공된 참고 자료의 내용에만 근거하여 사용자의 질문에 답변해야 합니다.

# 지시 사항
1.  사용자의 질문에 대한 답을 참고 자료에서 찾아서, **핵심 내용을 요약하여 2~3문장으로 간결하고 명확하게 설명**해 주세요.
2.  답변의 근거가 되는 **가장 핵심적인 법 조항 단 하나만**을 출처로 명시해야 합니다. (여러 조항을 나열하지 마세요.)
3.  출처는 **반드시** 다음의 **단 한 가지 형식**으로만 작성해야 합니다. 다른 형식은 절대 사용하지 마세요.
    -   \`(법률이름 제XX조 제X항 URL)\`
4.  **반드시 지켜야 할 출처 형식 예시:**
    -   (O) \`(관세법 제196조 https://law.go.kr/DRF/lawService.do?OC=sapphire_5&target=law&MST=267541&type=HTML)\`
    -   (O) \`(관세법 시행규칙 제48조 https://www.law.go.kr/LSW/lsLinkProc.do?lsNm=%EA%B4%80%EC%84%B8%EB%B2%95%20%EC%8B%9C%ED%96%89%EA%B7%9C%EC%B9%99&chrClsCd=010202&mode=20#)\`
    -   (X) \`(관세법 시행규칙)\` - URL이 없으므로 잘못된 형식입니다.
5.  자료에 없는 내용은 "제공된 법률 문서에서는 해당 내용을 찾을 수 없습니다."라고 답변하세요.
6.  면세한도는 관세법 시행규칙 제48조(관세가 면제되는 여행자 휴대품 등)의 1항,2항,3항 내용을 참고해서 답변하세요.
7.  면세점과 보세판매장을 동일하게 생각하고 답변하세요.

--- 참고 자료 시작 ---
${lawContext}
--- 참고 자료 끝 ---

사용자의 질문: "${userMessage}"`;

        const result = await model.generateContent(finalPrompt);
        const response = await result.response;
        const text = response.text();

        res.json({ reply: text });
    } catch (error) {
        console.error("AI 응답 생성 중 오류 발생:", error);
        res.status(500).json({ error: 'AI 응답 생성 실패' });
    }
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`서버가 http://localhost:${PORT} 에서 실행 중입니다.`);
});











