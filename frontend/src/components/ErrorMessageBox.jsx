export default function ErrorMessageBox({
  message,
  className = ""
}) {
  if (!message) {
    return null;
  }

  return (
    <p
      className={`mt-4 rounded-2xl border border-crimson/40 bg-crimson/10 p-4 text-sm text-crimsonLight ${className}`}
    >
      {message}
    </p>
  );
}