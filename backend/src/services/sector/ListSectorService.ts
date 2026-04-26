import { ListSectorRequest } from "../../@types/sector/sector";
import prismaClient from "../../config/prisma/client";

class ListSectorService {
	async execute({ status }: ListSectorRequest) {
		const sectors = await prismaClient.sector.findMany({
			where: {
				status,
			},
			include: {
				categories: true,
			},
		});
		return sectors;
	}
}

export { ListSectorService };
