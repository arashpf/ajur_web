// pages/chat.js
import dynamic from 'next/dynamic';
import React from 'react';

const AjurChat = dynamic(() => import('../components/chat'), {
  ssr: false
});

export default function ChatPage() {
  const user = { id: 42, name: 'سحر' };
  const worker = { id: 4000, user_id: 1, user_name:'arash' };


  return (
    <div style={{
      padding: 20,
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      minHeight: '100vh'
    }}>
      <AjurChat user={user} conversationId={worker.id} />
    </div>
  );
}
