import app from "./src/Application";
import { timeout } from "modules/utilsMethods";
import colors from 'colors';

// Время ожидания остановки процееса (в миллисекундах)
const EXIT_MAX_WAIT = 10000; // 10 secs
let APPLICATION_ALREADY_STOPPING = false;

try {
    (async () => {
        await app.init();
    })();
} catch(e) {
    console.error(colors.red(`Application can't start corrent: ${e}`));
    process.exit(1);
}

// Обработка остановки сервера
process.on('SIGINT', async () => {
    try {
        if (APPLICATION_ALREADY_STOPPING)
            return;

        APPLICATION_ALREADY_STOPPING = true;
        console.warn(colors.bgRed(`Received SIGINT signal! Application try to stop.`));

        await Promise.race([
            app.stop(),
            timeout(EXIT_MAX_WAIT),
        ]);
    } catch(e) {
        console.error(colors.red(`Application can't stop correct: ${e}`));
        process.exit(1);
    }

    process.exit(0);
});