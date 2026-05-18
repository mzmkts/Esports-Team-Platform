'use client';
import Link from 'next/link';
import styles from './PostCard.module.css';

export default function PostCard({ post, currentUserId, onLike }) {
    const isLikedByMe = post.likes?.includes(currentUserId);

    return (
        <div className={styles.card}>
            <div className={styles.imageWrapper}>
                <img src={post.image || 'https://utfs.io/f/default-news.png'} alt={post.title} className={styles.image} />
                {post.tags?.[0] && <span className={styles.tag}>{post.tags[0]}</span>}
            </div>
            <div className={styles.content}>
                <div>
                    <h3 className={styles.title}>{post.title}</h3>
                    <p className={styles.description}>{post.content}</p>
                </div>

                <div className={styles.footer}>
                    <div className={styles.metaLeft}>
                        <button
                            onClick={() => onLike?.(post._id)}
                            className={`${styles.likeBtn} ${isLikedByMe ? styles.liked : ''}`}
                        >
                            <span className={styles.heartIcon}>{isLikedByMe ? '❤️' : '🤍'}</span>
                            <span className={styles.likeCount}>{post.likes?.length || 0}</span>
                        </button>
                        <Link href={`/profile/${post.author._id}`} className={styles.authorLink}>
                            <img
                                src={post.author.avatar || 'https://api.dicebear.com/7.x/bottts/svg?seed=gaming'}
                                alt={post.author.username}
                                className={styles.authorAvatar}
                            />
                            <span className={styles.authorName}>{post.author.username}</span>
                        </Link>
                    </div>

                    <Link href={`/posts/${post._id}`} className={styles.link}>
                        Читать →
                    </Link>
                </div>
            </div>
        </div>
    );
}