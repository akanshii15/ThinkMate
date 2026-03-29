import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import {
  createConversation,
  getConversationsByUserId,
  getConversationById,
  updateConversationTitle,
  deleteConversation,
  addMessage,
  getMessagesByConversationId,
} from "../db";
import {
  generateDecisionAnalysis,
  generateConversationalResponse,
  DecisionAnalysis,
} from "../services/llmService";

export const chatRouter = router({
  /**
   * Create a new conversation
   */
  createConversation: protectedProcedure
    .input(
      z.object({
        title: z.string().optional().default("New Conversation"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const result = await createConversation(1, input.title);
      const conversationId = (result as any).insertId;

      return {
        id: conversationId,
        userId: 1,
        title: input.title,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    }),

  /**
   * Get all conversations for the current user
   */
  listConversations: protectedProcedure.query(async ({ ctx }) => {
    return getConversationsByUserId(1);
  }),

  /**
   * Get a specific conversation with all messages
   */
  getConversation: protectedProcedure
    .input(z.object({ conversationId: z.number() }))
    .query(async ({ ctx, input }) => {
      const conversation = await getConversationById(input.conversationId);

      if (!conversation || conversation.userId !== 1) {
        throw new Error("Conversation not found or access denied");
      }

      const messageList = await getMessagesByConversationId(
        input.conversationId
      );

      return {
        conversation,
        messages: messageList,
      };
    }),

  /**
   * Update conversation title
   */
  updateTitle: protectedProcedure
    .input(
      z.object({
        conversationId: z.number(),
        title: z.string().min(1),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const conversation = await getConversationById(input.conversationId);

      if (!conversation || conversation.userId !== 1) {
        throw new Error("Conversation not found or access denied");
      }

      await updateConversationTitle(input.conversationId, input.title);

      return { success: true };
    }),

  /**
   * Delete a conversation
   */
  deleteConversation: protectedProcedure
    .input(z.object({ conversationId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const conversation = await getConversationById(input.conversationId);

      if (!conversation || conversation.userId !== 1) {
        throw new Error("Conversation not found or access denied");
      }

      await deleteConversation(input.conversationId);

      return { success: true };
    }),

  /**
   * Send a message and get AI response with structured decision analysis
   */
  sendMessage: protectedProcedure
    .input(
      z.object({
        conversationId: z.number(),
        message: z.string().min(1),
        useStructuredAnalysis: z.boolean().default(true),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const conversation = await getConversationById(input.conversationId);

      if (!conversation || conversation.userId !== 1) {
        throw new Error("Conversation not found or access denied");
      }

      // Add user message to database
      await addMessage(input.conversationId, "user", input.message);

      // Get conversation history for context
      const messageHistory = await getMessagesByConversationId(
        input.conversationId
      );

      // Convert to format expected by LLM service
      const history = messageHistory.map((msg) => ({
        role: msg.role,
        content: msg.content,
      }));

      let aiResponse: string;
      let structuredData: string | undefined;

      try {
        if (input.useStructuredAnalysis) {
          // Generate structured decision analysis
          const { analysis, rawResponse } = await generateDecisionAnalysis(
            input.message,
            history
          );

          // Format the response as markdown
          aiResponse = formatDecisionAnalysis(analysis);
          structuredData = rawResponse;
        } else {
          // Generate conversational response
          aiResponse = await generateConversationalResponse(
            input.message,
            history
          );
        }
      } catch (error) {
        console.error("LLM error:", error);
        throw new Error("Failed to generate AI response");
      }

      // Add AI response to database
      await addMessage(
        input.conversationId,
        "assistant",
        aiResponse,
        structuredData
      );

      // Update conversation title if it's the first message
      if (messageHistory.length === 0) {
        const titleSuggestion = input.message.substring(0, 50).trim();
        await updateConversationTitle(input.conversationId, titleSuggestion);
      }

      return {
        userMessage: input.message,
        aiResponse,
        structuredData: structuredData ? JSON.parse(structuredData) : null,
      };
    }),
});

/**
 * Format structured decision analysis as markdown
 */
function formatDecisionAnalysis(analysis: DecisionAnalysis): string {
  const sections: string[] = [];

  sections.push(`## Problem Understanding\n${analysis.problem}`);

  sections.push(
    `\n## Key Factors\n${analysis.keyFactors.map((f: string) => `- ${f}`).join("\n")}`
  );

  sections.push(
    `\n## Options\n${analysis.options
      .map((opt: any) => `- **${opt.name}**: ${opt.description}`)
      .join("\n")}`
  );

  sections.push(`\n## Pros and Cons`);
  analysis.prosAndCons.forEach((item: any) => {
    sections.push(
      `\n### ${item.option}\n**Pros:**\n${item.pros.map((p: string) => `- ${p}`).join("\n")}\n\n**Cons:**\n${item.cons.map((c: string) => `- ${c}`).join("\n")}`
    );
  });

  sections.push(
    `\n## Reflective Questions\n${analysis.reflectiveQuestions
      .map((q: string) => `- ${q}`)
      .join("\n")}`
  );

  sections.push(
    `\n## Recommendation\n${analysis.recommendation}\n\n**Reasoning:** ${analysis.reasoning}`
  );

  return sections.join("\n");
}
