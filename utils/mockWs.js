// src/utils/mockWs.js
export function createMockSocket() {
  let onmessage = null;
  const socket = {
    readyState: 1,
    send: (data) => {
      setTimeout(() => {
        try {
          const parsed = JSON.parse(data);
          if (parsed.type === 'message.send' && onmessage) {
            onmessage({
              data: JSON.stringify({
                type: 'message.new',
                message: {
                  id: Math.floor(Math.random() * 1000000),
                  body: parsed.body,
                  senderId: parsed.senderId, // NOTE: senderId (not sender_id) for consistency
                  created_at: new Date().toISOString(),
                  tempId: parsed.tempId || null
                }
              })
            });
          }
        } catch (e) {
          // ignore invalid JSON in mock
        }
      }, 300);
    },
    close: () => { socket.readyState = 3; },
    set onmessage(fn) { onmessage = fn; },
    get onmessage() { return onmessage; }
  };
  return socket;
}
