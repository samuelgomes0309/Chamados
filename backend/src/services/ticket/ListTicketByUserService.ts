import prismaClient from "../../config/prisma/client";

class ListTicketByUserService {
	async execute(user_id: string) {
		const tickets = await prismaClient.ticket.findMany({
			where: {
				user_id,
			},
			include: {
				ticketAttachments: true,
				Sector: true,
				Category: true,
				User: {
					select: {
						name: true,
						email: true,
					},
				},
				AssignedUser: {
					select: { name: true, email: true },
				},
			},
			orderBy: {
				ticket_number: "asc",
			},
		});
		return tickets;
	}
}

export { ListTicketByUserService };
