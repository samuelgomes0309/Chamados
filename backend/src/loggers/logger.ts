import { red, green, yellow, cyanBright } from "console-log-colors";

// Mensagem de inicialização do servidor
//  [INFO] Servidor iniciado na porta <PORT> - [DD/MM/YYYY HH:MM:SS]
const logger = (port: number | string) => {
	const info = green("[INFO] ");
	const message = yellow("Servidor iniciado na porta ");
	const timestamp = cyanBright(new Date().toLocaleString());
	console.log(`${info}${message}${red(port)} - [${timestamp}]`);
};

export { logger };
