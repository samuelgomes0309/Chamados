import { DetailTicketRequest } from "../../@types/ticket/ticket";
import prismaClient from "../../config/prisma/client";
import { AppError } from "../../errors/AppError";

class DetailTicketService {
	async execute({ ticket_id, user_sector_id, user_id }: DetailTicketRequest) {
		const ticket = await prismaClient.ticket.findUnique({
			where: { id: ticket_id },
			include: {
				ticketAttachments: true,
			},
		});
		if (!ticket) {
			throw new AppError("Ticket not found", 404);
		}
		if (ticket.sector_id !== user_sector_id && ticket.user_id !== user_id) {
			throw new AppError(
				"User does not belong to the same sector as the ticket.",
				403
			);
		}
		return ticket;
	}
}

export { DetailTicketService };
