interface CreateTicketRequest {
	description: string;
	title: string;
	sector_id: string;
	category_id: string;
	user_id: string;
	files: Express.Multer.File[] | undefined;
}

interface AssignedTicketRequest {
	user_id: string;
	ticket_id: string;
	user_sector_id: string;
}

interface CloseTicketRequest {
	user_id: string;
	ticket_id: string;
	user_sector_id: string;
	resolution: string;
}

interface DetailTicketRequest {
	user_id: string;
	ticket_id: string;
	user_sector_id: string;
}

interface ListTicketRequest {
	page?: number;
	limit?: number;
	role?: "ADMIN" | "USER";
	user_sector_id?: string;
	sector_id?: string;
	everySector?: boolean;
	status?: "OPEN" | "CLOSED" | "IN_PROGRESS";
}

export {
	CreateTicketRequest,
	AssignedTicketRequest,
	CloseTicketRequest,
	DetailTicketRequest,
	ListTicketRequest,
};
