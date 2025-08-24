document.addEventListener('DOMContentLoaded', () => {
    const messageInput = document.getElementById('message-input');
    const sendButton = document.getElementById('send-button');
    const chatBox = document.getElementById('chat-box');

    sendButton.addEventListener('click', sendMessage);
    messageInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });

    async function sendMessage() {
        const message = messageInput.value.trim();
        if (message === '') return;

        appendMessage(message, 'user');
        messageInput.value = '';

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message: message }),
            });

            if (!response.ok) {
                throw new Error('서버 응답 오류');
            }

            const data = await response.json();
            const botReply = data.reply;
            appendMessage(botReply, 'bot');

        } catch (error) {
            console.error('오류:', error);
            appendMessage('죄송해요, 답변을 생성하는 중 오류가 발생했어요.', 'bot');
        }
    }

    // ✨ 텍스트를 분석해서 링크를 걸어주는 최종 버전 함수 ✨
    function linkify(text) {
        // 1. '관세법 제196조 http://...' 와 같은 패턴을 찾아 링크로 변환
        const citationRegex = /((?:관세법|관세법 시행규칙|보세판매장 고시)\s*제\d+조(?:\s*제\d+항)?)/g;
        const urlRegex = /(https?:\/\/[^\s]+)/g;

        let processedText = text.replace(citationRegex, (match, citation) => {
            // 바로 다음에 오는 URL을 찾습니다.
            const remainingText = text.substring(text.indexOf(citation) + citation.length);
            const urlMatch = remainingText.match(urlRegex);
            
            if (urlMatch) {
                const url = urlMatch[0];
                // 원본 텍스트에서 '법조항 + URL' 부분을 링크로 교체
                text = text.replace(citation + url, `<a href="${url}" target="_blank" rel="noopener noreferrer">${citation}</a>`);
                return `<a href="${url}" target="_blank" rel="noopener noreferrer">${citation}</a>`;
            }
            return citation; // URL을 못찾으면 그냥 원본 텍스트 유지
        });
        
        // 2. 혹시 남아있는 일반 URL이 있다면 그것도 링크로 변환
        return processedText.replace(urlRegex, (url) => {
             if (!url.includes('</a>')) { // 이미 링크로 변환된건 무시
                return `<a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a>`;
             }
             return url;
        });
    }

    function appendMessage(message, sender) {
        const messageWrapper = document.createElement('div');
        messageWrapper.className = sender === 'user' ? 'user-message' : 'bot-message';
        
        messageWrapper.innerHTML = linkify(message.replace(/\n/g, '<br>')); // 줄바꿈도 지원
        
        chatBox.appendChild(messageWrapper);
        chatBox.scrollTop = chatBox.scrollHeight;
    }
});
