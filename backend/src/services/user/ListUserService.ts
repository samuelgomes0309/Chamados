import prismaClient from "../../config/prisma/client";

class ListUserService {
	async execute() {
		const users = await prismaClient.user.findMany({
			select: {
				id: true,
				name: true,
				email: true,
				role: true,
				sector_id: true,
				created_at: true,
				updated_at: true,
			},
		});
		//  Se tiver ok, se nao vai retornar []
		return users;
	}
}

export { ListUserService };
