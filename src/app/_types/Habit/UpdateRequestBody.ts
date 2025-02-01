export interface UpdateHabitRequestBody {
  name: string;
  supplementaryDescription?: string;
  userId: string;
  habitId: string;
}
