export default function TileCustomizer({
  email,
  setEmail,
  displayName,
  setDisplayName,
  theme,
  setTheme,
  anonymous,
  setAnonymous,
  message,
  setMessage
}) {
  return (
    <>
      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-semibold text-textSecondary">
            Email
          </label>

          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="w-full rounded-2xl border border-borderRoyal bg-black/40 px-4 py-4 text-textPrimary outline-none focus:border-gold"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-textSecondary">
            Display name
          </label>

          <input
            value={displayName}
            onChange={(event) => setDisplayName(event.target.value)}
            maxLength={40}
            className="w-full rounded-2xl border border-borderRoyal bg-black/40 px-4 py-4 text-textPrimary outline-none focus:border-gold"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-textSecondary">
            Tile theme
          </label>

          <select
            value={theme}
            onChange={(event) => setTheme(event.target.value)}
            className="w-full rounded-2xl border border-borderRoyal bg-black/40 px-4 py-4 text-textPrimary outline-none focus:border-gold"
          >
            <option className="bg-royalBlack">Gold</option>
            <option className="bg-royalBlack">Crimson</option>
            <option className="bg-royalBlack">Emerald</option>
            <option className="bg-royalBlack">Royal Blue</option>
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-textSecondary">
            Public display
          </label>

          <label className="flex h-[58px] cursor-pointer items-center gap-3 rounded-2xl border border-borderRoyal bg-black/30 px-4">
            <input
              type="checkbox"
              checked={anonymous}
              onChange={(event) => setAnonymous(event.target.checked)}
              className="h-5 w-5"
            />

            <span className="text-textSecondary">
              Show as Anonymous
            </span>
          </label>
        </div>
      </div>

      <div className="mt-5">
        <label className="mb-2 block text-sm font-semibold text-textSecondary">
          Tile message
        </label>

        <textarea
          value={message}
          onChange={(event) => setMessage(event.target.value.slice(0, 280))}
          rows={4}
          className="w-full resize-none rounded-2xl border border-borderRoyal bg-black/40 px-4 py-4 text-textPrimary outline-none focus:border-gold"
        />

        <p className="mt-2 text-right text-sm text-textSecondary">
          {message.length}/280
        </p>
      </div>
    </>
  );
}