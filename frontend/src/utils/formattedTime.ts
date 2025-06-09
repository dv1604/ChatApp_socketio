export function formatMessageTime(date: Date | string): string {
  const messageDate = new Date(date);
  const now = new Date();
  const diffInHours = (now.getTime() - messageDate.getTime()) / (1000 * 60 * 60);

  if (diffInHours < 24 && now.getDate() === messageDate.getDate()) {
    return messageDate.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  } else if (diffInHours < 168) {
    return messageDate.toLocaleDateString('en-US', {
      weekday: 'short',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
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
