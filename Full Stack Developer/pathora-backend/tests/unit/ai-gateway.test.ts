
import axios from "axios";
import { HttpAiGateway } from "../../src/services/ai-gateway/ai-gateway.http.js";
import { MockAiGateway } from "../../src/services/ai-gateway/ai-gateway.mock.js";
import { AiGatewayError } from "../../src/exceptions/ai-gateway-error.js";
import type { CvSource } from "../../src/services/ai-gateway/ai-gateway.adapter.js";

jest.mock("axios");
const mockedAxios = jest.mocked(axios);

const textSource: CvSource = {
  kind: "text",
  rawText: "Python developer with 3 years experience...",
};
const fileSource: CvSource = {
  kind: "file",
  fileData: Buffer.from("fake pdf content"),
  fileMime: "application/pdf",
  fileName: "cv.pdf",
};

describe("HttpAiGateway", () => {
  let gateway: HttpAiGateway;
  beforeEach(() => {
    gateway = new HttpAiGateway();
    jest.clearAllMocks();
  });
  it("melempar AiGatewayError(timeout) saat axios timeout (NFR-003)", async () => {
    const timeoutError = Object.assign(new Error("timeout"), {
      code: "ECONNABORTED",
    });
    mockedAxios.post = jest.fn().mockRejectedValue(timeoutError);
    (mockedAxios.isAxiosError as unknown as jest.Mock).mockReturnValue(true);
    await expect(gateway.analyze(textSource, "cv-1")).rejects.toBeInstanceOf(
      AiGatewayError,
    );
    await expect(gateway.analyze(textSource, "cv-1")).rejects.toMatchObject({
      type: "timeout",
    });
  });
  it("melempar AiGatewayError(upstream_error) saat AI mengembalikan 500", async () => {
    const serverError = Object.assign(new Error("server error"), {
      response: { status: 500 },
    });
    mockedAxios.post = jest.fn().mockRejectedValue(serverError);
    (mockedAxios.isAxiosError as unknown as jest.Mock).mockReturnValue(true);
    await expect(gateway.analyze(textSource, "cv-1")).rejects.toMatchObject({
      type: "upstream_error",
    });
  });
  it("melempar AiGatewayError(invalid_response) saat respons tidak sesuai schema (VAL-007)", async () => {
    mockedAxios.post = jest
      .fn()
      .mockResolvedValue({ data: { invalid: "payload" } });
    (mockedAxios.isAxiosError as unknown as jest.Mock).mockReturnValue(false);
    await expect(gateway.analyze(textSource, "cv-1")).rejects.toMatchObject({
      type: "invalid_response",
    });
  });
});

describe("MockAiGateway", () => {
  let gateway: MockAiGateway;
  beforeEach(() => {
    gateway = new MockAiGateway();
  });
  it("mengembalikan payload yang lolos AiResponseSchema (FR-015)", async () => {
    const result = await gateway.analyze(textSource, "cv-test");
    expect(result.cv_id).toBe("cv-test");
    expect(result.predicted_category).toBeDefined();
    expect(result.confidence).toBeGreaterThan(0);
    expect(result.top_5_predictions.length).toBeGreaterThan(0);
    expect(result.extracted_skills.length).toBeGreaterThan(0);
    expect(result.career_recommendations.length).toBeGreaterThan(0);
  });
  it("menerima CvSource berkas dan tetap mengembalikan payload valid (revisi v1.1)", async () => {
    const result = await gateway.analyze(fileSource, "cv-file-test");
    expect(result.cv_id).toBe("cv-file-test");
    expect(result.predicted_category).toBeDefined();
  });
  it("payload mock mencakup item di bawah threshold untuk test filter (FR-016, FR-020)", async () => {
    const result = await gateway.analyze(textSource, "cv-filter-test");
    const hasLowConfidence = result.top_5_predictions.some(
      (p) => p.confidence < 0.05,
    );
    expect(hasLowConfidence).toBe(true);
    const hasLowMatchScore = result.career_recommendations.some(
      (r) => r.match_score < 0.3,
    );
    expect(hasLowMatchScore).toBe(true);
  });
});
