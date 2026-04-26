import prismaClient from "../../config/prisma/client";
import { AppError } from "../../errors/AppError";

class DetailSectorService {
	async execute({ sector_id }: { sector_id: string }) {
		const sector = await prismaClient.sector.findUnique({
			where: { id: sector_id },
		});
		if (!sector) {
			throw new AppError("Sector not found", 404);
		}
		return sector;
	}
}

export { DetailSectorService };
