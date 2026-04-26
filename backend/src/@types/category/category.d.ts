interface CreateCategoryRequest {
	name: string;
	priority: "LOW" | "MEDIUM" | "HIGH";
	sector_id: string;
}

interface UpdateCategoryRequest {
	category_id: string;
	name?: string;
	priority?: "LOW" | "MEDIUM" | "HIGH";
	sector_id?: string;
}

interface DeleteCategoryRequest {
	category_id: string;
}

interface ListCategoryRequest {
	status: "ACTIVE" | "INACTIVE";
	sector_id?: string;
}

interface DetailCategoryRequest {
	category_id: string;
}

interface CategoryToggleStatusRequest {
	category_id: string;
	status: "ACTIVE" | "INACTIVE";
}

export {
	CreateCategoryRequest,
	UpdateCategoryRequest,
	DeleteCategoryRequest,
	ListCategoryRequest,
	DetailCategoryRequest,
	CategoryToggleStatusRequest,
};
