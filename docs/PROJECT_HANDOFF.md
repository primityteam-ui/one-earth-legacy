\# One Earth Legacy - Project Handoff Guide



This document explains how to run, test, and prepare One Earth Legacy for production.



\## Project stack



Frontend:

React, Vite, Tailwind CSS, Framer Motion, Lucide React, CesiumJS, Axios



Backend:

Node.js, Express, MongoDB Atlas, Mongoose, Stripe, JWT auth, cookie sessions, rate limits, admin security middleware



\## Local project path



Windows:

C:\\Users\\vamsh\\Desktop\\one-earth-legacy



Git Bash:

&#x20;/c/Users/vamsh/Desktop/one-earth-legacy



\## Start backend



cd /c/Users/vamsh/Desktop/one-earth-legacy/backend

npm run dev



Backend API:

http://localhost:5000/api



Health:

http://localhost:5000/api/health



\## Start frontend



cd /c/Users/vamsh/Desktop/one-earth-legacy/frontend

npm run dev



Frontend:

http://localhost:5173



\## Frontend build test



cd /c/Users/vamsh/Desktop/one-earth-legacy/frontend

npm run build



Always run build before committing frontend changes.



\## Important public routes



/

&#x20;/wall

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



Old compatibility redirects:



/profiles/:username -> /u/:username

/terms -> /legal/terms

/privacy -> /legal/privacy

/security -> /legal/security

/faq -> /legal/faq



\## Important API routes



Public:

/api/public/stats

/api/public/tiles

/api/public/leaderboard

/api/public/leaderboard/countries

/api/public/audit

/api/public/profiles/:username

/api/public/emperor



Donate:

/api/donate/preview

/api/donate/mock-create



Payments:

/api/payments/stripe/create-checkout-session

/api/payments/stripe/webhook

/api/payments/stripe/session-status

/api/payments/stripe/config-status



Admin:

/api/admin/overview

/api/admin/donations.csv

/api/admin/donations/:donationId

/api/admin/audit

/api/admin/audit.csv



\## Stripe local testing



Start backend:



cd /c/Users/vamsh/Desktop/one-earth-legacy/backend

npm run dev



Start Stripe CLI webhook forwarding:



stripe listen --forward-to localhost:5000/api/payments/stripe/webhook



Copy the whsec value into backend/.env:



STRIPE\_WEBHOOK\_SECRET=whsec\_your\_local\_cli\_secret



Restart backend after changing .env.



Open:

http://localhost:5173/donate



Test:

Create Preview.

Open Stripe Checkout.

Use test card 4242 4242 4242 4242.

Let Stripe redirect to /donate/success?session\_id=cs\_test\_...

Check Wall, Audit, Leaderboard, Globe, and Admin.



\## Stripe safety rules



Do not use live keys in local development unless deliberately allowed.



Backend safety guard:



ALLOW\_LIVE\_STRIPE\_IN\_DEVELOPMENT=false



Production Stripe checklist:

\[ ] NODE\_ENV=production

\[ ] STRIPE\_SECRET\_KEY starts with sk\_live\_

\[ ] STRIPE\_WEBHOOK\_SECRET is from live Stripe Dashboard endpoint

\[ ] STRIPE\_SUCCESS\_URL uses production frontend

\[ ] STRIPE\_CANCEL\_URL uses production frontend

\[ ] Stripe Dashboard webhook endpoint points to production backend

\[ ] checkout.session.completed is enabled

\[ ] One small live payment tested



\## Admin setup



Promote admin:



cd /c/Users/vamsh/Desktop/one-earth-legacy/backend

node scripts/promote-admin.js vamshiyalavarthi11@gmail.com



Admin page:

http://localhost:5173/admin



Admin Health tab should show backend, MongoDB, Stripe checkout, Stripe webhook, Stripe config, admin IP allowlist, admin 2FA, rate limiter, and protected admin routes.



\## Temporary QA panels



Temporary QA panels are controlled by:



VITE\_SHOW\_TEMPORARY\_QA\_PANELS=true



Before final public production launch, set:



VITE\_SHOW\_TEMPORARY\_QA\_PANELS=false



This hides temporary developer checklists on:

/donate

/donate/success

/admin Health tab



Do not hide real security warnings, Stripe config warnings, or admin health warnings.



\## Donor location privacy



Public pages must never show street addresses.



Allowed public location fields:

Country

Country code

Region/state

City

Rounded approximate coordinates



Not allowed publicly:

Street address

Apartment number

Exact home coordinates

Private address notes



\## Legal copy principles



Keep public wording honest:

One Earth Legacy is a commercial digital legacy platform.

It is not currently described as a registered charity.

Stripe checkout redirect is not the same as webhook-confirmed save.

Ranks and tiles depend on confirmed payment, settlement, and review.

Audit records should not overpromise instant external transfers.

Public donor location must stay city/country level only.



\## Final route QA



Run:



cd /c/Users/vamsh/Desktop/one-earth-legacy

grep -RIn --exclude-dir=node\_modules --exclude-dir=dist --exclude-dir=.git "/profiles\\|/profile\\|profiles/" frontend/src backend/src



Allowed results only:

frontend/src/App.jsx path="/profiles/:username"

frontend/src/pages/Profile.jsx api.get(`/public/profiles/${username}`)

backend/src/routes/public.routes.js router.get("/profiles/:username", getPublicProfile)



\## Final launch checklist



\[ ] Frontend build succeeds

\[ ] Backend starts without errors

\[ ] MongoDB connected

\[ ] Donate preview works

\[ ] Mock donation works

\[ ] Stripe test checkout works

\[ ] Stripe webhook saves paid donation

\[ ] Success page verifies session\_id

\[ ] Wall shows tile

\[ ] Leaderboard updates rank

\[ ] Globe shows safe city/country point

\[ ] Audit shows donation and split records

\[ ] Admin Health shows Stripe config safely

\[ ] Legal pages reviewed

\[ ] Temporary QA panels hidden for production

\[ ] No secret keys committed

\[ ] .env is not committed

\[ ] Production attorney review completed before public launch



\## Related docs



docs/STRIPE\_WEBHOOK\_QA.md

docs/ROUTE\_LINK\_QA.md

docs/LEGAL\_PRIVACY\_QA.md

docs/TEMPORARY\_QA\_PANELS.md

