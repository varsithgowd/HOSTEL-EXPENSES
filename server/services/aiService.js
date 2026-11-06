import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * Generate AI spending analysis and recommendations
 * Uses Gemini API if GEMINI_API_KEY is available, otherwise provides
 * high-quality heuristic financial analysis based on actual data.
 */
export const generateFinancialAdvice = async ({
  userMessage,
  currentMonthSummary,
  previousMonthSummary,
  categoryBreakdown,
  budget,
  recentExpenses,
}) => {
  const apiKey = process.env.GEMINI_API_KEY;

  const dataContext = `
STUDENT FINANCIAL CONTEXT:
- Monthly Budget: ₹${budget?.monthlyLimit || 0}
- Daily Limit: ₹${budget?.dailyLimit || 0}
- Current Month Total Spent: ₹${currentMonthSummary?.totalSpent || 0}
- Remaining Budget: ₹${currentMonthSummary?.remainingBudget || 0}
- Budget Usage: ${currentMonthSummary?.usagePercent || 0}%
- Previous Month Total: ₹${previousMonthSummary?.totalSpent || 0}
- Top Spending Categories: ${categoryBreakdown
    ?.slice(0, 4)
    .map((c) => `${c.category}: ₹${c.total} (${c.percentage}%)`)
    .join(', ') || 'None yet'}
- Recent 5 Expenses: ${recentExpenses
    ?.slice(0, 5)
    .map((e) => `${e.title} (₹${e.amount}) on ${new Date(e.date).toLocaleDateString('en-IN')}`)
    .join('; ') || 'No expenses logged'}
`;

  if (apiKey) {
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      // Try gemini-1.5-flash
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

      const prompt = `
You are the AI Finance Assistant for "Hostel Expense Tracker", designed specifically for Indian college students living in hostels.
Context of the student's finances:
${dataContext}

Student's question or request:
"${userMessage || 'Please analyze my spending habits this month and tell me how I can save more money.'}"

Guidelines:
1. Speak in a friendly, encouraging, empathetic tone (like a smart senior student or financial mentor).
2. Reference the exact figures given in the context (in Indian Rupees ₹). Never invent fake numbers.
3. Offer actionable, practical hostel-specific advice (e.g. eating in hostel mess vs Swiggy/Zomato, sharing auto rides, buying snacks in bulk, splitting OTT subscriptions, library books vs buying new).
4. Highlight categories where spending is highest.
5. Keep response concise, structured with bullet points or short paragraphs, around 150-250 words.
`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      return {
        reply: response.text(),
        source: 'gemini',
      };
    } catch (aiError) {
      console.warn('[AI Service] Gemini API call failed, falling back to heuristic engine:', aiError.message);
    }
  }

  // Fallback Heuristic Financial Advisor Engine
  return {
    reply: generateHeuristicAdvice({
      userMessage,
      currentMonthSummary,
      previousMonthSummary,
      categoryBreakdown,
      budget,
    }),
    source: 'heuristic',
  };
};

function generateHeuristicAdvice({
  userMessage,
  currentMonthSummary,
  previousMonthSummary,
  categoryBreakdown,
  budget,
}) {
  const totalSpent = currentMonthSummary?.totalSpent || 0;
  const monthlyLimit = budget?.monthlyLimit || 0;
  const usagePercent = currentMonthSummary?.usagePercent || 0;
  const remaining = currentMonthSummary?.remainingBudget || 0;
  const topCategory = categoryBreakdown?.[0];
  const secondCategory = categoryBreakdown?.[1];

  let advice = '';

  if (totalSpent === 0) {
    advice = `👋 Welcome to your Hostel Finance Assistant! You haven't recorded any expenses for this month yet. 
Start by logging your daily mess extras, tea/coffee, snacks, or stationery to get personalized spending insights!`;
    return advice;
  }

  if (usagePercent >= 100) {
    advice += `⚠️ **Budget Alert:** You have exceeded your monthly budget of ₹${monthlyLimit.toLocaleString('en-IN')}! Total spending has reached ₹${totalSpent.toLocaleString('en-IN')}.\n\n`;
    advice += `💡 **Immediate Action Plan:**\n`;
    advice += `• Stick strictly to the hostel mess meals for the remaining days of this month.\n`;
    advice += `• Pause discretionary online orders (Swiggy, Zomato, Amazon, quick commerce).\n`;
    advice += `• For daily commute, use college buses, shared autos, or metro rather than cabs.`;
  } else if (usagePercent >= 70) {
    advice += `⚠️ **Cautious Zone:** You have used **${usagePercent}%** of your monthly budget (₹${totalSpent.toLocaleString('en-IN')} spent, ₹${remaining.toLocaleString('en-IN')} remaining).\n\n`;
    if (topCategory) {
      advice += `Your biggest expense category is **${topCategory.category}** accounting for **₹${topCategory.total.toLocaleString('en-IN')} (${topCategory.percentage}%)** of your spending.\n`;
    }
    advice += `\n🎯 **Pro Tips to Stay Within Budget:**\n`;
    advice += `• Set a micro daily cap of ₹${Math.round(remaining / 10)} for non-essential snacks and chai.\n`;
    advice += `• Coordinate group purchases with hostel wingmates for shared items like water cans, detergent, and snacks.\n`;
  } else {
    advice += `✅ **Great Job!** You have currently used **${usagePercent}%** of your budget (₹${totalSpent.toLocaleString('en-IN')} of ₹${monthlyLimit.toLocaleString('en-IN')}). You have ₹${remaining.toLocaleString('en-IN')} comfortably left.\n\n`;
    if (topCategory) {
      advice += `Your top spending area is **${topCategory.category}** (₹${topCategory.total.toLocaleString('en-IN')}, ${topCategory.percentage}% of spending).\n`;
    }
    if (secondCategory) {
      advice += `Followed by **${secondCategory.category}** (₹${secondCategory.total.toLocaleString('en-IN')}, ${secondCategory.percentage}%).\n`;
    }
    advice += `\n💰 **Savings Strategy:**\n`;
    advice += `• Consider putting ₹${Math.round(remaining * 0.3).toLocaleString('en-IN')} into one of your Savings Goals before the month ends!`;
  }

  if (previousMonthSummary && previousMonthSummary.totalSpent > 0) {
    const diff = totalSpent - previousMonthSummary.totalSpent;
    if (diff > 0) {
      advice += `\n\n📊 *Compared to last month, your spending is higher by ₹${diff.toLocaleString('en-IN')}.*`;
    } else {
      advice += `\n\n📊 *You are doing better than last month by saving ₹${Math.abs(diff).toLocaleString('en-IN')}!*`;
    }
  }

  return advice;
}

