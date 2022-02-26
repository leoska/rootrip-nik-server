import { Telegraf } from "telegraf";
import config from "settings/development.json";

class TelegramBot {
    _bot = null;

    constructor() {
        this._bot = new Telegraf(config.telegram.token);
        this._bot.launch();

        // Enable graceful stop
        process.once('SIGINT', () => this._bot.stop('SIGINT'))
        process.once('SIGTERM', () => this._bot.stop('SIGTERM'))
    }

    async sendTemporaryPassword() {
        return await this._bot.telegram.sendMessage(config.telegram.channel, 'Hi everyone');
    }
}

const bot = new TelegramBot();

export default bot;