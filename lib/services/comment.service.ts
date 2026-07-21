import { eq, asc } from "drizzle-orm";
import { db } from "../db/client";
import { comments, users } from "../db/schema";

export async function getComments(submissionId: string) {
  const result = await db
    .select({
      id: comments.id,
      submissionId: comments.submissionId,
      message: comments.message,
      createdAt: comments.createdAt,
      author: {
        id: users.id,
        username: users.username,
        avatarUrl: users.avatarUrl,
        role: users.role,
      },
    })
    .from(comments)
    .innerJoin(users, eq(comments.authorId, users.id))
    .where(eq(comments.submissionId, submissionId))
    .orderBy(asc(comments.createdAt));

  return result;
}

export async function createComment(data: {
  submissionId: string;
  authorId: string;
  message: string;
}) {
  const [comment] = await db
    .insert(comments)
    .values({
      submissionId: data.submissionId,
      authorId: data.authorId,
      message: data.message,
    })
    .returning();

  if (!comment) throw new Error("Failed to create comment");

  // Fetch with author details for immediate return
  const [result] = await db
    .select({
      id: comments.id,
      submissionId: comments.submissionId,
      message: comments.message,
      createdAt: comments.createdAt,
      author: {
        id: users.id,
        username: users.username,
        avatarUrl: users.avatarUrl,
        role: users.role,
      },
    })
    .from(comments)
    .innerJoin(users, eq(comments.authorId, users.id))
    .where(eq(comments.id, comment.id));

  return result;
}
