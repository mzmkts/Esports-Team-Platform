'use client';
import {useEffect, useState, useRef, use} from 'react';
import {useAuth} from '../../context/AuthContext';
import {API_URL, WS_URL} from '../../libs/api';
import styles from './page.module.css';

export default function TeamDetailPage({params}) {
    const {id} = use(params);
    const {user} = useAuth();
    const [team, setTeam] = useState(null);
    const [messages, setMessages] = useState([]);
    const [onlineUsers, setOnlineUsers] = useState([]);
    const [input, setInput] = useState('');

    const ws = useRef(null);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({behavior: 'smooth'});
    }, [messages]);

    const fetchMessages = async () => {
        try {
            const res = await fetch(`${API_URL}/api/messages/team/${id}`);
            if (res.ok) {
                const data = await res.json();
                if (Array.isArray(data)) {
                    setMessages(data);
                }
            }
        } catch (err) {
            console.error("Не удалось загрузить историю сообщений:", err);
        }
    };

    useEffect(() => {
        fetch(`${API_URL}/api/teams/${id}`)
            .then(res => res.json())
            .then(data => setTeam(data))
            .catch(err => console.error("Ошибка загрузки команды:", err));

        fetchMessages();

        ws.current = new WebSocket(WS_URL);

        ws.current.onopen = () => {
            if (user) {
                ws.current.send(JSON.stringify({type: 'join_room', teamId: id, user}));
            }
        };

        ws.current.onmessage = (event) => {
            try {
                const message = JSON.parse(event.data);

                if (message.type === 'new_message' && message.data) {
                    setMessages((prev) => [...prev, message.data]);
                }
                if (message.type === 'update_online_list') {
                    setOnlineUsers(message.users || []);
                }
            } catch (err) {
                console.error("Ошибка парсинга WS сообщения:", err);
            }
        };

        return () => {
            if (ws.current) ws.current.close();
        };
    }, [id, user]);

    const sendMessage = (e) => {
        e.preventDefault();
        if (!input.trim() || !user) return;

        ws.current.send(JSON.stringify({
            type: 'message',
            userId: user._id,
            teamId: id,
            content: input
        }));
        setInput('');
    };

    if (!team) return <div style={{textAlign: 'center', padding: '3rem'}}>Загрузка...</div>;

    return (
        <div className={styles.gridContainer}>
            <div className={styles.chatArea}>
                <div className={styles.chatHeader}>Комната команды — {team.name}</div>
                <div className={styles.messagesList}>
                    {Array.isArray(messages) && messages.map((msg, idx) => {
                        if (!msg) return null;
                        const senderId = msg.sender?._id || msg.sender;
                        const senderName = msg.sender?.username || 'Игрок';
                        const isMe = String(senderId) === String(user?._id);

                        return (
                            <div key={idx}
                                 className={`${styles.messageWrapper} ${isMe ? styles.myMessage : styles.otherMessage}`}>
                                <div className={styles.msgMeta}>{senderName}</div>
                                <div className={styles.bubble}>{msg.content}</div>
                            </div>
                        );
                    })}
                    <div ref={messagesEndRef}/>
                </div>
                <form onSubmit={sendMessage} className={styles.chatForm}>
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Написать сообщение..."
                        className={styles.input}
                    />
                    <button type="submit" className={styles.sendBtn}>Отправить</button>
                </form>
            </div>

            <div className={styles.onlinePanel}>
                <div className={styles.onlineTitle}>
                    <span className={styles.statusDot}></span>
                    В сети ({onlineUsers.length})
                </div>
                {Array.isArray(onlineUsers) && onlineUsers.map((u) => {
                    if (!u) return null;
                    return (
                        <div key={u._id} className={styles.userRow}>
                            <img
                                src={u.avatar || 'https://utfs.io/f/placeholder-avatar.png'}
                                style={{
                                    width: '32px',
                                    height: '32px',
                                    borderRadius: '50%',
                                    objectFit: 'cover',
                                    border: '1px solid var(--color-cyan)'
                                }}
                                alt=""
                            />
                            <span>{u.username}</span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}