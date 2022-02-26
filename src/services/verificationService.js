import TelegramBot from './telegramBot';

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