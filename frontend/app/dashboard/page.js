'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import styles from './page.module.css';
import {API_URL} from "../libs/api";

export default function DashboardPage() {
    const { token, user } = useAuth();
    const router = useRouter();
    const fileInputRef = useRef(null);

    const [activeTab, setActiveTab] = useState('posts');

    const [posts, setPosts] = useState([]);
    const [postForm, setPostForm] = useState({ title: '', content: '', image: '' });
    const [editingPostId, setEditingPostId] = useState(null);
    const [uploading, setUploading] = useState(false);

    const [teams, setTeams] = useState([]);
    const [teamForm, setTeamForm] = useState({ name: '', game: '', description: '' });
    const [editingTeamId, setEditingTeamId] = useState(null);

    useEffect(() => {
        if (token && user?._id) {
            fetchPosts();
            fetchTeams();
        }
    }, [token, user?._id]);

    const fetchPosts = async () => {
        try {
            const res = await fetch(`${API_URL}/api/posts`);
            if (res.ok) {
                const allPosts = await res.json();
                if (user?.role === 'admin') {
                    setPosts(allPosts);
                } else {
                    const myPosts = allPosts.filter(post => {
                        const authorId = post.author?._id || post.author;
                        return String(authorId) === String(user?._id);
                    });
                    setPosts(myPosts);
                }
            }
        } catch (err) {
            console.error("Ошибка при получении публикаций:", err);
        }
    };

    const fetchTeams = async () => {
        try {
            const res = await fetch(`${API_URL}/api/teams`);
            if (res.ok) {
                const allTeams = await res.json();
                if (user?.role === 'admin') {
                    setTeams(allTeams);
                } else {
                    const myAndJoinedTeams = allTeams.filter(team => {
                        const ownerId = team.owner?._id || team.owner;
                        const isOwner = String(ownerId) === String(user?._id);
                        const isMember = team.members?.some(m => String(m._id || m) === String(user?._id));
                        return isOwner || isMember;
                    });
                    setTeams(myAndJoinedTeams);
                }
            }
        } catch (err) {
            console.error("Ошибка при получении команд:", err);
        }
    };

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
            setUploading(true);
            const formData = new FormData();
            formData.append('image', file);

            const res = await fetch(`${API_URL}/api/posts/upload-image`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData
            });

            const data = await res.json();

            if (res.ok && data.success) {
                setPostForm(prev => ({ ...prev, image: data.imageUrl }));
                alert('Обложка загружена!');
            } else {
                alert(data.message || 'Ошибка загрузки');
            }
        } catch (err) {
            alert('Ошибка сети при загрузке картинки');
        } finally {
            setUploading(false);
        }
    };

    const handleSavePost = async (e) => {
        e.preventDefault();
        const url = editingPostId ? `${API_URL}/api/posts/${editingPostId}` : `${API_URL}/api/posts`;
        const method = editingPostId ? 'PUT' : 'POST';

        const res = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify(postForm)
        });

        if (res.ok) {
            alert(editingPostId ? 'Новость обновлена!' : 'Новость добавлена!');
            setPostForm({ title: '', content: '', image: '' });
            setEditingPostId(null);
            fetchPosts();
        }
    };

    const handleEditPostClick = (post) => {
        setEditingPostId(post._id);
        setPostForm({ title: post.title, content: post.content, image: post.image });
    };

    const handleDeletePost = async (id) => {
        if (!confirm('Удалить эту новость?')) return;
        const res = await fetch(`${API_URL}/api/posts/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) fetchPosts();
    };

    const handleSaveTeam = async (e) => {
        e.preventDefault();
        const url = editingTeamId ? `${API_URL}/api/teams/${editingTeamId}` : `${API_URL}/api/teams`;
        const method = editingTeamId ? 'PUT' : 'POST';

        const res = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify(teamForm)
        });

        if (res.ok) {
            alert(editingTeamId ? 'Команда обновлен!' : 'Команда зарегистрирована!');
            setTeamForm({ name: '', game: '', description: '' });
            setEditingTeamId(null);
            fetchTeams();
        }
    };

    const handleEditTeamClick = (team) => {
        setEditingTeamId(team._id);
        setTeamForm({ name: team.name, game: team.game, description: team.description });
    };

    const handleDeleteTeam = async (id) => {
        if (!confirm('Расформировать и удалить команду навсегда?')) return;
        const res = await fetch(`${API_URL}/api/teams/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) fetchTeams();
    };

    const handleLeaveTeam = async (id) => {
        if (!confirm('Вы действительно хотите покинуть эту команду?')) return;
        const res = await fetch(`${API_URL}/api/teams/${id}/leave`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
            alert('Вы вышли из команды.');
            fetchTeams();
        }
    };

    if (!token) return <p className={styles.accessDenied}>Доступ закрыт. Авторизуйтесь.</p>;

    return (
        <div className={styles.dashboardContainer}>
            <h1 className={styles.mainTitle}>Панель Управления</h1>

            <div className={styles.tabsContainer}>
                <button
                    className={`${styles.tabButton} ${activeTab === 'posts' ? styles.tabActivePost : ''}`}
                    onClick={() => setActiveTab('posts')}
                >
                    Публикации
                </button>
                <button
                    className={`${styles.tabButton} ${activeTab === 'teams' ? styles.tabActiveTeam : ''}`}
                    onClick={() => setActiveTab('teams')}
                >
                    Команды
                </button>
            </div>

            {activeTab === 'posts' && (
                <div className={styles.tabContent}>
                    <div className={styles.panel}>
                        <h2 className={`${styles.panelTitle} ${styles.postTitle}`}>
                            {editingPostId ? 'Редактировать новость' : 'Опубликовать новость'}
                        </h2>
                        <form onSubmit={handleSavePost}>
                            <div className={styles.inputGroup}>
                                <label>Заголовок</label>
                                <input type="text" placeholder="Введите заголовок новости" value={postForm.title} required className={styles.textInput} onChange={e => setPostForm({...postForm, title: e.target.value})} />
                            </div>

                            <div className={styles.inputGroup}>
                                <input type="file" ref={fileInputRef} accept="image/*" className={styles.hiddenInput} onChange={handleFileChange} />
                                <button type="button" className={styles.uploadButton} onClick={() => fileInputRef.current?.click()} disabled={uploading}>
                                    {uploading ? 'ЗАГРУЗКА...' : 'ВЫБРАТЬ ОБЛОЖКУ'}
                                </button>
                                {postForm.image && <p className={styles.uploadSuccess}>✓ Файл успешно прикреплен</p>}
                            </div>

                            <div className={styles.inputGroup}>
                                <label>Текст новости</label>
                                <textarea placeholder="Напишите содержание публикации..." value={postForm.content} required className={styles.textarea} onChange={e => setPostForm({...postForm, content: e.target.value})} />
                            </div>

                            <button type="submit" className={styles.savePostButton}>
                                {editingPostId ? 'СОХРАНИТЬ ИЗМЕНЕНИЯ' : 'СОХРАНИТЬ'}
                            </button>
                            {editingPostId && (
                                <button type="button" onClick={() => { setEditingPostId(null); setPostForm({title:'', content:'', image:''}) }} className={styles.cancelButton}>
                                    Отменить редактирование
                                </button>
                            )}
                        </form>
                    </div>

                    <div className={styles.managementSection}>
                        <h3 className={styles.sectionTitle}>Ваши публикации:</h3>
                        <div className={styles.tableWrapper}>
                            {posts.length === 0 ? (
                                <p className={styles.emptyMessage}>У вас пока нет созданных публикаций.</p>
                            ) : (
                                posts.map(post => {
                                    const postDate = post.createdAt ? new Date(post.createdAt).toLocaleDateString('ru-RU') : '17.05.2024';
                                    const postTime = post.createdAt ? new Date(post.createdAt).toLocaleTimeString('ru-RU', {hour: '2-digit', minute:'2-digit'}) : '14:30';

                                    return (
                                        <div key={post._id} className={styles.tableRowPost}>
                                            <div className={styles.imagePreviewWrapper}>
                                                {post.image ? <img src={post.image} alt="preview" className={styles.imagePreview} /> : <span className={styles.imagePlaceholder}>CYBER</span>}
                                            </div>
                                            <div className={styles.infoColumn}>
                                                <div className={styles.titleRow}>
                                                    <span className={styles.postName}>{post.title}</span>
                                                </div>
                                                <span className={styles.authorName}>by {post.author?.username || user?.username}</span>
                                            </div>
                                            <div className={styles.timeColumn}>{postTime} | {postDate}</div>
                                            <div className={styles.statsColumn}>
                                                <div className={styles.statItem}>
                                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className={post.likes?.includes(user?._id) ? styles.likedIcon : styles.defaultIcon}>
                                                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                                                    </svg>
                                                    <span>{post.likes?.length || 0}</span>
                                                </div>
                                                <div className={styles.statItem}>
                                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={styles.defaultIcon}>
                                                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                                                        <circle cx="12" cy="12" r="3"/>
                                                    </svg>
                                                    <span>{post.views || 0}</span>
                                                </div>
                                            </div>
                                            <div className={styles.actionsColumn}>
                                                <button onClick={() => handleEditPostClick(post)} className={styles.editBtn}>Редакт.</button>
                                                <button onClick={() => handleDeletePost(post._id)} className={styles.deleteBtn}>Удалить</button>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'teams' && (
                <div className={styles.tabContent}>
                    <div className={styles.panel}>
                        <h2 className={`${styles.panelTitle} ${styles.teamTitle}`}>
                            {editingTeamId ? 'Редактировать параметры команды' : 'Зарегистрировать команду'}
                        </h2>
                        <form onSubmit={handleSaveTeam}>
                            <div className={styles.inputGroup}>
                                <label>Название тега/команды</label>
                                <input type="text" placeholder="Например: Natus Vincere" value={teamForm.name} required className={styles.textInput} onChange={e => setTeamForm({...teamForm, name: e.target.value})} />
                            </div>

                            <div className={styles.inputGroup}>
                                <label>Дисциплина</label>
                                <input type="text" placeholder="Например: CS2, Dota 2" value={teamForm.game} required className={styles.textInput} onChange={e => setTeamForm({...teamForm, game: e.target.value})} />
                            </div>

                            <div className={styles.inputGroup}>
                                <label>Описание команды</label>
                                <textarea placeholder="Краткая информация о целях и задачах..." value={teamForm.description} required className={styles.textarea} style={{minHeight: '80px'}} onChange={e => setTeamForm({...teamForm, description: e.target.value})} />
                            </div>

                            <button type="submit" className={styles.saveTeamButton}>
                                {editingTeamId ? 'СОХРАНИТЬ ИЗМЕНЕНИЯ' : 'СОЗДАТЬ КОМАНДУ'}
                            </button>
                            {editingTeamId && (
                                <button type="button" onClick={() => { setEditingTeamId(null); setTeamForm({name:'', game:'', description:''}) }} className={styles.cancelButton}>
                                    Отменить редактирование
                                </button>
                            )}
                        </form>
                    </div>

                    <div className={styles.managementSection}>
                        <h3 className={styles.sectionTitle}>Зарегистрированные игроки:</h3>
                        <div className={styles.tableWrapper}>
                            {teams.length === 0 ? (
                                <p className={styles.emptyMessage}>Команды не найдены.</p>
                            ) : (
                                teams.map(team => {
                                    const teamOwnerId = team.owner?._id || team.owner;
                                    const isOwner = teamOwnerId && user?._id && String(teamOwnerId) === String(user?._id);
                                    const canManageTeam = isOwner || user?.role === 'admin';

                                    return (
                                        <div key={team._id} className={styles.tableRowTeam}>
                                            <div className={styles.infoColumn}>
                                                <div className={styles.titleRow}>
                                                    <span className={styles.postName}>{team.name}</span>
                                                    <span className={styles.teamBadge}>{team.game}</span>
                                                </div>
                                                <span className={styles.authorName}>{team.description}</span>
                                            </div>

                                            <div className={styles.dashboardRosterBox}>
                                                <span className={styles.rosterLabel}>Состав ({team.members?.length || 0}/5):</span>
                                                <div className={styles.dashboardPlayersGrid}>
                                                    {team.members && team.members.length > 0 ? (
                                                        team.members.map((member, idx) => {
                                                            const memberId = member._id || member;
                                                            return (
                                                                <div key={idx} className={styles.dashboardPlayerBadge}>
                                                                    <span>{member.username || 'Игрок'}</span>
                                                                    {canManageTeam && String(memberId) !== String(user?._id) && (
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => handleKickPlayer(team._id, memberId)}
                                                                            className={styles.miniKickBtn}
                                                                            title="Исключить игрока"
                                                                        >
                                                                            ×
                                                                        </button>
                                                                    )}
                                                                </div>
                                                            );
                                                        })
                                                    ) : (
                                                        <span style={{color: '#475569', fontSize: '12px'}}>Нет участников</span>
                                                    )}
                                                </div>
                                            </div>

                                            <div className={styles.actionsColumn} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                                <button onClick={() => router.push(`/teams/${team._id}`)} className={styles.editBtn} style={{ background: 'rgba(0, 240, 255, 0.1)', color: '#00f0ff', borderColor: '#00f0ff', border: '1px solid' }}>Чат</button>

                                                {canManageTeam ? (
                                                    <>
                                                        <button onClick={() => handleEditTeamClick(team)} className={styles.editBtn}>Редакт.</button>
                                                        <button onClick={() => handleDeleteTeam(team._id)} className={styles.deleteBtn}>Удалить</button>
                                                    </>
                                                ) : (
                                                    <button onClick={() => handleLeaveTeam(team._id)} className={styles.deleteBtn} style={{ background: '#e11d48' }}>Покинуть</button>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}