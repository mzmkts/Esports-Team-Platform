import './globals.css';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';

export const metadata = {
    title: 'CYBER_NET - Gaming Platform',
    description: 'MERN Stack Gaming Community Platform',
};

export default function RootLayout({ children }) {
    return (
        <html lang="ru">
        <body>
        <AuthProvider>
            <Navbar />
            <main>
                {children}
            </main>
        </AuthProvider>
        </body>
        </html>
    );
}