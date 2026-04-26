import { AssignedTicketRequest } from "../../@types/ticket/ticket";
import prismaClient from "../../config/prisma/client";
import { AppError } from "../../errors/AppError";

class AssignedTicketService {
	async execute({ user_id, ticket_id, user_sector_id }: AssignedTicketRequest) {
		const ticket = await prismaClient.ticket.findUnique({
			where: { id: ticket_id },
		});
		if (!ticket) {
			throw new AppError("Ticket not found", 404);
		}
		if (ticket.assigned_to || ticket.status === "CLOSED") {
			throw new AppError(
				"Ticket is already assigned to another user or status closed",
				409
			);
		}
		if (ticket.sector_id !== user_sector_id) {
			throw new AppError(
				"User does not belong to the same sector as the ticket.",
				403
			);
		}
		if (ticket.user_id === user_id) {
			throw new AppError(
				"It cannot be attributed to the person who opened the ticket.",
				403
			);
		}
		const updatedTicket = await prismaClient.ticket.update({
			where: { id: ticket_id },
			data: {
				AssignedUser: {
					connect: { id: user_id },
				},
				status: "IN_PROGRESS",
				started_at: new Date(),
			},
			include: {
				ticketAttachments: true,
				AssignedUser: {
					select: { name: true },
				},
			},
		});
		return updatedTicket;
	}
}
export { AssignedTicketService };
