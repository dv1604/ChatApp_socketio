export function formatMessageTime(date: Date | string): string {
  const messageDate = new Date(date);
  const now = new Date();
  const diffInHours = (now.getTime() - messageDate.getTime()) / (1000 * 60 * 60);

  // if message is from today,show time
  if (diffInHours < 24 && now.getDate() === messageDate.getDate()) {
    return messageDate.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });

    // if message is within a week, show day and time
  } else if (diffInHours < 168) {
    return messageDate.toLocaleDateString('en-US', {
      weekday: 'short',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });

    // if message is older than a week , show month , day and time
  } else {
    return messageDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  }
}
