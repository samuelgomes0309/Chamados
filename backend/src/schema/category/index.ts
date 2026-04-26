import z from "zod";

const createCategorySchema = z.object({
	body: z.object({
		name: z.string().min(1, "Name is required"),
		priority: z.enum(["LOW", "MEDIUM", "HIGH"]),
		sector_id: z.string().min(1, "Sector ID is required"),
	}),
});

const updateCategorySchema = z.object({
	params: z.object({
		category_id: z.string().min(1, "Category ID is required"),
	}),
	body: z.object({
		name: z.string().min(1, "Name is required").optional(),
		priority: z.enum(["LOW", "MEDIUM", "HIGH"]).optional(),
		sector_id: z.string().min(1, "Sector ID is required").optional(),
	}),
});

const deleteCategorySchema = z.object({
	params: z.object({
		category_id: z.string().min(1, "Category ID is required"),
	}),
});

const listCategorySchema = z.object({
	query: z.object({
		status: z.enum(["ACTIVE", "INACTIVE"]),
		sector_id: z.string().min(1, "Sector ID is required").optional(),
	}),
});

const detailCategorySchema = z.object({
	params: z.object({
		category_id: z.string().min(1, "Category ID is required"),
	}),
});

const toggleStatusSchema = z.object({
	params: z.object({
		category_id: z.string().min(1, "Category ID is required"),
		status: z.enum(["ACTIVE", "INACTIVE"]),
	}),
});

export {
	createCategorySchema,
	updateCategorySchema,
	deleteCategorySchema,
	listCategorySchema,
	detailCategorySchema,
	toggleStatusSchema,
};
