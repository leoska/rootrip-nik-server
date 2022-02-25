import BaseApi from '../BaseApi';
import { method } from 'modules/utilsMethods';
import nodemailer from 'nodemailer';
import colors from 'colors';
import ErrorApiMethod from 'modules/ErrorApiMethod';
import prismaCall from 'modules/prisma';
import { existsSync } from 'fs-extra';

@method("POST")
export default class SendReport extends BaseApi {
    /**
     * Базовый конструктор класса
     *
     * @constructor
     * @this Ping
     */
    constructor() {
        super();
    }

    /**
     * Почта получателя
     * 
     * @getter
     * @public
     * @this {SendReport}
     * @returns {String}
     */
    get emailReceiver() {
        return "info@troparevo-nikulino.org";
    }

    /**
     * Максимальный размер текста обращения в байтах
     * 
     * @getter
     * @public
     * @this {SendReport}
     * @returns {Number}
     */
    get maxBodySize() {
        return 65000;
    }

    /**
     * Получение название категории по его типу
     * 
     * @private
     * @param {String} category 
     * @this {SendReport}
     * @returns {String}
     */
    _getCategory(category) {
        switch(category) {
            case 'zhile-nedvizhimost-zemlya':
                return 'ЖКХ';

            case 'obrazovanie':
                return 'Образование';

            case 'zdorove':
                return 'Здоровье';

            case 'transport':
                return 'Транспорт';

            case 'semya-deti':
                return 'Семья, дети';

            case 'socialnaya-podderzhka':
                return 'Социальная поддержка';

            case 'sport-otdyh':
                return 'Культура, отдых, спорт';

            case 'dokumenty':
                return 'Документы';

            case 'rabota':
                return 'Работа';

            case 'invalidy':
                return 'Инвалиды';

            case 'grazhdanskaya-aktivnost':
                return 'Гражданская активность';

            case 'zhivotnye-i-okruzhayuschiy-mir':
                return 'Животные и окружающий мир';

            default:
                return 'Другое';
        }
    }

    _getHtml(data) {
        return  `
            <div style="display: flex; flex-direction: column">
                <h3>
                    Основные данные:
                </h3>
                <ul>
                    <li>
                        Имя: ${data.userName}\n
                    </li>
                    <li> 
                        Почта: <a href="mailto:${data.email}">${data.email}</a>
                    </li>
                    <li>
                        Телефон: <a href="tel:${data.phoneNumber}">${data.phoneNumber}</a>
                    </li>
                    <li>
                        Категория: ${this._getCategory(data.category)}
                    </li>
                    <li>
                        Приложен ли файл: <b>${data.fileInfo ? "Да" : "Нет"}</b>
                    </li>
                </ul>
                <h5>
                    Текст обращения:
                </h5>
                <span>${data.textBody}</span>
            </div>
        `;
    };

    /**
     * Дебаговый API-метод для проверки работы сервера
     *
     * @override
     * @this SendReport
     * @returns {Promise<boolean>}
     */
    async process({ session }, { buffer }) {
        const decodeBuffer = Buffer.from(buffer, 'base64').toString();
        const data = JSON.parse(decodeBuffer);

        data['textBody'] = String(data['textBody'] || '');

        if (data.textBody.length > this.maxBodySize)
            throw new ErrorApiMethod("textBody size is greater that 65000 bytes.", "Payload Too Large", 413);

        const transporter = nodemailer.createTransport({
            host: "smtp.yandex.ru",
            port: 465,
            secure: true,
            auth: {
                user: "server@troparevo-nikulino.org",
                pass: "aA12345a",
            }
        });

        const text = `
            Имя: ${data.userName}\n
            Почта: ${data.email}\n
            Телефон: ${data.phoneNumber}\n
            Категория: ${this._getCategory(data.category)}\n
            Приложен ли файл: ${data.fileInfo ? "Да" : "Нет"}\n
            Текст обращения:\n
            ${data.textBody}
        `;

        const html = this._getHtml(data);

        const mailOptions = {
            from: "server@troparevo-nikulino.org",
            // to: this.emailReceiver,
            to: "leo77551@yandex.ru",
            subject: `[${this._getCategory(data.category)}] Обращение от ${data.name || data.phoneNumber}`,
            text,
            html,
        };

        if (data.fileInfo) {
            mailOptions.attachments = [{
                filename: data.fileInfo.name,
                path: `${process.cwd()}/ufiles/${data.fileInfo.path}`
            }];
        }

        return new Promise((resolve, reject) => {
            transporter.sendMail(mailOptions, (err, info) => {
                if (err)
                    reject(err);

                console.log(colors.cyan('Email sent: ' + info.response));
                resolve(true);
            });
        });
    }

}
