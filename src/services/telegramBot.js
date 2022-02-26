import { Telegraf, Scenes, session, Markup } from "telegraf";
import config from "settings/development.json";
import prismaCall from "modules/prisma";
import colors from 'colors';

const HELP_DESCRIPTION = `
/help - подробности управление ботом
/auth - авторизация в ROOTROP-NIK
/signout - выход из ROOTROP-NIK
`;

const HELP_DESCRIPTION_ADMIN = `
${HELP_DESCRIPTION}
/register - регистрация пользователя в ROOTROP-NIK
`;

const KEYBOARD_EXIT = Markup.keyboard([ 'exit' ]).oneTime();
const KEYBOARD_REMOVE = Markup.removeKeyboard();

class TelegramBot {
    _bot = null;

    /**
     * Базовый конструктор
     */
    constructor() {
        this._bot = new Telegraf(config.telegram.token);

        const stage = new Scenes.Stage([ this._registerScene() ]);

        this._bot.use(session());
        this._bot.use(stage.middleware());

        this._bot.start((ctx) => {
            ctx.reply('Добро пожаловать в ROOTROP-NIK. Наведите /help для подробностей.');
        });

        this._registerCommands();

        this._bot.launch();

        console.info(colors.blue("[TelegramBot] Successfully initialized and started module."));

        // Enable graceful stop
        process.once('SIGINT', () => this._bot.stop('SIGINT'))
        process.once('SIGTERM', () => this._bot.stop('SIGTERM'))
    }

    /**
     * Массив админом
     * 
     * @getter
     * @public
     * @this TelegramBot
     * @returns {Array<Number>}
     */
    get admins() {
        return config.telegram.admins;
    }

    /**
     * Регистрация команд для бота
     * 
     * @private
     * @this TelegramBot
     * @returns {void}
     */
    _registerCommands() {
        // Регистрируем команду help
        this._bot.command('help', (ctx) => {
            const chatId = ctx.message.chat.id;
            const sourceId = ctx.message.from.id;

            try {
                let helpText;
                if (this.admins.includes(sourceId))
                    helpText = HELP_DESCRIPTION_ADMIN;
                else
                    helpText = HELP_DESCRIPTION;
                
                ctx.telegram.sendMessage(chatId, helpText);
            } catch(err) {
                console.error(colors.red(`[TelegramBot -> help] Error: ${err.stack}`));
            }
        });

        // Регистрируем команду auth
        this._bot.command('auth', (ctx) => {
            try {

            } catch(err) {
                console.error(colors.red(`[TelegramBot -> auth] Error: ${err.stack}`));
            }
        });

        // Регистрируем команду register
        this._bot.command('register', (ctx) => {
            const sourceId = ctx?.message?.from?.id;
            const userName = ctx?.message?.from?.username;

            try {
                if (ctx.message.chat.type !== 'private') {
                    ctx.reply(`Chat type is not private!`);
                    console.warn(colors.yellow(`[TelegramBot -> register] Chat type is not private! [${ctx.message}]`));
                    return;
                }

                if (!this.admins.includes(sourceId)) {
                    ctx.reply(`You are not admin!`);
                    console.warn(colors.yellow(`[TelegramBot -> register] User [${userName}:${sourceId}] try to register new user! [${JSON.stringify(ctx.message)}]`));
                    return;
                }

                ctx.scene.enter('register');
            } catch(err) {
                console.error(colors.red(`[TelegramBot -> register] Error: ${err.stack}`));
            }
        });
    }

    /**
     * Сцена регистрации нового пользователя в телеграме
     * 
     * @private
     * @this TelegramBot
     * @returns {Scenes.BaseScene}
     */
    _registerScene() {
        const registerScene = new Scenes.BaseScene('register');

        registerScene.enter((ctx) => {
            ctx.reply('Укажите telegram username пользователя (без символа @).', KEYBOARD_EXIT);
        });

        registerScene.on('text', (ctx) => {
            ctx.session.name = ctx.message.text;

            ctx.reply(`Попытка зарегистрировать telegram пользователя [${ctx.session.name}].`);
            ctx.scene.leave();
        });

        registerScene.leave(async (ctx) => {
            if (!ctx.session?.name) {
                ctx.reply('Отмена регистрации нового telegram пользователя.', KEYBOARD_REMOVE);
                return;
            }
            
            console.info(colors.green(`[TelegramBot -> registerScene] Try to register new telegram user [${ctx.session?.name}]`));

            try {
                const userAlreadyExists = await prismaCall('telegram.findFirst', {
                    where: {
                        username: ctx.session?.name,
                    }
                });

                if (userAlreadyExists) {
                    ctx.reply('Такой telegram пользователь в системе уже зарегистрирован!', KEYBOARD_REMOVE);
                    console.warn(colors.yellow(`[TelegramBot -> registerScene] User [${ctx.session?.name}] is already registered.`));
                    return;
                }

                const userDb = await prismaCall('telegram.create', {
                    data: {
                        username: ctx.session?.name
                    }
                });

                ctx.reply(`Telegram пользователь [@${ctx.session?.name}] успешно зарегистрирован!`, KEYBOARD_REMOVE);
                console.info(colors.green(`[TelegramBot -> register] User ${ctx.session?.name} successfully registered.`));
            } catch(err) {
                ctx.reply(`Что-то пошло не так, обратитесь к разработчику.`, KEYBOARD_REMOVE);
                console.error(colors.red(`[TelegramBot -> register] Error: ${err.stack}`));
            }
        });

        return registerScene;
    }

    /**
     * 
     * @async
     * @public
     * @this TelegramBot
     * @returns {Promise<any>}
     */
    async sendTemporaryPassword() {
        // return await this._bot.telegram.sendMessage(config.telegram.channel, 'Hi everyone');
        console.log('test');
        return await this._bot.telegram.sendMessage(50426866, 'Hi everyone');
    }

    /**
     * Высылаем временный код на подтверждение действия
     * 
     * @async
     * @public
     * @param {*} userId 
     * @param {*} code 
     * @this TelegramBot
     * @returns {Promise<void>}
     */
    async sendTemporaryVerificationCode(userId, code) {
        try {
            
        } catch(e) {

        }
    }

    /**
     * Посылаем нотификацию в канал
     * 
     * @param {*} text 
     */
    async sendNotificationToChannel(text) {
        try {
            await this._bot.telegram.sendMessage(config.telegram.channel, text);
        } catch(e) {

        }
    }
}

const bot = new TelegramBot();

export default bot;