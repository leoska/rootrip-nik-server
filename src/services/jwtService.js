/**
 * Сервис хранит в сессии JWT токены активных сессии модераторов и админов
 * Сервис никуда не записывает токены, он хранит их только тут
 * При перезагрузки всем придется перезайти в свои аккаунты
 * 
 * 
 */
class JWTService extends Map {
    
}

const jwtService = new JWTService();

export default jwtService;