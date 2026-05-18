const mongoose = require('mongoose');
const User = require('../models/User');

describe('User Model Unit Tests', () => {
    it('1. Должен успешно валидировать корректный объект пользователя', () => {
        const validUser = new User({
            username: 'kalzhan',
            password: 'kalzhan',
            email: 'kalzhan@gmail.com',
            bio: 'Про-игрок в Valorant',
            favoriteGames: ['Valorant', 'Dota 2']
        });
        const error = validUser.validateSync();
        expect(error).toBeUndefined();
    });

    it('2. Должен выдать ошибку валидации, если отсутствует поле username', () => {
        const invalidUser = new User({ bio: 'Без никнейма' });
        const error = invalidUser.validateSync();
        expect(error).toBeDefined();
        expect(error.errors.username).toBeDefined();
    });
});