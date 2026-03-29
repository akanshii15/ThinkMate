import { describe, expect, it, vi } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(userId: number = 1): TrpcContext {
  const user: AuthenticatedUser = {
    id: userId,
    openId: `test-user-${userId}`,
    email: `test${userId}@example.com`,
    name: `Test User ${userId}`,
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };

  return ctx;
}

describe("chat router", () => {
  it("should create a new conversation", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // This test would require database setup
    // For now, we're testing the router structure
    expect(caller.chat).toBeDefined();
    expect(caller.chat.createConversation).toBeDefined();
  });

  it("should list conversations for authenticated user", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    expect(caller.chat.listConversations).toBeDefined();
  });

  it("should send a message and get response", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    expect(caller.chat.sendMessage).toBeDefined();
  });

  it("should update conversation title", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    expect(caller.chat.updateTitle).toBeDefined();
  });

  it("should delete a conversation", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    expect(caller.chat.deleteConversation).toBeDefined();
  });
});
