'use client';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import { usePathname } from 'next/navigation';
import styles from './Navbar.module.css';

export default function Navbar() {
    const { user, logout } = useAuth();
    const pathname = usePathname();

    return (
        <nav className={styles.nav}>
            <div className={styles.container}>
                <Link href="/" className={styles.logoGroup}>
                    <span className={styles.logoText}>
                        CYBER<span className={styles.logoWhite}>_NET</span>
                    </span>
                </Link>

                <div className={styles.menu}>
                    <Link href="/" className={`${styles.navLink} ${pathname === '/' ? styles.activeOrange : ''}`}>
                        Новости
                    </Link>
                    {/* Новая ссылка на страницу всех игроков */}
                    <Link href="/users" className={`${styles.navLink} ${pathname === '/users' ? styles.activeGreen : ''}`}>
                        Игроки
                    </Link>
                    <Link href="/teams" className={`${styles.navLink} ${pathname === '/teams' ? styles.activeCyan : ''}`}>
                        Команды
                    </Link>
                    {user && (
                        <Link href="/dashboard" className={`${styles.navLink} ${pathname === '/dashboard' ? styles.activePurple : ''}`}>
                            Панель
                        </Link>
                    )}
                </div>

                <div className={styles.authBlock}>
                    {user ? (
                        <div className={styles.userControls}>
                            {/* Для красоты: перенаправляем на конкретный ID пользователя, если он есть */}
                            <Link href={`/profile/${user._id || ''}`} className={styles.profileBadge}>
                                <img
                                    src={user.avatar || 'https://api.dicebear.com/7.x/bottts/svg?seed=gaming'}
                                    alt="avatar"
                                    className={styles.avatarMini}
                                />
                                <span className={styles.usernameText}>{user.username}</span>
                            </Link>
                            <button onClick={logout} className={styles.logoutBtn}>ВЫЙТИ</button>
                        </div>
                    ) : (
                        <div className={styles.guestLinks}>
                            <Link href="/login" className={styles.loginLink}>Войти</Link>
                            <Link href="/register" className={styles.registerBtn}>Регистрация</Link>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
}