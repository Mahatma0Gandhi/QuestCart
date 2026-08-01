import { z } from "zod";

export const ProcurementPlanSchema = z.object({
  clarification_needed: z.boolean(),
  clarification_question: z.string().optional().describe("Ask this if information like budget or specific use-case is missing"),
  mission: z.string().optional(),
  budget: z.number().optional(),
  currency: z.string().default("INR"),
  procurement_plan: z.array(z.object({
    category: z.string(),
    priority: z.enum(["required", "recommended", "optional"]),
    target_budget: z.number(),
    selection_criteria: z.array(z.string()).describe("Technical specs or qualities to look for, e.g., 'AM5 socket'"),
  })).optional()
});

export type ProcurementPlan = z.infer<typeof ProcurementPlanSchema>;