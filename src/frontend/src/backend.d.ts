import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;

export interface UserProfile {
    goal: string;
    weight: number;
    height: number;
    user_type: string;
    created_at: bigint;
}

export interface EmailEntry {
    email: string;
    created_at: bigint;
}

export interface FeedbackEntry {
    rating: string;
    chips: string[];
    message: string;
    created_at: bigint;
}

export interface Stats {
    total_profiles: bigint;
    total_emails: bigint;
    total_feedbacks: bigint;
}

export interface backendInterface {
    getVersion(): Promise<string>;
    saveUserProfile(goal: string, weight: number, height: number, user_type: string): Promise<void>;
    getUserProfiles(): Promise<UserProfile[]>;
    saveEmail(email: string): Promise<void>;
    getEmails(): Promise<EmailEntry[]>;
    saveFeedback(rating: string, chips: string[], message: string): Promise<void>;
    getFeedbacks(): Promise<FeedbackEntry[]>;
    getStats(): Promise<Stats>;
}
