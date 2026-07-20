import { useState, useEffect, useRef, useContext, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import { getMentorRequestById, getMessages, sendChatMessage } from '../utils/api';
import { socket, connectSocket, disconnectSocket } from '../utils/socket';

function MentorChat() {
  const { requestId } = useParams();
  const { user, token } = useContext(AuthContext);

  const [mentorRequest, setMentorRequest] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);

  const bottomRef = useRef(null);

  const loadMessages = useCallback(async () => {
    try {
      const data = await getMessages(requestId);
      setMessages(data.messages || []);
    } catch (err) {
      console.error('Error loading messages:', err);
    }
  }, [requestId]);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await get
        ById(requestId);
        setMentorRequest(data.mentorRequest);
        if (data.mentorRequest.status === 'accepted') {
          await loadMessages();
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Error loading conversation');
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [requestId, loadMessages]);

  // Join the conversation's Socket.IO room and receive new messages in real
  // time while the chat is open and accepted
  useEffect(() => {
    if (!mentorRequest || mentorRequest.status !== 'accepted' || !token) return undefined;

    connectSocket(token);
    socket.emit('joinConversation', requestId);

    const handleNewMessage = (incomingMessage) => {
      setMessages((prev) => [...prev, incomingMessage]);
    };

    const handleConversationError = (err) => {
      console.error('Conversation socket error:', err?.message);
    };

    socket.on('newMessage', handleNewMessage);
    socket.on('conversationError', handleConversationError);

    return () => {
      socket.off('newMessage', handleNewMessage);
      socket.off('conversationError', handleConversationError);
      socket.emit('leaveConversation', requestId);
      disconnectSocket();
    };
  }, [mentorRequest, requestId, token]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const otherPerson = mentorRequest
    ? (mentorRequest.fromStudent?._id === user?.id ? mentorRequest.toMentor : mentorRequest.fromStudent)
    : null;

  const handleSend = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    setSending(true);
    try {
      await sendChatMessage(requestId, text.trim());
      setText('');
    } catch (err) {
      alert(err.response?.data?.message || 'Error sending message');
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600"></div>
            <p className="mt-4 text-gray-600 font-semibold">Loading conversation...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !mentorRequest) {
    return (
      <div className="flex min-h-screen bg-linear-to-br from-gray-50 to-blue-50">
        <Sidebar />
        <div className="flex-1 p-8 flex items-center justify-center">
          <div className="rounded-2xl bg-white p-10 shadow-lg text-center max-w-md">
            <div className="text-5xl mb-4">😕</div>
            <p className="text-gray-800 text-lg font-semibold">{error || 'Conversation not found'}</p>
            <Link to="/dashboard/mentor-requests" className="mt-4 inline-block text-blue-600 font-semibold hover:underline">
              ← Back to my requests
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (mentorRequest.status !== 'accepted') {
    return (
      <div className="flex min-h-screen bg-linear-to-br from-gray-50 to-blue-50">
        <Sidebar />
        <div className="flex-1 p-8 flex items-center justify-center">
          <div className="rounded-2xl bg-white p-10 shadow-lg text-center max-w-md">
            <div className="text-5xl mb-4">⏳</div>
            <p className="text-gray-800 text-lg font-semibold">
              {mentorRequest.status === 'declined' ? 'This request was declined' : 'Waiting for acceptance'}
            </p>
            <p className="text-gray-600 mt-2">Chat unlocks once the mentor accepts this request.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-linear-to-br from-gray-50 to-blue-50">
      <Sidebar />
      <div className="flex-1 p-8 flex flex-col overflow-hidden">
        <div className="mb-4 flex items-center gap-4 shrink-0">
          <div className="w-12 h-12 rounded-full overflow-hidden bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-lg font-bold shadow-lg shrink-0">
            {otherPerson?.profilePhoto ? (
              <img src={otherPerson.profilePhoto} alt={otherPerson?.name} className="h-full w-full object-cover" />
            ) : (
              otherPerson?.name?.charAt(0).toUpperCase()
            )}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{otherPerson?.name}</h1>
            <p className="text-gray-500 text-sm">{mentorRequest.requestType}</p>
          </div>
        </div>

        <div className="flex-1 bg-white rounded-2xl shadow-lg border border-gray-100 flex flex-col overflow-hidden min-h-0">
          <div className="flex-1 overflow-y-auto p-6 space-y-3">
            {messages.length === 0 ? (
              <p className="text-gray-500 text-center mt-10">Say hello to start the conversation 👋</p>
            ) : (
              messages.map((msg) => {
                const isOwn = msg.sender?._id === user?.id;
                return (
                  <div key={msg._id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className={`max-w-md px-4 py-2.5 rounded-2xl ${
                        isOwn ? 'bg-blue-600 text-white rounded-br-sm' : 'bg-gray-100 text-gray-800 rounded-bl-sm'
                      }`}
                    >
                      <p className="whitespace-pre-line break-words">{msg.text}</p>
                      <p className={`text-[11px] mt-1 ${isOwn ? 'text-blue-100' : 'text-gray-400'}`}>
                        {new Date(msg.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={bottomRef} />
          </div>

          <form onSubmit={handleSend} className="border-t border-gray-100 p-4 flex gap-3 shrink-0">
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
            />
            <button
              type="submit"
              disabled={sending || !text.trim()}
              className="px-6 py-3 bg-linear-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-60 text-white font-semibold rounded-xl shadow-lg transition"
            >
              Send
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default MentorChat;
