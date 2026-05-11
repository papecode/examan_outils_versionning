interface StatusMessageProps {
  tone?: "info" | "error" | "success";
  message: string;
}

export function StatusMessage({ tone = "info", message }: StatusMessageProps) {
  return <p className={`status status-${tone}`}>{message}</p>;
}
