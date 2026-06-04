import type { AiAnalysisResult } from "./ai-response.schema.js";

export type CvSource =
  | { kind: "text"; rawText: string }
  | {
      kind: "file";
      fileData: Buffer;
      fileMime: string;
      fileName?: string;
    };

export interface AiGatewayAdapter {
  analyze(source: CvSource, cvId: string): Promise<AiAnalysisResult>;
}
