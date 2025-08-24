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

    // ✨ 텍스트 안의 URL을 더 똑똑하게 찾아 링크 태그로 바꿔주는 기능 ✨
    function linkify(text) {
        // 괄호, 대괄호, 공백 등을 제외하고 순수한 URL만 찾아내는 정규식
        const urlRegex = /(https?:\/\/[^\s<>()\[\]]+)/g;
        
        // 텍스트 속 괄호나 대괄호를 제거한 뒤 링크를 생성합니다.
        const cleanedText = text.replace(/[\[\]()]/g, '');
        
        return cleanedText.replace(urlRegex, '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>');
    }

    function appendMessage(message, sender) {
        const messageWrapper = document.createElement('div');
        messageWrapper.className = sender === 'user' ? 'user-message' : 'bot-message';
        
        // .innerHTML 을 사용하고 개선된 linkify 함수를 적용
        messageWrapper.innerHTML = linkify(message);
        
        chatBox.appendChild(messageWrapper);
        chatBox.scrollTop = chatBox.scrollHeight;
    }
});
