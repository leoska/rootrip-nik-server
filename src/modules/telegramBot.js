import { Telegraf } from "telegraf";
import config from "settings/development.json";

class TelegramBot {
    _bot = null;

    constructor() {
        this._bot = new Telegraf(config.telegram.token);
    }

    sendTemporaryPassword() {
        this._bot.sendMessage(config.telegram.channel, 'Hi everyone')
    }
}

const bot = new TelegramBot();

export default bot;