import { z } from "zod";

export const maintenanceDashboardQuerySchema = z.object({
  period: z
    .string()
    .regex(/^\d{4}-\d{2}$/, "period must be YYYY-MM")
    .default("2025-05"),
});

export type MaintenanceDashboardQuery = z.infer<typeof maintenanceDashboardQuerySchema>;
