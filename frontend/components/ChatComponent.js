import { useEffect } from 'react';
import "../styles/components/ChatComponent.css";

function ChatComponent() {
  useEffect(() => {
    const fixedButton = document.querySelector('.fixedButton');
    const toggleChatBanner = () => {
      const chatBanner = document.querySelector('.chat-banner');
      if (chatBanner.style.display === 'none' || !chatBanner.style.display) {
        chatBanner.style.display = 'block';
      } else {
        chatBanner.style.display = 'none';
      }
    };

    if (fixedButton) {
      fixedButton.addEventListener('click', toggleChatBanner);
    }

    // クリーンアップ（コンポーネントのアンマウント時にイベントリスナーを解除）
    return () => {
      if (fixedButton) {
        fixedButton.removeEventListener('click', toggleChatBanner);
      }
    };
  }, []);

  return (
    <div>
      {/* 固定ボタン */}
      <div className="fixed-button">
        <button className="fixedButton">?</button>
      </div>

      {/* チャットバナー */}
      {/* 一時的に他人のライブラリを読み込み */}
      <div className="chat-banner" style={{ display: 'none' }}>
        <iframe
          src="https://riversun.github.io/chatux/ja/echobot/app/chat.html"
          style={{ width: '100%', height: '400px' }}
        ></iframe>
      </div>
    </div>
  );
}

export default ChatComponent;