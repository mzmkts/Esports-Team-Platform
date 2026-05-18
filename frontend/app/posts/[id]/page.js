'use client';
import { useEffect, useState, use } from 'react';
import { API_URL } from '../../libs/api';
import styles from './page.module.css';
import Link from "next/link";

export default function PostDetailPage({ params }) {
    const { id } = use(params);
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`${API_URL}/api/posts/${id}`)
            .then(res => res.json())
            .then(data => {
                setPost(data);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, [id]);

    if (loading) return <div style={{textAlign:'center', padding:'4rem'}}>Загрузка публикации...</div>;
    if (!post) return <div style={{textAlign:'center', padding:'4rem'}}>Статья не найдена.</div>;

    return (
        <article className={styles.articleContainer}>
            <img
                src={post.image || 'https://utfs.io/f/default-news.png'}
                alt={post.title}
                className={styles.imageHero}
            />

            <div className={styles.body}>

                <div className={styles.meta}>
                    <Link href={`/profile/${post.author._id}`} className={styles.authorLink}>
                        <img
                            src={post.author.avatar || 'https://api.dicebear.com/7.x/bottts/svg?seed=gaming'}
                            alt={post.author.username}
                            className={styles.authorAvatar}
                        />
                        <span className={styles.authorName}>{post.author.username}</span>
                    </Link>
                    <span>{new Date(post.createdAt).toLocaleDateString('ru-RU')}</span>
                </div>
                <h1 className={styles.title}>{post.title}</h1>
                <p className={styles.text}>{post.content}</p>
            </div>
        </article>
    );
}