import z from "zod";

const createTicketSchema = z.object({
	body: z.object({
		description: z.string().min(1, "Description is required"),
		title: z.string().min(1, "Title is required"),
		sector_id: z.string().min(1, "Sector ID is required"),
		category_id: z.string().min(1, "Category ID is required"),
	}),
});

const assignTicketSchema = z.object({
	params: z.object({
		ticket_id: z.string().min(1, "Ticket ID is required"),
	}),
});

const closeTicketSchema = z.object({
	body: z.object({
		resolution: z.string().min(1, "Resolution is required"),
	}),
	params: z.object({
		ticket_id: z.string().min(1, "Ticket ID is required"),
	}),
});

const detailTicketSchema = z.object({
	params: z.object({
		ticket_id: z.string().min(1, "Ticket ID is required"),
	}),
});

const listTicketSchema = z.object({
	query: z.object({
		page: z.coerce.number().int().min(1, "Page must be at least 1").optional(),
		limit: z.coerce
			.number()
			.int()
			.min(1, "Limit must be at least 1")
			.optional(),
		everySector: z.string().optional(),
		sector_id: z.string().optional(),
		status: z.enum(["OPEN", "IN_PROGRESS", "CLOSED"]).optional(),
	}),
});

export {
	createTicketSchema,
	assignTicketSchema,
	closeTicketSchema,
	detailTicketSchema,
	listTicketSchema,
};
