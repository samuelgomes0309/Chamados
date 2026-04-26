interface Category {
	id: string;
	name: string;
	status: "ACTIVE" | "INACTIVE";
	created_at: string;
	updated_at: string;
	sector: {
		id: string;
		name: string;
		description: string;
		status: "ACTIVE" | "INACTIVE";
	};
}

export { Category };
