import OpenAI from "openai";
import Invoice from "../models/Invoice.js";

const client = new OpenAI({
  apiKey:
    "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", // .env ma mukjo
  baseURL: "https://integrate.api.nvidia.com/v1",
});

const tools = [
  {
    type: "function",
    function: {
      name: "getTotalSales",
      description: "Get total sales of invoices in a month",
      parameters: {
        type: "object",
        properties: {
          month: { type: "string" },
          year: { type: "number" },
        },
        required: ["month", "year"],
      },
    },
  },
];

export const askAI = async (req, res) => {
  try {
    const userQuery = req.body.prompt;

    const response = await client.chat.completions.create({
      model: "openai/gpt-oss-20b", // NVIDIA model
      messages: [{ role: "user", content: userQuery }],
      tools,
    });

    const toolCalls = response.choices[0].message.tool_calls;

    if (toolCalls && toolCalls[0]) {
      const args = JSON.parse(toolCalls[0].function.arguments);

      if (toolCalls[0].function.name === "getTotalSales") {
        const invs = await Invoice.find({ month: args.month, year: args.year });
        const total = invs.reduce((a, i) => a + i.totalAmount, 0);

        return res.json({ result: `Total sales in ${args.month}: ₹${total}` });
      }
    }

    res.json({ result: response.choices[0].message.content });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};
