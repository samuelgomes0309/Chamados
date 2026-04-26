import { Request, Response, NextFunction } from "express";
import { ZodError, ZodType } from "zod";

// Middleware de validação de schema usando Zod.
// Recebe um schema Zod como parâmetro e retorna um middleware do Express.
// Uso nas rotas: router.post("/rota", validateSchema(meuSchema), controller)
const validateSchema =
	(schema: ZodType) =>
	async (req: Request, res: Response, next: NextFunction) => {
		try {
			// Valida os dados da requisição contra o schema fornecido.
			// O schema deve ser definido esperando as propriedades body, params e query.
			await schema.parseAsync({
				body: req.body, // Corpo da requisição (POST, PUT, etc.)
				params: req.params, // Parâmetros de rota (ex: /users/:id)
				query: req.query, // Query string (ex: ?page=1&limit=10)
			});
			// Validação passou — repassa o controle para o próximo middleware/controller
			return next();
		} catch (error) {
			// Verifica se o erro é de validação do Zod
			if (error instanceof ZodError) {
				return res.status(400).json({
					error: "Validation failed",
					details: error.issues.map((issue) => ({
						field: issue.path.join("."), // Caminho do campo, ex: "body.email"
						message: issue.message, // Mensagem de erro do schema
					})),
				});
			}
			// Se o erro não for erro do Zod (erro inesperado), repassa o erro para o middleware de tratamento global
			return next(error);
		}
	};

export { validateSchema };
