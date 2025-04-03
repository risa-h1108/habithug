import { Reflection } from "@prisma/client";

export type DiaryCalendarItem = {
  id: string;
  date: string; // ISO形式の日付文字列（"2024-03-20T15:30:00.000Z"みたいな書き方）
  reflection: Reflection;
};

export type HabitData = {
  id: string;
  name: string;
  supplementaryDescription?: string | null;
};

export type CalendarData = {
  year: number;
  month: number;
  habit: HabitData | null;
  diaries: DiaryCalendarItem[];
};
