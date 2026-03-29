import { asc, desc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, conversations, messages } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

interface InMemoryConversation {
  id: number;
  userId: number;
  title: string;
  createdAt: Date;
  updatedAt: Date;
}

interface InMemoryMessage {
  id: number;
  conversationId: number;
  role: "user" | "assistant";
  content: string;
  structuredData?: string;
  createdAt: Date;
}

const inMemoryStore: {
  nextConversationId: number;
  nextMessageId: number;
  conversations: Map<number, InMemoryConversation>;
  messages: InMemoryMessage[];
} = {
  nextConversationId: 1,
  nextMessageId: 1,
  conversations: new Map(),
  messages: [],
};

function isDbError(error: unknown) {
  if (!error || typeof error !== "object") return false;
  const e = error as any;
  return (
    e.code === "ER_BAD_DB_ERROR" ||
    e.code === "ER_BAD_FIELD_ERROR" ||
    e.code === "ECONNREFUSED" ||
    e.code === "ETIMEDOUT" ||
    e.message?.includes("Unknown database")
  );
}

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  return null;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function createConversation(
  userId: number,
  title: string = "New Conversation"
) {
  const db = await getDb();

  if (!db) {
    const conversation: InMemoryConversation = {
      id: inMemoryStore.nextConversationId++,
      userId,
      title,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    inMemoryStore.conversations.set(conversation.id, conversation);
    return { insertId: conversation.id };
  }

  try {
    const [result]: any = await db.execute(
      "INSERT INTO conversations (userId, title) VALUES (?, ?)",
      [userId, title]
    );

    return { insertId: result.insertId };
  } catch (error) {
    console.warn("[Database] createConversation DB failure, switching to in-memory:", error);

    const conversation: InMemoryConversation = {
      id: inMemoryStore.nextConversationId++,
      userId,
      title,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    inMemoryStore.conversations.set(conversation.id, conversation);

    return { insertId: conversation.id };
  }
}

export async function getConversationsByUserId(userId: number) {
  const db = await getDb();
  if (!db) {
    return Array.from(inMemoryStore.conversations.values())
      .filter((c) => c.userId === userId)
      .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
  }


  try {
    return db
      .select()
      .from(conversations)
      .where(eq(conversations.userId, userId))
      .orderBy(desc(conversations.updatedAt));
  } catch (error) {
    if (isDbError(error)) {
      console.warn("[Database] getConversationsByUserId DB failure, switching to in-memory:", error);
      _db = null;
      return Array.from(inMemoryStore.conversations.values())
        .filter((c) => c.userId === userId)
        .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
    }
    throw error;
  }
}

export async function getConversationById(conversationId: number) {
  const db = await getDb();
  if (!db) {
    return inMemoryStore.conversations.get(conversationId);
  }

  try {
    const result = await db
      .select()
      .from(conversations)
      .where(eq(conversations.id, conversationId))
      .limit(1);

    return result[0];
  } catch (error) {
    if (isDbError(error)) {
      console.warn("[Database] getConversationById DB failure, switching to in-memory:", error);
      _db = null;
      return inMemoryStore.conversations.get(conversationId);
    }
    throw error;
  }
}

export async function updateConversationTitle(
  conversationId: number,
  title: string
) {
  const db = await getDb();
  if (!db) {
    const conversation = inMemoryStore.conversations.get(conversationId);
    if (!conversation) throw new Error("Conversation not available");
    conversation.title = title;
    conversation.updatedAt = new Date();
    inMemoryStore.conversations.set(conversationId, conversation);
    return;
  }

  return db
    .update(conversations)
    .set({ title, updatedAt: new Date() })
    .where(eq(conversations.id, conversationId));
}

export async function deleteConversation(conversationId: number) {
  const db = await getDb();
  if (!db) {
    inMemoryStore.conversations.delete(conversationId);
    inMemoryStore.messages = inMemoryStore.messages.filter(
      (msg) => msg.conversationId !== conversationId
    );
    return;
  }

  return db
    .delete(conversations)
    .where(eq(conversations.id, conversationId));
}

export async function addMessage(
  conversationId: number,
  role: "user" | "assistant",
  content: string,
  structuredData?: string
) {
  const db = await getDb();
  if (!db) {
    const message: InMemoryMessage = {
      id: inMemoryStore.nextMessageId++,
      conversationId,
      role,
      content,
      structuredData,
      createdAt: new Date(),
    };
    inMemoryStore.messages.push(message);
    return message;
  }

  try {
    return await db.insert(messages).values({
      conversationId,
      role,
      content,
      structuredData,
    });
  } catch (error) {
    if (isDbError(error)) {
      console.warn("[Database] addMessage DB failure, switching to in-memory:", error);
      _db = null;
      const message: InMemoryMessage = {
        id: inMemoryStore.nextMessageId++,
        conversationId,
        role,
        content,
        structuredData,
        createdAt: new Date(),
      };
      inMemoryStore.messages.push(message);
      return message;
    }
    throw error;
  }
}

export async function getMessagesByConversationId(conversationId: number) {
  const db = await getDb();
  if (!db) {
    return inMemoryStore.messages
      .filter((msg) => msg.conversationId === conversationId)
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  }

  return db
    .select()
    .from(messages)
    .where(eq(messages.conversationId, conversationId))
    .orderBy(asc(messages.createdAt));
}
