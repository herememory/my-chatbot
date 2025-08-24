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
        // '(관세법 제196조 https://...)' 와 같은 패턴을 찾습니다.
        // 괄호 안의 법조항 텍스트와 바로 뒤따라오는 URL을 각각 그룹으로 잡습니다.
        const citationRegex = /\(([^)]+?)\s*(https?:\/\/[^\s)]+)\)/g;

        // 찾은 패턴을 <a href="URL">법조항</a> 형태로 먼저 바꿉니다.
        let processedText = text.replace(citationRegex, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
        
        // 그 다음에 줄바꿈 문자를 <br> 태그로 바꿉니다.
        return processedText.replace(/\n/g, '<br>');
    }

    function appendMessage(message, sender) {
        const messageWrapper = document.createElement('div');
        messageWrapper.className = sender === 'user' ? 'user-message' : 'bot-message';
        
        messageWrapper.innerHTML = linkify(message);
        
        chatBox.appendChild(messageWrapper);
        chatBox.scrollTop = chatBox.scrollHeight;
    }
});
