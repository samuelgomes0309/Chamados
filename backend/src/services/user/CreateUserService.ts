import { CreateUserRequest } from "../../@types/user/user";
import bcrypt from "bcryptjs";
import prismaClient from "../../config/prisma/client";
import { Prisma } from "../../generated/prisma/client";
import { AppError } from "../../errors/AppError";

// FLUXO COMPLETO
// recebe { email, name, password }
//
// busca email + conta usuários (paralelo)
//
// email já existe? -> erro
//
// hash da senha
//
// tenta criar no banco ->
//      sucesso -> retorna usuário (sem senha)
//      P2002   -> erro "Root user already exists" (race condition)
//      outro   -> relança o erro

class CreateUserService {
	async execute({ email, name, password }: CreateUserRequest) {
		const [userAlreadyExists, userIsRoot] = await Promise.all([
			prismaClient.user.findUnique({
				where: {
					email: email,
				},
			}),
			prismaClient.user.count(),
		]);
		if (userAlreadyExists) {
			throw new AppError("User already exists", 409);
		}
		// Senha criptografada com salt de 10
		const hashedPassword = await bcrypt.hash(password, 10);
		try {
			const user = await prismaClient.user.create({
				data: {
					email,
					name,
					password: hashedPassword,
					isRoot: userIsRoot === 0, // O primeiro usuário criado será root e tambem terá acesso ADMIN
					role: userIsRoot === 0 ? "ADMIN" : "USER",
				},
				select: {
					id: true,
					name: true,
					email: true,
					role: true,
					created_at: true,
					updated_at: true,
				},
			});
			return user;
		} catch (error) {
			if (error instanceof Prisma.PrismaClientKnownRequestError) {
				if (error.code === "P2002") {
					const target = (error.meta?.target as string[]) ?? [];
					if (target.includes("email")) {
						// Race condition: dois requests simultâneos com o mesmo email
						throw new AppError("User already exists", 409);
					}
					// Outra constraint única violada (ex: isRoot)
					throw new AppError("Root user already exists", 409);
				}
			}
			throw error;
		}
	}
}

export { CreateUserService };
