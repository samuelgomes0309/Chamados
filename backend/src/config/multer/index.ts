import multer from "multer";

export default {
	storage: multer.memoryStorage(),
	limits: {
		fileSize: 5 * 1024 * 1024,
	},
	fileFilter(
		_req: any,
		file: Express.Multer.File,
		cb: multer.FileFilterCallback
	) {
		const allowedMimeTypes = [
			"image/jpeg",
			"image/png",
			"image/jpg",
			"application/pdf",
			"application/vnd.openxmlformats-officedocument.wordprocessingml.document",
		];
		if (allowedMimeTypes.includes(file.mimetype)) {
			cb(null, true);
		} else {
			cb(new Error("Invalid file type"));
		}
	},
};
