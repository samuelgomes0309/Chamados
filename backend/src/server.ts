import "dotenv/config";
import Express from "express";
import { router } from "./routes";
import { logger } from "./loggers/logger";
import cors from "cors";
import { AppError } from "./errors/AppError";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

const app = Express();

// Segurança HTTP
app.use(helmet());

// Limite de requisições
app.use(
	rateLimit({
		windowMs: 15 * 60 * 1000,
		max: 100,
		message: "Too many requests, please try again later",
	})
);

// Liberando para receber requisições com corpo em JSON e aceitar as requisições de diferentes origens
app.use(Express.json());
app.use(cors());

// Buscar e usar rotas
app.use(router);

// Middleware global para captar erros
app.use(
	(
		error: Error,
		_req: Express.Request,
		res: Express.Response,
		_next: Express.NextFunction
	) => {
		if (error instanceof AppError) {
			return res.status(error.statusCode).json({ error: error.message });
		}
		console.error(error);
		return res.status(500).json({ error: "Internal Server Error" });
	}
);

// A partir daqui é tudo para inicializar o servidor
const PORT = process.env.PORT || 3333;

app.listen(PORT, () => logger(PORT));
