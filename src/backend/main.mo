import Array "mo:base/Array";
import Time "mo:base/Time";
import Int "mo:base/Int";

actor {
  public query ({ caller }) func getVersion() : async Text {
    "2.0.0";
  };

  // ── User Profiles ─────────────────────────────────────────────────────────
  type UserProfile = {
    goal : Text;
    weight : Float;
    height : Float;
    user_type : Text;
    created_at : Int;
  };

  stable var userProfiles : [UserProfile] = [];

  public func saveUserProfile(goal : Text, weight : Float, height : Float, user_type : Text) : async () {
    let entry : UserProfile = {
      goal;
      weight;
      height;
      user_type;
      created_at = Time.now();
    };
    userProfiles := Array.append(userProfiles, [entry]);
  };

  public query func getUserProfiles() : async [UserProfile] {
    userProfiles;
  };

  // ── Emails ────────────────────────────────────────────────────────────────
  type EmailEntry = {
    email : Text;
    created_at : Int;
  };

  stable var emails : [EmailEntry] = [];

  public func saveEmail(email : Text) : async () {
    let entry : EmailEntry = {
      email;
      created_at = Time.now();
    };
    emails := Array.append(emails, [entry]);
  };

  public query func getEmails() : async [EmailEntry] {
    emails;
  };

  // ── Feedback ──────────────────────────────────────────────────────────────
  type FeedbackEntry = {
    rating : Text;
    chips : [Text];
    message : Text;
    created_at : Int;
  };

  stable var feedbacks : [FeedbackEntry] = [];

  public func saveFeedback(rating : Text, chips : [Text], message : Text) : async () {
    let entry : FeedbackEntry = {
      rating;
      chips;
      message;
      created_at = Time.now();
    };
    feedbacks := Array.append(feedbacks, [entry]);
  };

  public query func getFeedbacks() : async [FeedbackEntry] {
    feedbacks;
  };

  // ── Stats ─────────────────────────────────────────────────────────────────
  type Stats = {
    total_profiles : Nat;
    total_emails : Nat;
    total_feedbacks : Nat;
  };

  public query func getStats() : async Stats {
    {
      total_profiles = userProfiles.size();
      total_emails = emails.size();
      total_feedbacks = feedbacks.size();
    };
  };
};
