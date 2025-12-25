import { GoogleGenAI } from "@google/genai";
import { Transaction } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getFinancialAdvice = async (transactions: Transaction[]): Promise<string> => {
  if (!process.env.API_KEY) {
    return "Vui lòng cấu hình API Key để sử dụng tính năng tư vấn AI.";
  }

  if (transactions.length === 0) {
    return "Hãy thêm một vài giao dịch để tôi có thể phân tích giúp bạn nhé!";
  }

  // Filter last 50 transactions to avoid token limits and keep context relevant
  const recentTransactions = transactions.slice(0, 50).map(t => ({
    date: t.date,
    type: t.type,
    amount: t.amount,
    category: t.category,
    note: t.note
  }));

  const prompt = `
    Bạn là một trợ lý tài chính cá nhân thông minh, thân thiện và hơi hài hước.
    Dưới đây là danh sách các giao dịch gần đây của người dùng (đơn vị VND):
    ${JSON.stringify(recentTransactions)}

    Hãy phân tích thói quen chi tiêu này và đưa ra:
    1. Một nhận xét tổng quan ngắn gọn về tình hình tài chính hiện tại.
    2. 3 lời khuyên cụ thể, thực tế để giúp họ quản lý tiền tốt hơn hoặc tiết kiệm hiệu quả hơn.
    
    Hãy dùng ngôn ngữ tiếng Việt tự nhiên, định dạng Markdown (dùng bullet points). Đừng quá cứng nhắc.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        thinkingConfig: { thinkingBudget: 0 } // Disable thinking for faster response on simple advice
      }
    });

    return response.text || "Xin lỗi, hiện tại tôi không thể đưa ra lời khuyên. Hãy thử lại sau.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Đã có lỗi xảy ra khi kết nối với chuyên gia AI. Vui lòng thử lại sau.";
  }
};