import { ToggleStatusRequest } from "../../@types/sector/sector";
import prismaClient from "../../config/prisma/client";
import { AppError } from "../../errors/AppError";

class ToggleStatusService {
	async execute({ sector_id, status }: ToggleStatusRequest) {
		const sector = await prismaClient.sector.findUnique({
			where: { id: sector_id },
		});
		if (!sector) {
			throw new AppError("Sector not found", 404);
		}
		// Impede atualização desnecessária se o status já for o desejado
		if (sector.status === status) {
			throw new AppError("Sector is already in the desired status", 409);
		}
		// Só verifica tickets abertos ou em progresso ao inativar — reativar não precisa dessa checagem
		if (status === "INACTIVE") {
			const hasTicketsOpen = await prismaClient.ticket.findFirst({
				where: { sector_id, status: { in: ["IN_PROGRESS", "OPEN"] } },
			});
			if (hasTicketsOpen) {
				throw new AppError(
					"Cannot change status of sector with open tickets",
					409
				);
			}
		}
		const [updatedSector, _updatedCategories] = await prismaClient.$transaction(
			[
				prismaClient.sector.update({
					where: { id: sector_id },
					data: { status },
				}),
				prismaClient.category.updateMany({
					where: { sector_id },
					data: { status },
				}),
			]
		);
		return updatedSector;
	}
}

export { ToggleStatusService };
