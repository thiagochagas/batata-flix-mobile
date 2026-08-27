import { z } from "zod";

export const configuracoesInputSchema = z.object({
  tema: z.enum(["dark", "light"]).optional(),
  corDestaque: z.string().optional(),
});

export type ConfiguracoesInput = z.infer<typeof configuracoesInputSchema>;
