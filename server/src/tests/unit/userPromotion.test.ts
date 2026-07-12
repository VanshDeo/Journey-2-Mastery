import { describe, it, expect, vi, beforeEach } from "vitest";
import { checkAndPromoteUser } from "../../services/user.service";
import { db } from "../../db/client";
import { notificationQueue } from "../../config/queue";

// Mock the database client
vi.mock("../../db/client.js", () => {
  const mockFindFirst = vi.fn();
  const mockUpdate = vi.fn().mockReturnValue({
    set: vi.fn().mockReturnValue({
      where: vi.fn().mockResolvedValue([{ id: "user-1" }]),
    }),
  });

  return {
    db: {
      query: {
        users: {
          findFirst: mockFindFirst,
        },
        tasks: {
          findFirst: mockFindFirst,
        },
      },
      update: mockUpdate,
    },
  };
});

// Mock the queues
vi.mock("../../config/queue.js", () => {
  return {
    notificationQueue: {
      add: vi.fn().mockResolvedValue({ id: "job-1" }),
    },
    assignJudgeQueue: {
      add: vi.fn(),
    },
  };
});

describe("User Promotion Logic", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should promote Ronin to Kenshi when completing a Ronin task", async () => {
    // Mock user being Ronin
    // Mock task requiring Ronin
    let callCount = 0;
    vi.mocked(db.query.users.findFirst).mockImplementation(() => {
      callCount++;
      if (callCount === 1) {
        return Promise.resolve({ rank: "Ronin" }) as any;
      }
      return Promise.resolve({ rankRequired: "Ronin" }) as any;
    });

    await checkAndPromoteUser("user-1", "task-1");

    // Verify DB update was triggered with Kenshi
    expect(db.update).toHaveBeenCalled();
    expect(notificationQueue.add).toHaveBeenCalledWith(
      "notify-rank-up",
      expect.objectContaining({
        userId: "user-1",
        type: "rank_up",
        message: expect.stringContaining("Kenshi"),
      })
    );
  });

  it("should not promote Kenshi when completing a Ronin task", async () => {
    let callCount = 0;
    vi.mocked(db.query.users.findFirst).mockImplementation(() => {
      callCount++;
      if (callCount === 1) {
        return Promise.resolve({ rank: "Kenshi" }) as any;
      }
      return Promise.resolve({ rankRequired: "Ronin" }) as any;
    });

    await checkAndPromoteUser("user-1", "task-1");

    expect(db.update).not.toHaveBeenCalled();
    expect(notificationQueue.add).not.toHaveBeenCalled();
  });

  it("should promote Kenshi to Samurai when completing a Kenshi task", async () => {
    let callCount = 0;
    vi.mocked(db.query.users.findFirst).mockImplementation(() => {
      callCount++;
      if (callCount === 1) {
        return Promise.resolve({ rank: "Kenshi" }) as any;
      }
      return Promise.resolve({ rankRequired: "Kenshi" }) as any;
    });

    await checkAndPromoteUser("user-1", "task-1");

    expect(db.update).toHaveBeenCalled();
    expect(notificationQueue.add).toHaveBeenCalledWith(
      "notify-rank-up",
      expect.objectContaining({
        message: expect.stringContaining("Samurai"),
      })
    );
  });

  it("should not promote Shogun (max rank)", async () => {
    let callCount = 0;
    vi.mocked(db.query.users.findFirst).mockImplementation(() => {
      callCount++;
      if (callCount === 1) {
        return Promise.resolve({ rank: "Shogun" }) as any;
      }
      return Promise.resolve({ rankRequired: "Shogun" }) as any;
    });

    await checkAndPromoteUser("user-1", "task-1");

    expect(db.update).not.toHaveBeenCalled();
    expect(notificationQueue.add).not.toHaveBeenCalled();
  });
});
