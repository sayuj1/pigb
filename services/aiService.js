import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function generateFinancialReport(transactions, startDate, endDate) {
    try {
        const model = genAI.getGenerativeModel({ model: "gemma-3-12b-it" });

        // Pre-process transactions to reduce token usage and provide better context
        const summary = transactions.reduce(
            (acc, t) => {
                const amount = parseFloat(t.amount);
                if (t.type === "income") {
                    acc.totalIncome += amount;
                } else {
                    acc.totalExpense += amount;
                    acc.categoryBreakdown[t.category] = (acc.categoryBreakdown[t.category] || 0) + amount;
                }
                return acc;
            },
            { totalIncome: 0, totalExpense: 0, categoryBreakdown: {} }
        );

        const prompt = `
      Act as a financial advisor. Analyze the following financial data for the period of ${startDate} to ${endDate}.
      
      **Summary Data:**
      - Total Income: ${summary.totalIncome}
      - Total Expense: ${summary.totalExpense}
      - Net Savings: ${summary.totalIncome - summary.totalExpense}
      
      **Expense by Category:**
      ${Object.entries(summary.categoryBreakdown)
                .map(([cat, amt]) => `- ${cat}: ${amt}`)
                .join("\n")}

      **Instructions:**
      Provide a concise 3-part report in Markdown format:
      1. **Overall Health**: A brief assessment of financial health (Positive/Neutral/Negative) and why.
      2. **Top Spending Areas**: Identify the biggest expenses and if they seem reasonable.
      3. **Actionable Recommendations**: Give 3 specific tips to improve savings based on these categories.
      
      Keep the tone encouraging but professional.
    `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        return text;
    } catch (error) {
        console.error("AI Generation Error:", error);
        throw new Error("Failed to generate financial report.");
    }
}
