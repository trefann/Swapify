export type User = {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  bio: string;
  credits: number;
  skillsToTeach: string[];
  skillsToLearn: string[];
  availability: string[];
  rating: number;
};

export type Skill = {
  id: string;
  name: string;
  category: string;
  user: User;
  imageUrl: string;
  imageHint: string;
};

export type SwapRequest = {
  id: string;
  fromUser: User;
  toUser: User;
  offeredSkill: string;
  requestedSkill: string;
  proposedDate: Date;
  status: 'pending' | 'accepted' | 'declined' | 'completed' | 'cancelled';
  message: string;
};

export type Message = {
    id: string;
    swapRequestId: string;
    senderId: string;
    content: string;
    timestamp: Date;
};

export type ScheduledSession = {
  id: string;
  title: string;
  participant: User;
  startTime: Date;
  endTime: Date;
}
