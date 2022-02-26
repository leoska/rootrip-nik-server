import BaseApi from '../../BaseApi';
import { method } from 'modules/utilsMethods';
import ErrorApiMethod from 'modules/ErrorApiMethod';
import prismaCall from 'modules/prisma';
import bcrypt from 'bcrypt';
import config from 'settings/development.json';

@method("POST")
export default class UserAuthorize extends BaseApi {
    /**
     * Базовый конструктор класса
     *
     * @constructor
     * @this UserAuthorize
     */
    constructor() {
        super();
    }

    /**
     * Все латинские буквы (большие и маленькие) + некоторые специальные символы и цифры (общая длина от 6 до 20 знаков)
     * 
     * @static
     * @getter
     * @returns {RegExp}
     */
    static get PASSWORD_REGEX() {
        return /^(?=.*?[a-zA-Z0-9])(?!.*?[=?<>()'"\/\&]).{6,20}$/;
    }

    /**
     * RFC 2822
     * https://www.regular-expressions.info/email.html
     * 
     * @static
     * @getter
     * @returns {RegExp}
     */
    static get EMAIL_REGEX() {
        return /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/;
    }

    /**
     * Метод для первичный авторизации на сервере
     *
     * @override
     * @this UserAuthorize
     * @returns {Promise<boolean>}
     */
    async process({ session }, { buffer }) {
        const decodeBuffer = Buffer.from(buffer, 'base64').toString();
        const data = JSON.parse(decodeBuffer);

        // Валидируем почту
        const email = data.email;
        if (!UserAuthorize.EMAIL_REGEX.test(email))
            throw new ErrorApiMethod('Email is invalid!', 'EMAIL_IS_INVALID', 400);

        // Валидируем пароль
        const password = data.password;
        if (!UserAuthorize.PASSWORD_REGEX.test(password))
            throw new ErrorApiMethod('Password must contains only a characters, digits and special symbols. Length is minimum 8 and maximum 20.', 'PASSWORD_IS_INVALID', 400);

        // Ищем пользователя в базе данных
        const userDb = await prismaCall('user.findFirst', {
            where: {
                email,
            }
        });

        // Если пользователь не найден, отдаём ошибку
        if (!userDb)
            throw new ErrorApiMethod(`User with mail: [${email}] is not exists.`, 'USER_NOT_FOUND', 500);

        // Проверяем пароль
        const match = await bcrypt.compare(password, userDb.password);
        if (!match)
            throw new ErrorApiMethod('Incorrect password!', 'PASSWORD_DOESNT_MATCH', 500);

        // Удаляем password из объекта, он не требуется в дальшейней логике
        delete userDb['password'];

        // Используется ли мультифакторная авторизация?
        if (config.authorization.multiFactor) {
            
        } else {

        }
    }

}
