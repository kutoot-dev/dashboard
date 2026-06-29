import communityApiClient from "@/lib/api/community-client";
import type { ApiEnvelope, CommunityMessage } from "@/lib/types/community";
import type { Paginated, Reward, RewardTask } from "@/lib/api/services/community.service";

export type RewardTeamMember = {
  id: number;
  role: "admin" | "member";
  status: "active" | "pending" | "rejected";
  user?: {
    id: number | string;
    name: string | null;
    mobile?: string | null;
  } | null;
};

export type RewardTeam = {
  id: number;
  name: string;
  code?: string | null;
  description?: string | null;
  members_count?: number;
  members?: RewardTeamMember[];
};

export type JoinRequest = {
  id: number;
  status: "pending" | "approved" | "rejected";
  team?: RewardTeam | null;
  user?: RewardTeamMember["user"];
  created_at?: string | null;
};

export type LeaderboardType = "live_reward" | "weekly_team" | "weekly_member";

export type LeaderboardEntry = {
  rank: number;
  stamps: number;
  team?: RewardTeam | null;
  user?: RewardTeamMember["user"];
};

export type HallOfFameEntry = {
  id: number;
  reward?: Reward | null;
  winning_stamp_code?: string | null;
  winning_team?: RewardTeam | null;
  total_teams_participated?: number;
  total_stamps_issued?: number;
};

export async function createRewardTeam(payload: {
  name: string;
  description?: string;
}): Promise<RewardTeam> {
  const response = await communityApiClient.post<ApiEnvelope<RewardTeam>>("/teams", payload);
  return response.data.data;
}

export async function fetchMyRewardTeam(): Promise<{ team: RewardTeam | null; membership?: RewardTeamMember | null }> {
  const response = await communityApiClient.get<ApiEnvelope<{ team: RewardTeam | null; membership?: RewardTeamMember | null }>>(
    "/teams/mine",
  );
  return response.data.data;
}

export async function searchRewardTeams(query: string): Promise<RewardTeam[]> {
  const response = await communityApiClient.get<ApiEnvelope<RewardTeam[]>>("/teams/search", {
    params: { name: query },
  });
  return response.data.data;
}

export async function requestToJoinRewardTeam(payload: { code?: string; team_name?: string }): Promise<JoinRequest> {
  const response = await communityApiClient.post<ApiEnvelope<JoinRequest>>("/teams/join", payload);
  return response.data.data;
}

export async function fetchRewardTeam(teamId: number | string): Promise<RewardTeam> {
  const response = await communityApiClient.get<ApiEnvelope<RewardTeam>>(`/teams/${teamId}`);
  return response.data.data;
}

export async function fetchTeamJoinRequests(teamId: number | string): Promise<JoinRequest[]> {
  const response = await communityApiClient.get<ApiEnvelope<JoinRequest[]>>(`/teams/${teamId}/join-requests`);
  return response.data.data;
}

export async function approveTeamJoinRequest(requestId: number | string): Promise<JoinRequest> {
  const response = await communityApiClient.post<ApiEnvelope<JoinRequest>>(`/join-requests/${requestId}/approve`);
  return response.data.data;
}

export async function rejectTeamJoinRequest(requestId: number | string, reason?: string): Promise<JoinRequest> {
  const response = await communityApiClient.post<ApiEnvelope<JoinRequest>>(`/join-requests/${requestId}/reject`, {
    reason,
  });
  return response.data.data;
}

export async function leaveRewardTeam(): Promise<unknown> {
  const response = await communityApiClient.post<ApiEnvelope<unknown>>("/teams/leave");
  return response.data.data;
}

export async function inviteToRewardTeam(teamId: number | string, inviteePhone: string): Promise<{
  code?: string;
  invite_token?: string;
}> {
  const response = await communityApiClient.post<ApiEnvelope<{ code?: string; invite_token?: string }>>(
    `/teams/${teamId}/invite`,
    { invitee_phone: inviteePhone },
  );
  return response.data.data;
}

export async function fetchTeamMessages(teamId: number | string, perPage = 30): Promise<Paginated<CommunityMessage>> {
  const response = await communityApiClient.get<ApiEnvelope<CommunityMessage[]> & { meta?: Paginated<CommunityMessage>["meta"] }>(
    `/teams/${teamId}/messages`,
    { params: { per_page: perPage } },
  );
  return { data: response.data.data, meta: response.data.meta };
}

export async function sendTeamMessage(teamId: number | string, body: string): Promise<CommunityMessage> {
  const response = await communityApiClient.post<ApiEnvelope<CommunityMessage>>(`/teams/${teamId}/messages`, {
    body,
  });
  return response.data.data;
}

export async function createTeamPoll(
  teamId: number | string,
  payload: { question: string; options: string[]; allow_multiple?: boolean; closes_at?: string },
): Promise<unknown> {
  const response = await communityApiClient.post<ApiEnvelope<unknown>>(`/teams/${teamId}/polls`, payload);
  return response.data.data;
}

export async function voteTeamPoll(pollId: number | string, optionIndex: number): Promise<unknown> {
  const response = await communityApiClient.post<ApiEnvelope<unknown>>(`/polls/${pollId}/vote`, {
    option_index: optionIndex,
  });
  return response.data.data;
}

export async function createTeamEvent(
  teamId: number | string,
  payload: { title: string; description?: string; event_at: string; location?: string },
): Promise<unknown> {
  const response = await communityApiClient.post<ApiEnvelope<unknown>>(`/teams/${teamId}/events`, payload);
  return response.data.data;
}

export async function createTeamUpdate(teamId: number | string, body: string): Promise<unknown> {
  const response = await communityApiClient.post<ApiEnvelope<unknown>>(`/teams/${teamId}/updates`, { body });
  return response.data.data;
}

export async function markTeamChatRead(teamId: number | string, messageId: number | string): Promise<unknown> {
  const response = await communityApiClient.post<ApiEnvelope<unknown>>(`/teams/${teamId}/read`, {
    message_id: messageId,
  });
  return response.data.data;
}

export async function fetchTeamRealtimeConfig(teamId: number | string): Promise<unknown> {
  const response = await communityApiClient.get<ApiEnvelope<unknown>>(`/teams/${teamId}/realtime-config`);
  return response.data.data;
}

export async function fetchRewards(params?: { status?: string; per_page?: number }): Promise<Paginated<Reward>> {
  const response = await communityApiClient.get<ApiEnvelope<Reward[]> & { meta?: Paginated<Reward>["meta"] }>(
    "/rewards",
    { params },
  );
  return { data: response.data.data, meta: response.data.meta };
}

export async function fetchRewardDetails(rewardId: number | string): Promise<Reward> {
  const response = await communityApiClient.get<ApiEnvelope<Reward>>(`/rewards/${rewardId}`);
  return response.data.data;
}

export async function fetchRewardTasks(rewardId: number | string): Promise<RewardTask[]> {
  const response = await communityApiClient.get<ApiEnvelope<RewardTask[]>>(`/rewards/${rewardId}/tasks`);
  return response.data.data;
}

export async function fetchHallOfFame(): Promise<HallOfFameEntry[]> {
  const response = await communityApiClient.get<ApiEnvelope<HallOfFameEntry[]>>("/rewards/hall-of-fame");
  return response.data.data;
}

export async function fetchLeaderboard(type: LeaderboardType): Promise<LeaderboardEntry[]> {
  const pathByType: Record<LeaderboardType, string> = {
    live_reward: "/leaderboards/live-reward",
    weekly_team: "/leaderboards/weekly-teams",
    weekly_member: "/leaderboards/weekly-members",
  };
  const response = await communityApiClient.get<ApiEnvelope<LeaderboardEntry[]>>(pathByType[type]);
  return response.data.data;
}

export async function fetchPastWinners(type: LeaderboardType): Promise<HallOfFameEntry[]> {
  const response = await communityApiClient.get<ApiEnvelope<HallOfFameEntry[]>>("/leaderboards/winners", {
    params: { type },
  });
  return response.data.data;
}
