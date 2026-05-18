/** @type {import('next').NextConfig} */
const nextConfig = {
    async rewrites() {
        return [
            {
                // Когда фронтенд стучится сюда...
                source: '/api/uploadthing',
                // ...Next.js проксирует запрос на Express бэкенд
                destination: 'http://localhost:5000/api/uploadthing',
            },
        ];
    },
};

export default nextConfig;