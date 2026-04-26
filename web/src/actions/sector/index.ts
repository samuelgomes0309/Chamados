"use server";

import { Sector } from "@/src/@types/sector/sector";
import api from "@/src/lib/api";
import { CreateSectorData } from "@/src/schemas/sector";

// Seguiremos o padrão de retorno
// {
// sucess: boolean
// data: any
// error: any
// }

async function createSectorAction(sectorData: CreateSectorData) {
	try {
		const response = await api.post<Sector>("/sectors", {
			name: sectorData.name,
			description: sectorData.description,
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

async function listSectorAction({ status }: { status: "ACTIVE" | "INACTIVE" }) {
	try {
		const response = await api.get<Sector[]>("/sectors", {
			params: { status },
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

export { createSectorAction, listSectorAction };
