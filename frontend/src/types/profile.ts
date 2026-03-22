export type ProfileGrade = "A" | "B" | "C" | "D" | "F";

export interface ProfileResult {
  grade: ProfileGrade;
  viralIdeas: string[];
}
