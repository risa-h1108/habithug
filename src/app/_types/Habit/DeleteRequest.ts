export interface DeleteHabitRequestBody {
  name: string;
  supplementaryDescription?: string;
  userId: string;
  habitId: string;
}
