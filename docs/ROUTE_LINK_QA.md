\# One Earth Legacy — Route \& Link QA Guide



This guide prevents broken public links before production launch.



\## Correct browser routes



Use these routes for frontend navigation:



/wall

/donate

/donate/success

/leaderboard

/globe

/audit

/u/:username

/admin

/legal/terms

/legal/privacy

/legal/security

/legal/faq



Old simple legal routes may stay as redirects for compatibility:



/terms -> /legal/terms

/privacy -> /legal/privacy

/security -> /legal/security

/faq -> /legal/faq



\## Public profile route rule



Correct public browser profile URL:



/u/:username



Do not use this as a browser page link:



/profiles/:username



\## API route exception



This API route is correct and should stay:



/api/public/profiles/:username



Frontend profile page may call:



api.get(`/public/profiles/${username}`)



Backend may keep:



router.get("/profiles/:username", getPublicProfile);



\## Old profile route redirect



The frontend may keep this redirect for old shared links:



/profiles/:username -> /u/:username



This is only for backward compatibility.



\## Search before launch



Run:



grep -RIn --exclude-dir=node\_modules --exclude-dir=dist --exclude-dir=.git "/profiles\\|/profile\\|profiles/" frontend/src backend/src



Expected allowed results:



frontend/src/App.jsx path="/profiles/:username"

frontend/src/pages/Profile.jsx api.get(`/public/profiles/${username}`)

backend/src/routes/public.routes.js router.get("/profiles/:username", getPublicProfile)



No other frontend page should link to /profiles/:username.



\## Main public link search



Run:



grep -RIn --exclude-dir=node\_modules --exclude-dir=dist --exclude-dir=.git "/wall\\|/leaderboard\\|/globe\\|/audit\\|/donate/success\\|/donate\\|/u/\\|/legal/" frontend/src



Check:



Navbar links work.

Footer legal links open /legal/terms, /legal/privacy, /legal/security, and /legal/faq.

Wall profile links open /u/:username.

Leaderboard profile links open /u/:username.

Globe activity links open /u/:username.

Admin profile links open /u/:username.

Donation success links open Wall, Leaderboard, Globe, Audit, Donate.



\## Final browser test



Open:



http://localhost:5173/wall

http://localhost:5173/leaderboard

http://localhost:5173/globe

http://localhost:5173/audit

http://localhost:5173/donate

http://localhost:5173/donate/success

http://localhost:5173/u/test-user

http://localhost:5173/legal/terms

http://localhost:5173/legal/privacy

http://localhost:5173/legal/security

http://localhost:5173/legal/faq



Expected:



All public pages load.

No blank page.

No Vite error.

Profile links use /u/:username.

Old /profiles/:username redirects to /u/:username.

Old /terms, /privacy, /security, and /faq redirect to /legal/...

