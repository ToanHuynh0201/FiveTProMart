/**
 * TableSkeleton Component
 *
 * Skeleton loader that matches the shape of data tables.
 * Prevents CLS (Cumulative Layout Shift) during loading.
 *
 * Usage:
 *   <TableSkeleton rows={5} columns={6} />
 */
import { Box, Table, Thead, Tbody, Tr, Th, Td, Skeleton } from "@chakra-ui/react";

interface TableSkeletonProps {
	/** Number of skeleton rows to display */
	rows?: number;
	/** Number of columns in the table */
	columns?: number;
	/** Column widths (optional, uses default if not provided) */
	columnWidths?: string[];
	/** Show action column (narrower, right-aligned) */
	hasActionColumn?: boolean;
}

export const TableSkeleton: React.FC<TableSkeletonProps> = ({
	rows = 5,
	columns = 6,
	columnWidths,
	hasActionColumn = true,
}) => {
	const effectiveColumns = hasActionColumn ? columns - 1 : columns;

	return (
		<Box
			bg="white"
			borderRadius="12px"
			boxShadow="sm"
			overflow="hidden">
			<Box overflowX="auto">
				<Table variant="simple">
					<Thead bg="gray.50">
						<Tr>
							{Array.from({ length: effectiveColumns }).map((_, colIndex) => (
								<Th
									key={`header-${colIndex}`}
									py={4}
									width={columnWidths?.[colIndex]}>
									<Skeleton
										height="14px"
										width={colIndex === 0 ? "80px" : "60px"}
										borderRadius="md"
									/>
								</Th>
							))}
							{hasActionColumn && (
								<Th width="100px" textAlign="center">
									<Skeleton
										height="14px"
										width="60px"
										borderRadius="md"
										mx="auto"
									/>
								</Th>
							)}
						</Tr>
					</Thead>
					<Tbody>
						{Array.from({ length: rows }).map((_, rowIndex) => (
							<Tr key={`row-${rowIndex}`}>
								{Array.from({ length: effectiveColumns }).map((_, colIndex) => (
									<Td key={`cell-${rowIndex}-${colIndex}`} py={4}>
										<Skeleton
											height="16px"
											width={getSkeletonWidth(colIndex, effectiveColumns)}
											borderRadius="md"
										/>
									</Td>
								))}
								{hasActionColumn && (
									<Td textAlign="center">
										<Skeleton
											height="32px"
											width="32px"
											borderRadius="md"
											mx="auto"
										/>
									</Td>
								)}
							</Tr>
						))}
					</Tbody>
				</Table>
			</Box>
		</Box>
	);
};

/**
 * Get skeleton width based on column position for visual variety
 */
function getSkeletonWidth(colIndex: number, totalColumns: number): string {
	// First column (usually ID/code) - shorter
	if (colIndex === 0) return "70%";
	// Second column (usually name) - longer
	if (colIndex === 1) return "90%";
	// Middle columns - medium
	if (colIndex < totalColumns - 1) return "60%";
	// Last column (before action) - shorter
	return "50%";
}

export default TableSkeleton;
