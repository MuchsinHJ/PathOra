import { validateAiResponse } from "../../utils/ai-schema-validator.js";
import type { AiGatewayAdapter, CvSource } from "./ai-gateway.adapter.js";
import type { AiAnalysisResult } from "./ai-response.schema.js";

const sleep = (ms: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms));

const MOCK_PAYLOAD = {
  cv_id: "mock-cv-id",
  analyzed_at: new Date().toISOString(),
  predicted_category: "INFORMATION-TECHNOLOGY",
  confidence: 0.832,
  top_5_predictions: [
    { category: "INFORMATION-TECHNOLOGY", confidence: 0.832 },
    { category: "ENGINEERING", confidence: 0.075 },
    { category: "DIGITAL-MEDIA", confidence: 0.061 },
    { category: "BUSINESS-DEVELOPMENT", confidence: 0.052 },
    { category: "FINANCE", confidence: 0.051 },
  ],
  extracted_skills: [
    {
      category: "INFORMATION-TECHNOLOGY",
      matched_skills: [
        { skill: "Python", similarity: 0.92 },
        { skill: "TensorFlow", similarity: 0.89 },
        { skill: "PyTorch", similarity: 0.87 },
      ],
      missing_skills: [
        "Project Management",
        "Salesforce",
        "Financial Analysis",
      ],
    },
    {
      category: "ENGINEERING",
      matched_skills: [
        { skill: "Machine Learning", similarity: 0.85 },
        { skill: "Data Science", similarity: 0.8 },
      ],
      missing_skills: [
        "Civil Engineering",
        "Mechanical Design",
        "Electrical Systems",
      ],
    },
    {
      category: "DIGITAL-MEDIA",
      matched_skills: [
        { skill: "Data Visualization", similarity: 0.78 },
        { skill: "Big Data Analytics", similarity: 0.75 },
      ],
      missing_skills: ["Graphic Design", "Video Editing", "Content Writing"],
    },
    {
      category: "BUSINESS-DEVELOPMENT",
      matched_skills: [
        { skill: "Market Analysis", similarity: 0.65 },
        { skill: "Sales Strategy", similarity: 0.6 },
      ],
      missing_skills: [
        "Negotiation",
        "Customer Relationship Management",
        "Business Planning",
      ],
    },
    {
      category: "FINANCE",
      matched_skills: [
        { skill: "Financial Modeling", similarity: 0.55 },
        { skill: "Investment Analysis", similarity: 0.5 },
      ],
      missing_skills: ["Accounting", "Risk Management", "Financial Reporting"],
    },
  ],
  career_recommendations: [
    { category: "INFORMATION-TECHNOLOGY", match_score: 0.832 },
    { category: "ENGINEERING", match_score: 0.075 },
    { category: "DIGITAL-MEDIA", match_score: 0.061 },
    { category: "BUSINESS-DEVELOPMENT", match_score: 0.052 },
    { category: "FINANCE", match_score: 0.051 },
  ],
  description_career_recommendations:
    "Based on the predicted category and extracted skills, the most suitable career paths " +
    "include roles such as Machine Learning Engineer, Data Scientist, and AI Researcher. " +
    "These roles leverage the strong skills in Python, TensorFlow, and PyTorch, which are " +
    "highly relevant in the Information Technology sector. Additionally, there are opportunities " +
    "in Engineering and Digital Media for roles that involve Machine Learning and Data " +
    "Visualization, respectively.",
};

export class MockAiGateway implements AiGatewayAdapter {
  async analyze(_source: CvSource, cvId: string): Promise<AiAnalysisResult> {
    await sleep(200);
    const payload = { ...MOCK_PAYLOAD, cv_id: cvId };
    return validateAiResponse(payload);
  }
}
