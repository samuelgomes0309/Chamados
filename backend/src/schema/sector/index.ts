import z from "zod";

const listSectorSchema = z.object({
	query: z.object({
		status: z.enum(["ACTIVE", "INACTIVE"]),
	}),
});

const createSectorSchema = z.object({
	body: z.object({
		name: z.string().min(1, "Name is required"),
		description: z.string().min(1, "Description is required"),
	}),
});

const deleteSectorSchema = z.object({
	params: z.object({
		sector_id: z.string().min(1, "Sector ID is required"),
	}),
});

const updateSectorSchema = z.object({
	params: z.object({
		sector_id: z.string().min(1, "Sector ID is required"),
	}),
	body: z.object({
		name: z.string().min(1, "Name is required").optional(),
		description: z.string().min(1, "Description is required").optional(),
	}),
});

const detailSectorSchema = z.object({
	params: z.object({
		sector_id: z.string().min(1, "Sector ID is required"),
	}),
});

const toggleStatusSchema = z.object({
	params: z.object({
		sector_id: z.string().min(1, "Sector ID is required"),
		status: z.enum(["ACTIVE", "INACTIVE"]),
	}),
});

export {
	createSectorSchema,
	deleteSectorSchema,
	updateSectorSchema,
	detailSectorSchema,
	toggleStatusSchema,
	listSectorSchema,
};
