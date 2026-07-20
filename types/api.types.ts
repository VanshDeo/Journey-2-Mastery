// ─── Roles & Ranks ───
export type Role = 'user' | 'judge' | 'admin';
export type Rank = 'Ronin' | 'Kenshi' | 'Samurai' | 'Shogun' | 'Team';
export type SubmissionStatus = 'pending' | 'in_review' | 'approved' | 'rejected';
export type Difficulty = 'easy' | 'medium' | 'hard';

// ─── User ───
export interface User {
  id: string;
  githubId: string;
  username: string;
  email?: string;
  avatarUrl?: string;
  role: Role;
  isProfileComplete: boolean;
  fullName?: string;
  collegeName?: string;
  branch?: string;
  year?: string;
  phone?: string;
  bio?: string;
  rank: Rank;
  score: number;
  createdAt?: string;
}

// ─── Profile Completion ───
export interface CompleteProfilePayload {
  fullName: string;
  collegeName: string;
  branch: string;
  year: string;
  phone: string;
  bio: string;
}

// ─── Tasks ───
export interface Task {
  id: string;
  title: string;
  shortDescription?: string;
  description: string;
  requirements?: string;
  category: string;
  categoryName?: string;
  points: number;
  bonusPoints?: number;
  difficulty: Difficulty;
  rankRequired?: Rank;
  deadline?: string;
  isActive?: boolean;
  status?: SubmissionStatus | 'submitted';
  rubric?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
}

// ─── Submissions ───
export interface Submission {
  id: string;
  taskId: string;
  task?: Task;
  taskTitle?: string;
  userId: string;
  userName?: string;
  repoUrl: string;
  repoName?: string;
  status: SubmissionStatus;
  score?: number;
  feedback?: string;
  judgeId?: string;
  judgeName?: string;
  submittedAt: string;
  reviewedAt?: string;
  review?: Review;
}

// ─── Reviews ───
export interface Review {
  id: string;
  submissionId: string;
  judgeId: string;
  judgeName?: string;
  scores: CriterionScore[];
  totalScore: number;
  feedback: string;
  createdAt: string;
  updatedAt?: string;
  canEdit?: boolean;
}

export interface CriterionScore {
  criterionId: string;
  criterionName: string;
  score: number;
  maxScore: number;
}

export interface ReviewCriterion {
  id: string;
  name: string;
  description: string;
  maxScore: number;
  taskType?: string;
}

// ─── Comments ───
export interface Comment {
  id: string;
  submissionId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  userRole: Role;
  content: string;
  createdAt: string;
}

// ─── Posts ───
export interface Post {
  id: string;
  title: string;
  description: string;
  posterImageUrl?: string;
  isPublished: boolean;
  createdAt: string;
  updatedAt?: string;
}

// ─── Notifications ───
export interface Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  link?: string;
  createdAt: string;
}

// ─── Badges ───
export interface UserBadge {
  id: string;
  name: string;
  description: string;
  imageUrl?: string;
  earnedAt: string;
}

// ─── Ranks ───
export interface RankTier {
  name: Rank;
  minScore: number;
  maxScore?: number;
  description: string;
}

// ─── GitHub Repos ───
export interface RepoInfo {
  repoId: string;
  name: string;
  fullName: string;
  description: string | null;
  htmlUrl: string;
  updatedAt: string;
  language?: string;
  stargazersCount?: number;
}

// ─── Dashboard Data ───
export interface UserDashboardData {
  rank: Rank;
  score: number;
  tasksCompleted: number;
  tasksRemaining: number;
  totalScore: number;
  rankProgress: number; // 0-100 percentage to next rank
  recentActivity: ActivityItem[];
  stats: {
    totalPoints: number;
    tasksCompleted: number;
    pendingReviews: number;
  };
  recentSubmissions: Submission[];
}

export interface ActivityItem {
  id: string;
  type: string;
  message: string;
  timestamp: string;
}

export interface JudgeDashboardData {
  pendingCount: number;
  reviewedCount: number;
  avgTurnaround: string;
  recentReviews: Review[];
}

export interface JudgeWorkload {
  assignedCount: number;
  completedCount: number;
  loadScore: number;
  avgTurnaroundHours: number;
}

export interface AdminDashboardData {
  totalUsers: number;
  totalJudges: number;
  totalTasks: number;
  totalSubmissions: number;
  statusBreakdown: { status: string; count: number }[];
  topPerformers: { userId: string; userName: string; score: number; rank: Rank }[];
  unassignedCount: number;
}

export interface AdminActivity {
  activities: ActivityItem[];
}

// ─── Admin User ───
export interface AdminUser extends User {
  submissionCount?: number;
  reviewCount?: number;
  lastActiveAt?: string;
}

// ─── Judge Performance ───
export interface JudgePerformance {
  judgeId: string;
  judgeName: string;
  totalReviews: number;
  avgScoreGiven: number;
  avgTurnaroundHours: number;
  pendingCount: number;
}

// ─── Audit Log ───
export interface AuditLogEntry {
  id: string;
  actorId: string;
  actorName: string;
  action: string;
  targetType: string;
  targetId: string;
  details?: string;
  createdAt: string;
}

// ─── Sessions ───
export interface UserSession {
  id: string;
  userAgent: string;
  ipAddress: string;
  createdAt: string;
  lastUsedAt: string;
  isCurrent: boolean;
}

// ─── Settings ───
export interface UserSettings {
  emailNotifications: boolean;
  submissionUpdates: boolean;
  reviewNotifications: boolean;
  leaderboardUpdates: boolean;
}

// ─── Pagination ───
export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
  };
}

// ─── Leaderboard ───
export interface LeaderboardEntry {
  rank: number;
  userId: string;
  userName: string;
  avatarUrl?: string;
  score: number;
  tasksCompleted: number;
  userRank: Rank;
  scoreBreakdown?: { category: string; points: number }[];
}

// ─── Teams ───
export interface TeamMember {
  userId: string;
  username: string;
  avatarUrl?: string | null;
  role: 'leader' | 'member';
  joinedAt: string;
}

export interface TeamDetail {
  id: string;
  name: string;
  status: 'incomplete' | 'active';
  score: number;
  members: TeamMember[];
  joinCode?: string;
}
