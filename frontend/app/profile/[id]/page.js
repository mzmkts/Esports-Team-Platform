'use client';
import { useState, useEffect, useRef, use } from 'react';
import { useAuth } from '../../context/AuthContext';
import { API_URL } from '../../libs/api';
import PostCard from '../../components/PostCard';
import styles from '../page.module.css';

export default function ProfilePage({ params }) {
    const { id } = use(params);

    const { user: currentUser, token } = useAuth();
    const fileInputRef = useRef(null);

    const [profileUser, setProfileUser] = useState(null);
    const [loadingUser, setLoadingUser] = useState(true);

    const [uploading, setUploading] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    const [bio, setBio] = useState('');
    const [gameInput, setGameInput] = useState('');
    const [favoriteGames, setFavoriteGames] = useState([]);

    const [likedPosts, setLikedPosts] = useState([]);
    const [loadingPosts, setLoadingPosts] = useState(true);

    const isMyProfile = currentUser?._id === id;

    useEffect(() => {
        if (!id) return;

        const fetchProfileData = async () => {
            try {
                setLoadingUser(true);
                const res = await fetch(`${API_URL}/api/users/${id}`);

                if (res.ok) {
                    const data = await res.json();
                    setProfileUser(data);
                    setBio(data.bio || '');
                    setFavoriteGames(data.favoriteGames || []);
                } else {
                    console.error("Пользователь не найден");
                }
            } catch (err) {
                console.error("Ошибка при загрузке профиля:", err);
            } finally {
                setLoadingUser(false);
            }
        };

        fetchProfileData();
    }, [id]);

    useEffect(() => {
        if (!id || !token) return;

        const fetchLikedPosts = async () => {
            try {
                if (!isMyProfile) {
                    setLoadingPosts(false);
                    return;
                }

                const res = await fetch(`${API_URL}/api/posts/liked`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (res.ok) {
                    const data = await res.json();
                    setLikedPosts(Array.isArray(data) ? data : []);
                }
            } catch (err) {
                console.error("Не удалось загрузить лайкнутые посты:", err);
            } finally {
                setLoadingPosts(false);
            }
        };

        fetchLikedPosts();
    }, [id, token, isMyProfile]);

    if (loadingUser) return <div className={styles.loading}>Загрузка профиля...</div>;
    if (!profileUser) return <div className={styles.loading}>Пользователь не найден.</div>;

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
            let data = JSON.parse(rawText);

            if (res.ok && data.success) {
                setProfileUser({ ...profileUser, avatar: data.avatar });
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
                body: JSON.stringify({ bio, favoriteGames })
            });

            if (res.ok) {
                const updatedUser = await res.json();
                setProfileUser(updatedUser);
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
            console.error("Ошибка при переключении лайка:", err);
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
                        src={profileUser.avatar || 'https://api.dicebear.com/7.x/bottts/svg?seed=gaming'}
                        alt="Avatar"
                        className={styles.avatar}
                    />
                    {isMyProfile && (
                        <button
                            type="button"
                            className={styles.uploadBtn}
                            onClick={() => fileInputRef.current?.click()}
                            disabled={uploading}
                        >
                            {uploading ? 'ЗАГРУЗКА...' : 'ИЗМЕНИТЬ ФОТО'}
                        </button>
                    )}
                </div>
                <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handleFileChange}
                    style={{ display: 'none' }}
                />
                <h2 className={styles.username}>{profileUser.username}</h2>
                <span className={styles.emailBadge}>{profileUser.email}</span>
            </div>

            <div className={styles.mainInfo}>
                <div className={styles.sectionHeader}>
                    <h3>Информация игрока</h3>
                    {isMyProfile && (
                        <button
                            className={isEditing ? styles.saveBtn : styles.editBtn}
                            onClick={isEditing ? handleSaveChanges : () => setIsEditing(true)}
                        >
                            {isEditing ? 'СОХРАНИТЬ' : 'РЕДАКТИРОВАТЬ'}
                        </button>
                    )}
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
                        <p className={styles.bioText}>{profileUser.bio || 'Информация отсутствует.'}</p>
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

                {isMyProfile && (
                    <div className={styles.fieldGroup} style={{ marginTop: '2.5rem' }}>
                        <label style={{ fontSize: '1.1rem', color: '#fff', borderBottom: '1px solid #1e293b', paddingBottom: '0.5rem', marginBottom: '1rem', display: 'block' }}>
                            Понравившиеся публикации
                        </label>

                        {loadingPosts ? (
                            <p className={styles.noData}>Загрузка постов...</p>
                        ) : likedPosts.length === 0 ? (
                            <p className={styles.noData}>Вы еще не ставили лайки публикациям.</p>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%' }}>
                                {likedPosts.map((post) => (
                                    <PostCard
                                        key={post._id}
                                        post={post}
                                        currentUserId={currentUser?._id}
                                        onLike={handleLike}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                )}

            </div>
        </div>
    );
}