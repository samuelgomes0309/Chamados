import prismaClient from "../../config/prisma/client";
import { AppError } from "../../errors/AppError";

class DetailUserService {
	async execute(user_id: string) {
		const user = await prismaClient.user.findUnique({
			where: { id: user_id },
			select: {
				id: true,
				name: true,
				email: true,
				role: true,
				sector_id: true,
			},
		});
		if (!user) {
			throw new AppError("User not found", 404);
		}
		return user;
	}
}

export { DetailUserService };
