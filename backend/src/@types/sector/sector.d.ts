interface CreateSectorRequest {
	name: string;
	description: string;
}

interface DeleteSectorRequest {
	sector_id: string;
}

interface UpdateSectorRequest {
	sector_id: string;
	name: string;
	description: string;
}

interface DetailSectorRequest {
	sector_id: string;
}

interface ToggleStatusRequest {
	sector_id: string;
	status: "ACTIVE" | "INACTIVE";
}

interface ListSectorRequest {
	status: "ACTIVE" | "INACTIVE";
}

export {
	ListSectorRequest,
	CreateSectorRequest,
	DeleteSectorRequest,
	UpdateSectorRequest,
	DetailSectorRequest,
	ToggleStatusRequest,
};
