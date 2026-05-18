'use client';
import { useState, useEffect, Suspense } from 'react'; // Добавили Suspense
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import styles from './page.module.css';
import { API_URL } from "../libs/api";

function TeamsPageContent() {
    const { token, user } = useAuth();
    const router = useRouter();
    const [teams, setTeams] = useState([]);

    const searchParams = useSearchParams();

    const querySearch = searchParams.get('search') || '';
    const [localSearch, setLocalSearch] = useState(querySearch);

    useEffect(() => {
        setLocalSearch(querySearch);
    }, [querySearch]);

    useEffect(() => { fetchTeams(); }, []);

    const fetchTeams = async () => {
        const res = await fetch(`${API_URL}/api/teams`);
        if (res.ok) setTeams(await res.json());
    };

    const handleJoinTeam = async (id) => {
        if (!token) return alert('Авторизуйтесь!');
        const res = await fetch(`${API_URL}/api/teams/${id}/join`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) fetchTeams();
    };

    const filteredTeams = teams.filter(team =>
        team.name?.toLowerCase().includes(localSearch.toLowerCase()) ||
        team.game?.toLowerCase().includes(localSearch.toLowerCase())
    );

    const handleClearSearch = () => {
        setLocalSearch('');
        router.push('/teams');
    };

    return (
        <div className={styles.teamsContainer}>
            <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                <h1 className={styles.mainTitle}>Команды</h1>

                <div className={styles.searchBoxWrapper}>
                    <input
                        type="text"
                        placeholder="Поиск по названию команды или игре..."
                        value={localSearch}
                        onChange={(e) => setLocalSearch(e.target.value)}
                        className={styles.pageSearchInput}
                    />
                    {localSearch && (
                        <button onClick={handleClearSearch} className={styles.clearSearchBtn}>×</button>
                    )}
                </div>
            </div>

            {filteredTeams.length === 0 ? (
                <p className={styles.emptyGridMessage}>Команды по запросу «{localSearch}» не найдены.</p>
            ) : (
                <div className={styles.teamsGrid}>
                    {filteredTeams.map((team) => {
                        const isMember = team.members?.some(m => (m._id || m) === user?._id);

                        return (
                            <div key={team._id} className={styles.teamCard}>
                                <div>
                                    <div className={styles.cardHeader}>
                                        <h2 className={styles.teamName}>{team.name}</h2>
                                        <span className={styles.gameBadge}>{team.game}</span>
                                    </div>
                                    <p className={styles.teamDescription}>{team.description}</p>

                                    <div className={styles.rosterSection}>
                                        <h4 className={styles.rosterTitle}>Состав ({team.members?.length || 0} / 5):</h4>
                                        <div className={styles.playersList}>
                                            {team.members?.map((member, idx) => (
                                                <div key={idx} className={styles.playerRow}>
                                                    <Link href={`/profile/${member._id || member}`} className={styles.playerLink}>
                                                        • {member.username || 'Игрок'}
                                                    </Link>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className={styles.cardActions}>
                                    {isMember ? (
                                        <button
                                            onClick={() => router.push(`/teams/${team._id}`)}
                                            className={styles.chatRoomBtn}
                                        >
                                            Комната чата
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => handleJoinTeam(team._id)}
                                            className={styles.joinBtn}
                                        >
                                            ВСТУПИТЬ В КОМАНДУ
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

export default function TeamsPage() {
    return (
        <Suspense fallback={<div style={{ textAlign: 'center', padding: "4rem", color: "#fff" }}>Загрузка списка команд...</div>}>
            <TeamsPageContent />
        </Suspense>
    );
}