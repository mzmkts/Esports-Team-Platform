"use client";

import { useEffect, useState, Suspense } from "react"; // Импортируем Suspense
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { API_URL } from "../libs/api";
import { useAuth } from "../context/AuthContext";
import styles from "./page.module.css";

function PostsPageContent() {
    const { user } = useAuth();
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);

    const searchParams = useSearchParams();
    const router = useRouter();

    const querySearch = searchParams.get('search') || '';
    const [localSearch, setLocalSearch] = useState(querySearch);

    useEffect(() => {
        setLocalSearch(querySearch);
    }, [querySearch]);

    useEffect(() => {
        fetch(`${API_URL}/api/posts`)
            .then((res) => res.json())
            .then((data) => {
                setPosts(Array.isArray(data) ? data : []);
                setLoading(false);
            })
            .catch((err) => {
                console.error("Ошибка при получении постов:", err);
                setLoading(false);
            });
    }, []);

    const handleLike = async (postId) => {
        if (!user) {
            alert("Необходимо авторизоваться, чтобы ставить лайки");
            return;
        }

        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`${API_URL}/api/posts/${postId}/like`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                }
            });

            if (res.ok) {
                const updatedPost = await res.json();
                setPosts((prevPosts) =>
                    prevPosts.map((post) => (post._id === postId ? updatedPost : post))
                );
            }
        } catch (err) {
            console.error("Ошибка при клике на лайк:", err);
        }
    };

    const filteredPosts = posts.filter(post =>
        post.title?.toLowerCase().includes(localSearch.toLowerCase()) ||
        post.content?.toLowerCase().includes(localSearch.toLowerCase())
    );

    const handleClearSearch = () => {
        setLocalSearch('');
        router.push('/posts');
    };

    if (loading) return <div style={{ textAlign: "center", padding: "4rem", color: "#fff" }}>Загрузка событий...</div>;

    return (
        <div className={styles.container}>
            <h1 className={styles.mainTitle}>Главные Киберспортивные События</h1>

            <div className={styles.searchBoxWrapper}>
                <input
                    type="text"
                    placeholder="Поиск новостей и событий..."
                    value={localSearch}
                    onChange={(e) => setLocalSearch(e.target.value)}
                    className={styles.pageSearchInput}
                />
                {localSearch && (
                    <button onClick={handleClearSearch} className={styles.clearSearchBtn}>×</button>
                )}
            </div>

            {filteredPosts.length === 0 ? (
                <p className={styles.emptyGridMessage}>События по запросу «{localSearch}» не найдены.</p>
            ) : (
                <div className={styles.postsGrid}>
                    {filteredPosts.map((post) => {
                        const isLikedByMe = post.likes?.includes(user?._id);

                        return (
                            <div key={post._id} className={styles.card}>
                                {post.image && (
                                    <div className={styles.imageContainer}>
                                        <img src={post.image} alt={post.title} className={styles.postImage} />
                                    </div>
                                )}

                                <div className={styles.cardBody}>
                                    <h2 className={styles.postTitle}>{post.title}</h2>
                                    <p className={styles.postContent}>{post.content}</p>

                                    <div className={styles.cardFooter}>
                                        <button
                                            onClick={() => handleLike(post._id)}
                                            className={`${styles.likeBtn} ${isLikedByMe ? styles.liked : ""}`}
                                        >
                                            <span className={styles.heartIcon}>{isLikedByMe ? "❤️" : "🤍"}</span>
                                            <span className={styles.likeCount}>{post.likes?.length || 0}</span>
                                        </button>

                                        <div className={styles.authorInfo}>
                                            Автор: <span>{post.author?.username || "Система"}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

export default function PostsPage() {
    return (
        <Suspense fallback={<div style={{ textAlign: "center", padding: "4rem", color: "#fff" }}>Загрузка публикаций...</div>}>
            <PostsPageContent />
        </Suspense>
    );
}