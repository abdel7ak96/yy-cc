export const cleanString = (input: string): string => {
  return input.toLowerCase().replace(' ', '');
};

export const isDateInPastOrFuture = (
  dateString: string
): 'past' | 'future' | 'today' => {
  // Split the date string into day, month, and year
  const [day, month, year] = dateString.split('.').map(Number);

  // Create a Date object from the parsed values
  const inputDate = new Date(year, month - 1, day);

  // Get the current date without the time component
  const currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0);

  return inputDate <= currentDate ? 'past' : 'future';
};
