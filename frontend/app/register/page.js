'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { API_URL } from '../libs/api';
import styles from './page.module.css';

export default function RegisterPage() {
    const [form, setForm] = useState({ username: '', email: '', password: '' });
    const router = useRouter();

    const handleSubmit = async (e) => {
        e.preventDefault();
        const res = await fetch(`${API_URL}/api/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(form)
        });

        if (res.ok) {
            alert('Регистрация успешна! Теперь воойдите.');
            router.push('/login');
        } else {
            const data = await res.json();
            alert(data.message || 'Ошибка регистрации');
        }
    };

    return (
        <div className={styles.authContainer}>
            <h2 className={styles.title}>Создать <span>Аккаунт</span></h2>
            <form onSubmit={handleSubmit}>
                <div className={styles.formGroup}>
                    <label>Имя пользователя (Никнейм)</label>
                    <input
                        type="text"
                        required
                        className={styles.input}
                        value={form.username}
                        onChange={e => setForm({...form, username: e.target.value})}
                    />
                </div>
                <div className={styles.formGroup}>
                    <label>Email адрес</label>
                    <input
                        type="email"
                        required
                        className={styles.input}
                        value={form.email}
                        onChange={e => setForm({...form, email: e.target.value})}
                    />
                </div>
                <div className={styles.formGroup}>
                    <label>Пароль</label>
                    <input
                        type="password"
                        required
                        className={styles.input}
                        value={form.password}
                        onChange={e => setForm({...form, password: e.target.value})}
                    />
                </div>
                <button type="submit" className={styles.submitBtn}>Зарегистрироваться</button>
            </form>
            <p className={styles.switchText}>
                Уже есть аккаунт? <Link href="/login" className={styles.link}>Войти</Link>
            </p>
        </div>
    );
}