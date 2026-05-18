'use client';
import {useState, useEffect, useRef} from 'react';
import {useAuth} from '../context/AuthContext';
import {API_URL} from '../libs/api';
import PostCard from '../components/PostCard';
import styles from './page.module.css';

export default function ProfilePage() {
    const {user, token, updateUserData} = useAuth();
    const fileInputRef = useRef(null);

    const [uploading, setUploading] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    const [bio, setBio] = useState('');
    const [gameInput, setGameInput] = useState('');
    const [favoriteGames, setFavoriteGames] = useState([]);

    const [likedPosts, setLikedPosts] = useState([]);
    const [loadingPosts, setLoadingPosts] = useState(true);

    useEffect(() => {
        if (!token) return;

        const fetchFreshProfile = async () => {
            try {
                const res = await fetch(`${API_URL}/api/users/me`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                if (res.ok) {
                    const freshUser = await res.json();
                    updateUserData(freshUser);
                }
            } catch (err) {
                console.error("Не удалось синхронизировать профиль с командами:", err);
            }
        };

        fetchFreshProfile();
    }, [token]);

    useEffect(() => {
        if (!user || !token) return;

        const fetchLikedPosts = async () => {
            try {
                const res = await fetch(`${baseUrl}/api/posts/liked`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (res.ok) {
                    const data = await res.json();
                    setLikedPosts(Array.isArray(data) ? data : []);
                }
            } catch (err) {
                console.error("Не удалось загрузить лайкнутые посты в профиле:", err);
            } finally {
                setLoadingPosts(false);
            }
        };

        fetchLikedPosts();
    }, [user?._id, token]);

    useEffect(() => {
        if (user) {
            setBio(user.bio || '');
            setFavoriteGames(user.favoriteGames || []);
        }
    }, [user]);

    if (!user) return <div className={styles.loading}>Доступ запрещен. Авторизуйтесь.</div>;

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
            setUploading(true);
            const formData = new FormData();
            formData.append('avatar', file);

            const res = await fetch(`${API_URL}/api/users/upload-avatar`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            const rawText = await res.text();
            let data;
            try {
                data = JSON.parse(rawText);
            } catch (parseErr) {
                throw new Error("Сервер вернул не JSON-формат");
            }

            if (res.ok && data.success) {
                updateUserData({...user, avatar: data.avatar});
                alert('Аватар успешно обновлен!');
            } else {
                alert(data.message || `Ошибка при сохранении`);
            }
        } catch (err) {
            console.error(err);
            alert(`Ошибка: ${err.message}`);
        } finally {
            setUploading(false);
        }
    };

    const handleSaveChanges = async () => {
        try {
            const res = await fetch(`${API_URL}/api/users/update-profile`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({bio, favoriteGames})
            });

            if (res.ok) {
                const updatedUser = await res.json();
                updateUserData(updatedUser);
                setIsEditing(false);
                alert('Профиль успешно обновлен!');
            } else {
                alert('Не удалось сохранить изменения');
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleLike = async (postId) => {
        try {
            const res = await fetch(`${API_URL}/api/posts/${postId}/like`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            if (res.ok) {
                setLikedPosts((prev) => prev.filter((post) => post._id !== postId));
            }
        } catch (err) {
            console.error("Ошибка при переключении лайка в профиле:", err);
        }
    };

    const handleAddGame = (e) => {
        if (e.key === 'Enter' && gameInput.trim()) {
            e.preventDefault();
            if (!favoriteGames.includes(gameInput.trim())) {
                setFavoriteGames([...favoriteGames, gameInput.trim()]);
            }
            setGameInput('');
        }
    };

    const handleRemoveGame = (gameToRemove) => {
        setFavoriteGames(favoriteGames.filter(g => g !== gameToRemove));
    };

    return (
        <div className={styles.container}>
            <div className={styles.sidebar}>
                <div className={styles.avatarWrapper}>
                    <img
                        src={user.avatar || 'https://api.dicebear.com/7.x/bottts/svg?seed=gaming'}
                        alt="Avatar"
                        className={styles.avatar}
                    />
                    <button
                        type="button"
                        className={styles.uploadBtn}
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                    >
                        {uploading ? 'ЗАГРУЗКА...' : 'ИЗМЕНИТЬ ФОТО'}
                    </button>
                </div>
                <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handleFileChange}
                    style={{display: 'none'}}
                />
                <h2 className={styles.username}>{user.username}</h2>
                <span className={styles.emailBadge}>{user.email}</span>
            </div>

            <div className={styles.mainInfo}>
                <div className={styles.sectionHeader}>
                    <h3>Информация игрока</h3>
                    <button
                        className={isEditing ? styles.saveBtn : styles.editBtn}
                        onClick={isEditing ? handleSaveChanges : () => setIsEditing(true)}
                    >
                        {isEditing ? 'СОХРАНИТЬ' : 'РЕДАКТИРОВАТЬ'}
                    </button>
                </div>

                <div className={styles.fieldGroup}>
                    <label>Биография / Статус</label>
                    {isEditing ? (
                        <textarea
                            value={bio}
                            onChange={(e) => setBio(e.target.value)}
                            className={styles.textarea}
                            placeholder="Расскажи о себе..."
                        />
                    ) : (
                        <p className={styles.bioText}>{user.bio || 'Информация отсутствует.'}</p>
                    )}
                </div>

                <div className={styles.fieldGroup}>
                    <label>Любимые дисциплины</label>
                    {isEditing && (
                        <input
                            type="text"
                            value={gameInput}
                            onChange={(e) => setGameInput(e.target.value)}
                            onKeyDown={handleAddGame}
                            placeholder="Введите название игры и нажмите Enter"
                            className={styles.input}
                        />
                    )}
                    <div className={styles.gamesList}>
                        {favoriteGames.length > 0 ? (
                            favoriteGames.map((game, idx) => (
                                <span key={idx} className={styles.gameTag}>
                                    {game}
                                    {isEditing && <button onClick={() => handleRemoveGame(game)}>×</button>}
                                </span>
                            ))
                        ) : (
                            <span className={styles.noData}>Игры не выбраны</span>
                        )}
                    </div>
                </div>

                <div className={styles.fieldGroup} style={{marginTop: '2.5rem'}}>
                    <label style={{
                        fontSize: '1.1rem',
                        color: '#fff',
                        borderBottom: '1px solid #1e293b',
                        paddingBottom: '0.5rem',
                        marginBottom: '1rem',
                        display: 'block'
                    }}>
                        Понравившиеся публикации
                    </label>

                    {loadingPosts ? (
                        <p className={styles.noData}>Загрузка постов...</p>
                    ) : likedPosts.length === 0 ? (
                        <p className={styles.noData}>Вы еще не ставили лайки публикациям.</p>
                    ) : (
                        <div style={{display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%'}}>
                            {likedPosts.map((post) => (
                                <PostCard
                                    key={post._id}
                                    post={post}
                                    currentUserId={user._id}
                                    onLike={handleLike}
                                />
                            ))}
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}