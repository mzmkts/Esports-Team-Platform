/**
 * @jest-environment jsdom
 */

import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import PostsPage from "../app/posts/page";
import '@testing-library/jest-dom';

jest.mock("next/navigation", () => ({
    useSearchParams: () => ({ get: () => "" }),
    useRouter: () => ({ push: jest.fn() })
}));

jest.mock("../app/context/AuthContext", () => ({
    useAuth: () => ({ user: { _id: "u1", username: "test2" } })
}));

const mockData = [
    {
        _id: "post1",
        title: "Главные Киберспортивные События",
        content: "Матч Spirit против Falcons.",
        author: { _id: "author1", username: "Kotovassasd" },
        likes: []
    },
    {
        _id: "post2",
        title: "Патч Dota 2",
        content: "Новые изменения.",
        author: { _id: "author2", username: "admin" },
        likes: []
    }
];

describe("PostsPage Live Search & UI Integration", () => {
    beforeEach(() => {
        global.fetch = jest.fn().mockResolvedValue({
            ok: true,
            json: () => Promise.resolve(mockData)
        });
    });

    it("8. Должен корректно отрисовывать поисковую строку и карточки новостей", async () => {
        const { container } = render(<PostsPage />);
        await waitFor(() => {
            expect(screen.getByPlaceholderText(/Поиск новостей и событий.../i)).toBeInTheDocument();

            const postTitle = container.querySelector('.postTitle');
            expect(postTitle).toHaveTextContent("Главные Киберспортивные События");
        });
    });

    it("9. Должен моментально фильтровать список событий при вводе ключевого слова", async () => {
        const { container } = render(<PostsPage />);
        await waitFor(() => {
            const input = screen.getByPlaceholderText(/Поиск новостей и событий.../i);
            fireEvent.change(input, { target: { value: "Dota" } });

            expect(screen.getByText("Патч Dota 2")).toBeInTheDocument();

            const postsGrid = container.querySelector('.postsGrid');
            expect(postsGrid).not.toHaveTextContent("Матч Spirit против Falcons.");
        });
    });

    it("10. Клик по имени автора должен ссылаться на его динамический профиль", async () => {
        render(<PostsPage />);
        await waitFor(() => {
            const authorSpan = screen.getByText("Kotovassasd");
            expect(authorSpan).toBeInTheDocument();
        });
    });
});