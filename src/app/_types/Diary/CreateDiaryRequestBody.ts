import { Reflection } from "@prisma/client";

export type CreateDiaryRequestBody = {
  date: Date;
  checkOnly?: boolean;
  reflection: Reflection;
  praises: {
    praiseText: string;
  }[];
  additionalNotes?: string;
  userId?: string;
};
