import { Timestamp } from "firebase/firestore";

export type UserProfile = {
  id: string;
  displayName: string;
  email: string;
  profilePicture: string;
  bio: string;
  credits: number;
  skillsOffered: {id: string, name: string}[];
  skillsWanted: {id: string, name: string}[];
  availability: string[];
  rating: number;
};

export type Skill = {
  id: string;
  name: string;
  description: string;
  category: string;
  userId: string; // Reference to the UserProfile who offers this skill
  imageUrl: string;
  imageHint: string;
};

export type SwapRequest = {
  id: string;
  requesterId: string; // UID of the user making the request
  receiverId: string; // UID of the user receiving the request
  skillId: string; // ID of the skill being requested (the one the requester wants to learn)
  status: 'pending' | 'accepted' | 'declined' | 'completed' | 'cancelled';
  createdAt: Timestamp;
  updatedAt: Timestamp;
  message?: string; // Optional initial message
};

export type ChatMessage = {
    id: string;
    swapRequestId: string;
    senderId: string;
    message: string;
    timestamp: Timestamp;
};

export type ScheduledSession = {
  id: string;
  title: string;
  participants: string[]; // Array of UIDs
  startTime: Timestamp;
  endTime: Timestamp;
  swapRequestId: string;
}
