import { ChevronLeft, ChevronRight } from "lucide-react";
import {
	Pagination,
	PaginationContent,
	PaginationItem,
	PaginationLink,
} from "../ui/pagination";
import { cn } from "@/src/lib/utils";

interface PaginationDashboardProps {
	page: number;
	limit: number;
	total: number;
	onPageChange: (page: number) => void;
}

export function PaginationDashboard({
	page,
	limit,
	total,
	onPageChange,
}: PaginationDashboardProps) {
	const totalPages = Math.ceil(total / limit);
	const isFirstPage = page <= 1;
	const isLastPage = page >= totalPages;
	return (
		<Pagination>
			<PaginationContent className="mt-10 gap-1">
				<PaginationItem>
					<PaginationLink
						href="#"
						onClick={() => !isFirstPage && onPageChange(page - 1)}
						aria-disabled={isFirstPage}
						className={cn(
							isFirstPage
								? "pointer-events-none h-9 gap-1 border border-snow/15 bg-steel px-4 py-2 text-white/20"
								: "h-9 gap-1 border border-snow/15 bg-steel px-4 py-2 text-white/70 hover:border-teal/40 hover:bg-steel hover:text-white",
							"w-full"
						)}
					>
						<ChevronLeft className="size-4" />
						Anterior
					</PaginationLink>
				</PaginationItem>
				{Array.from(
					{ length: totalPages },
					(_, pageIndex) => pageIndex + 1
				).map((pageNumber) => (
					<PaginationItem key={pageNumber}>
						<PaginationLink
							href="#"
							isActive={pageNumber === page}
							onClick={() => onPageChange(pageNumber)}
							className={
								pageNumber === page
									? "size-9 border border-teal/40 bg-teal/20 text-white hover:bg-teal/30"
									: "size-9 border border-snow/15 bg-steel text-white/70 hover:border-teal/40 hover:bg-steel hover:text-white"
							}
						>
							{pageNumber}
						</PaginationLink>
					</PaginationItem>
				))}
				<PaginationItem>
					<PaginationLink
						href="#"
						onClick={() => !isLastPage && onPageChange(page + 1)}
						aria-disabled={isLastPage}
						className={cn(
							isLastPage
								? "pointer-events-none h-9 gap-1 border border-snow/15 bg-steel px-4 py-2 text-white/20"
								: "h-9 gap-1 border border-snow/15 bg-steel px-4 py-2 text-white/70 hover:border-teal/40 hover:bg-steel hover:text-white",
							"w-full"
						)}
					>
						Próximo
						<ChevronRight className="size-4" />
					</PaginationLink>
				</PaginationItem>
			</PaginationContent>
		</Pagination>
	);
}
