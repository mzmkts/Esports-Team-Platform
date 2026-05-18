'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import styles from './auth.module.css';

export default function LoginPage() {
    const [form, setForm] = useState({ email: '', password: '' });
    const { login } = useAuth();

    const handleSubmit = (e) => {
        e.preventDefault();
        login(form.email, form.password);
    };

    return (
        <div className={styles.authContainer}>
            <h2 className={styles.title}>Войти в <span>Cyber_Net</span></h2>
            <form onSubmit={handleSubmit}>
                <div className={styles.formGroup}>
                    <label>Email</label>
                    <input type="email" required className={styles.input} onChange={e => setForm({...form, email: e.target.value})} />
                </div>
                <div className={styles.formGroup}>
                    <label>Пароль</label>
                    <input type="password" required className={styles.input} onChange={e => setForm({...form, password: e.target.value})} />
                </div>
                <button type="submit" className={styles.submitBtn}>Войти</button>
            </form>
            <p className={styles.switchText}>
                Нет аккаунта? <Link href="/register" className={styles.link}>Создать</Link>
            </p>
        </div>
    );
}