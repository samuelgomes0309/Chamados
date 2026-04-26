"use server";

import type { Ticket } from "@/src/@types/ticket/ticket";
import api from "@/src/lib/api";
import { CreateTicketData } from "@/src/schemas/ticket";

// Seguiremos o padrão de retorno
// {
// sucess: boolean
// data: any
// error: any
// }

//  Tipo para paginação
type PaginatedResponse<T> = {
	data: T[];
	meta: {
		total: number;
		page: number;
		limit: number;
	};
};

async function createTicketAction(ticketData: CreateTicketData) {
	try {
		// Por possuir arquivos precisar ser em formdata
		const formData = new FormData();
		formData.append("title", ticketData.title);
		formData.append("description", ticketData.description);
		formData.append("sector_id", ticketData.sector_id);
		formData.append("category_id", ticketData.category_id);
		if (ticketData.files) {
			Array.from(ticketData.files).forEach((file) => {
				formData.append("files", file);
			});
		}
		const response = await api.post<Ticket>("/tickets", formData);
		return {
			success: true,
			data: response.data,
			error: null,
		};
	} catch (error) {
		return {
			success: false,
			data: null,
			error: error instanceof Error ? error.message : "Erro desconhecido",
		};
	}
}

async function listTicketByUserAction() {
	try {
		const response = await api.get<Ticket[]>("/tickets/me");
		return {
			success: true,
			data: response.data,
			error: null,
		};
	} catch (error) {
		return {
			success: false,
			data: null,
			error: error instanceof Error ? error.message : "Erro desconhecido",
		};
	}
}

async function listTicketsAction({
	page = 1,
	limit = 10,
}: {
	page?: number;
	limit?: number;
}) {
	try {
		const response = await api.get<PaginatedResponse<Ticket>>("/tickets", {
			params: {
				page,
				limit,
			},
		});
		return {
			success: true,
			data: response.data.data,
			error: null,
			meta: {
				total: response.data.meta.total,
				page: response.data.meta.page,
				limit: response.data.meta.limit,
			},
		};
	} catch (error) {
		return {
			success: false,
			data: null,
			error: error instanceof Error ? error.message : "Erro desconhecido",
			meta: {
				page,
				limit,
				total: 0,
			},
		};
	}
}

async function assignTicketAction({ ticket_id }: { ticket_id: string }) {
	try {
		const response = await api.put(`/tickets/assign/${ticket_id}`);
		return {
			success: true,
			data: response.data,
			error: null,
		};
	} catch (error) {
		return {
			success: false,
			data: null,
			error: error instanceof Error ? error.message : "Erro desconhecido",
		};
	}
}

async function closeTicketAction({
	ticket_id,
	resolution,
}: {
	ticket_id: string;
	resolution: string;
}) {
	try {
		const response = await api.put(`/tickets/close/${ticket_id}`, {
			resolution,
		});
		return {
			success: true,
			data: response.data,
			error: null,
		};
	} catch (error) {
		return {
			success: false,
			data: null,
			error: error instanceof Error ? error.message : "Erro desconhecido",
		};
	}
}

export {
	createTicketAction,
	listTicketByUserAction,
	listTicketsAction,
	assignTicketAction,
	closeTicketAction,
};
