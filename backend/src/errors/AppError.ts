// AppError customizar erros para que o status venha correto.
class AppError extends Error {
	public readonly statusCode: number;
	constructor(message: string, statusCode: number = 400) {
		super(message);
		this.statusCode = statusCode;
		this.name = "AppError";
	}
}

export { AppError };
