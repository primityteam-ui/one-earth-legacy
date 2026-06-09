export default function PublicErrorBox({
  title = "Could not load filtered data",
  message = "Something went wrong. Please try again."
}) {
  return (
    <div className="mb-8 rounded-[1.5rem] border border-crimson/40 bg-crimson/10 p-5">
      <p className="font-bold text-crimsonLight">{title}</p>
      <p className="mt-2 text-sm text-textSecondary">{message}</p>
    </div>
  );
}