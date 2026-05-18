'use client';
import {useState, useEffect} from 'react';
import {useSearchParams, useRouter} from 'next/navigation';
import Link from 'next/link';
import styles from './users.module.css';
import {API_URL} from "../libs/api";

export default function UsersPage() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    const searchParams = useSearchParams();
    const router = useRouter();

    const querySearch = searchParams.get('search') || '';
    const [localSearch, setLocalSearch] = useState(querySearch);

    useEffect(() => {
        setLocalSearch(querySearch);
    }, [querySearch]);

    useEffect(() => {
        async function fetchUsers() {
            try {
                const res = await fetch(`${API_URL}/api/users`);
                if (res.ok) {
                    const data = await res.json();
                    setUsers(data);
                }
            } catch (err) {
                console.error("Ошибка при получении списка игроков:", err);
            } finally {
                setLoading(false);
            }
        }

        fetchUsers();
    }, []);

    const filteredUsers = users.filter(player =>
        player.username?.toLowerCase().includes(localSearch.toLowerCase())
    );

    const handleClearSearch = () => {
        setLocalSearch('');
        router.push('/users');
    };

    if (loading) return <div className={styles.loading}>Загрузка базы данных игроков...</div>;

    return (
        <div className={styles.usersContainer}>
            <div className={styles.headerSection}>
                <h1 className={styles.title}>Комьюнити игроков</h1>
                <p className={styles.subtitle}>Профили участников и про-игроков платформы CYBER_NET</p>

                <div className={styles.searchBoxWrapper}>
                    <input
                        type="text"
                        placeholder="Поиск игрока по никнейму..."
                        value={localSearch}
                        onChange={(e) => setLocalSearch(e.target.value)}
                        className={styles.pageSearchInput}
                    />
                    {localSearch && (
                        <button onClick={handleClearSearch} className={styles.clearSearchBtn}>
                            ×
                        </button>
                    )}
                </div>
            </div>

            {filteredUsers.length === 0 ? (
                <p className={styles.emptyGridMessage}>Игроки с никнеймом «{localSearch}» не найдены.</p>
            ) : (
                <div className={styles.usersGrid}>
                    {filteredUsers.map(player => (
                        <div key={player._id} className={styles.playerCard}>
                            <div className={styles.avatarBlock}>
                                <img
                                    src={player.avatar || 'https://api.dicebear.com/7.x/bottts/svg?seed=gaming'}
                                    alt={player.username}
                                    className={styles.avatar}
                                />
                            </div>
                            <div className={styles.infoBlock}>
                                <h3 className={styles.username}>{player.username}</h3>
                                <p className={styles.bio}>{player.bio || 'Этот игрок пока ничего не рассказал о себе.'}</p>

                                <div className={styles.gamesTags}>
                                    {player.favoriteGames && player.favoriteGames.length > 0 ? (
                                        player.favoriteGames.map((game, i) => (
                                            <span key={i} className={styles.gameTag}>{game}</span>
                                        ))
                                    ) : (
                                        <span className={styles.noGames}>Дисциплины не выбраны</span>
                                    )}
                                </div>
                            </div>
                            <Link href={`/profile/${player._id}`} className={styles.viewProfileBtn}>
                                СМОТРЕТЬ ПРОФИЛЬ
                            </Link>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}