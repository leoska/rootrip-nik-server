import TelegramBot from './telegramBot';

/**
 * Сервис верификации действий. Когда какое-то действие юзера требует мультифакторную аутентификацию, этот сервис отвечает как раз за верификацию последующего действия юзера
 * Например, вход в аккаунт является мультифакторным
 */
class VerificationService {
    /**
     * Базовый конструктор
     */
    constructor() {
        
    }

    static get actions() {
        return [
            'USER_LOGIN',
        ]
    }


}

const service = new VerificationService();

export default service;