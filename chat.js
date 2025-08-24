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

    // ✨ 텍스트 안의 URL을 찾아 링크 태그로 바꿔주는 기능 추가 ✨
    function linkify(text) {
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        return text.replace(urlRegex, '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>');
    }

    function appendMessage(message, sender) {
        const messageWrapper = document.createElement('div');
        messageWrapper.className = sender === 'user' ? 'user-message' : 'bot-message';
        
        // ✨ .textContent 대신 .innerHTML 을 사용하고 linkify 함수를 적용 ✨
        messageWrapper.innerHTML = linkify(message);
        
        chatBox.appendChild(messageWrapper);
        chatBox.scrollTop = chatBox.scrollHeight;
    }
});
