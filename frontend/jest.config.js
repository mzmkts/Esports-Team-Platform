module.exports = {
    // Указываем Jest, что тесты будут запускаться в среде браузера (jsdom)
    testEnvironment: "jest-environment-jsdom",

    // Мы убрали setupFilesAfterEnv, так как импорт уже внутри самого теста

    // Говорим Jest трансформировать JS/JSX код через Babel
    transform: {
        "^.+\\.(js|jsx|ts|tsx)$": "babel-jest",
    },

    // Магия против CSS: превращаем импорты стилей в безопасные заглушки
    moduleNameMapper: {
        "\\.(css|less|sass|scss)$": "identity-obj-proxy",
        "^@/(.*)$": "<rootDir>/$1",
    },
};