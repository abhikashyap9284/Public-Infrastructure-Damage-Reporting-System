# CivicPulse — Abhi ke liye setup aur deployment guide

Is project mein citizen, organization/authority aur admin ke **alag dashboards** hain. Vercel par real website deploy hogi; data Neon PostgreSQL mein save hoga.

## 1. ZIP extract karo

`CivicPulse_Vercel_Neon_Source.zip` extract karo. Andar `civicpulse` folder VS Code mein kholo. Terminal isi folder mein hona chahiye jahan `package.json` hai.

Node.js 22 ya 24 install hona chahiye. Check:

```powershell
node -v
npm -v
```

## 2. Packages install karo

```powershell
npm ci
```

Lockfile included hai. Pehle `npm audit fix --force` mat chalana; woh incompatible versions la sakta hai.

## 3. Neon database banao

1. https://console.neon.tech open karke sign in karo.
2. **New Project** se `civicpulse` project banao. App ke paas wali available region select karo.
3. Project mein **Connect** kholo. Apni branch, database aur role select karo.
4. PostgreSQL connection string copy karo. Agar pooling option dikhe to pooled connection use kar sakte ho.
5. Connection string ko public chat, screenshot, GitHub README ya frontend code mein paste mat karo.

Official help: https://neon.com/docs/guides/nextjs

## 4. Local environment set karo

Windows PowerShell:

```powershell
Copy-Item .env.example .env.local
notepad .env.local
```

Values apni details se replace karo:

```dotenv
DATABASE_URL=postgresql://YOUR_USER:YOUR_PASSWORD@YOUR_NEON_HOST/YOUR_DB?sslmode=require
APP_URL=http://localhost:3000
NEXT_PUBLIC_DEMO_MODE=false
ADMIN_NAME=Abhi
ADMIN_EMAIL=your-email@example.com
ADMIN_PASSWORD=CHOOSE_YOUR_OWN_STRONG_PASSWORD
```

`DATABASE_URL` mein **Neon Connect se mili poori asli string** paste karo. Example ke placeholders rehne par connection nahi chalega. Neon string ke existing query parameters ko rehne do. Password kam se kam 10 characters, uppercase, lowercase aur number wala ho; maximum 72 UTF-8 bytes.

`DATABASE_URL` ke aage `NEXT_PUBLIC_` kabhi mat lagana. `.env.local` pehle se `.gitignore` mein excluded hai.

## 5. Tables aur admin banao

```powershell
npm run db:migrate
npm run admin:create
```

Pehli command tables banati hai. Doosri tumhari chosen email/password se admin account banati hai. Existing email ko yeh command admin mein convert ya overwrite nahi karti.

Admin create hone ke baad `.env.local` se `ADMIN_PASSWORD` hata do. Database mein bcrypt hash stored rahega. Admin creation credentials Vercel mein add karna zaroori nahi hai.

## 6. Website locally chalao

```powershell
npm run dev
```

http://localhost:3000 kholo.

- Admin: apni configured admin email/password se sign in karo.
- Citizen: **Create account → Citizen**, nayi email se register karo.
- Organization: **Create account → Organization**, organization ka naam aur city do.
- Sign out: sidebar mein apne naam ke paas logout icon par click karo.

Real application empty data se start hoti hai. Preview ke fictional reports production Neon database mein automatically insert nahi hote.

## 7. Pura workflow test karo

1. Citizen se report banao: category, title, description, priority select karo.
2. Map par actual issue location pin karo; GPS optional hai. Address/city add karo.
3. Actual issue ki JPEG/PNG/WebP photo upload karo. App automatically compress karegi.
4. Submit karke report ID note karo.
5. Organization account register karo. Iski status pehle pending hogi.
6. Admin login → **Organizations → Approve**.
7. Admin → **All reports** → report open → approved organization assign karo. Organization aur report ki city match honi chahiye.
8. Organization login → **Assigned reports** → status **In progress**, progress note add karo.
9. Repair ke baad **Resolved**, clear resolution note publish karo.
10. Citizen login → report open → rating do. Repair incomplete ho to 7 din ke andar explanation ke saath **Reopened** karo.
11. Notifications, map, community support, filters, CSV export aur Settings bhi check karo.

## 8. Build check karo

Development server ko `Ctrl+C` se stop karke:

```powershell
npm run check
npm test
npm run build
```

Production build locally dekhna ho:

```powershell
npm start
```

## 9. GitHub par upload karo

GitHub par ek empty repository banao, e.g. `civicpulse`. Actual username/repository URL use karo:

```powershell
git init
git add .
git status
```

`git status` mein `.env.local` ya koi real secret nahi aana chahiye. Sirf placeholder `.env.example` allowed hai.

```powershell
git commit -m "Build CivicPulse infrastructure reporting platform"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/civicpulse.git
git push -u origin main
```

`origin already exists` aaye to pehle `git remote -v` se existing URL check karo; bina check kiye remote overwrite mat karo.

Agar `.env` pehle GitHub par push ho chuki ho, `.gitignore` alone history se secret nahi hatata. Exposed database password rotate karke Vercel/local values update karna hoga. Naye ZIP mein koi real credential included nahi hai.

## 10. Vercel par deploy karo

1. https://vercel.com/new kholo, GitHub connect karke `civicpulse` repository import karo.
2. **Root Directory:** wahi folder jahan `package.json` hai. Agar repo ke andar `civicpulse/` folder upload kiya hai to use root directory select karo.
3. **Framework Preset:** Next.js.
4. **Install Command:** `npm ci`.
5. **Build Command:** `npm run build`.
6. Output directory ko Next.js default par rehne do. `dist` mat set karna; woh sirf static demo ke liye hai.
7. Node.js version 22.x ya 24.x select karo, agar option available ho.
8. Environment Variables mein yeh values add karo:

| Name | Value | Kahan apply karna hai |
| --- | --- | --- |
| `DATABASE_URL` | Tumhari real Neon PostgreSQL connection string | Production; Preview mein separate test branch recommended |
| `NEXT_PUBLIC_DEMO_MODE` | `false` | Production aur Preview |
| `APP_URL` | `https://YOUR_PROJECT.vercel.app` | Production; preview mein actual preview origin ya omit for same-origin requests |

9. **Deploy** click karo. Build successful hone par deployment URL open karo.
10. URL decide hone ke baad agar `APP_URL` alag ho, settings mein correct origin save karke **Redeploy** karo. Public environment values build time par bundle hoti hain, isliye demo flag change ke baad rebuild zaroori hai.
11. Local step 5 same Neon database par already chalaya hai to tables/admin pehle se available honge. Agar new database use kar rahe ho to local `.env.local` mein wahi database URL set karke migration/admin commands ek baar chalao.

Deployment ke baad `https://YOUR_PROJECT.vercel.app/api/health` par `{"ok":true,"mode":"database"}` milna chahiye. Is endpoint mein secret values expose nahi hoti.

Official references: https://vercel.com/docs/frameworks/full-stack/nextjs · https://vercel.com/docs/environment-variables

## 11. Common problems

| Problem | Kya karo |
| --- | --- |
| Database is not configured | Correct `DATABASE_URL` local/Vercel environment mein add karo. Vercel redeploy karo. |
| Database tables are not ready | Correct database URL ke saath `npm run db:migrate` chalao. |
| Email already registered | Sign in karo ya alag email use karo. Admin CLI existing citizen ko promote nahi karta. |
| Organization ko reports nahi dikh rahi | Admin approval, same-city assignment aur correct organization account check karo. |
| Sign in ke baad bhi demo role selector | `NEXT_PUBLIC_DEMO_MODE=false` set karke rebuild/redeploy karo. |
| Use my location blocked | HTTPS site use karo, browser permission allow karo, ya map pin/coordinates manually set karo. |
| Map blank | Internet/OSM tile availability check karo. Coordinate fields se reporting phir bhi possible hai. |
| Photo upload error | Supported photo choose karo. Input max 10 MB; app compress karti hai, decoded server limit 800 KB hai. |
| Too many attempts | Login/email rate limit expire hone do; 15-minute authentication window hai. |
| Account inactive | Administrator ne access disable kiya hai. Authorized admin se access restore karvao. |
| Request origin not allowed | Correct website URL se form use karo, `APP_URL` exact origin check karo, refresh/redeploy karo. |
| Windows `.next` EBUSY/locked | Dev server/extra Node terminals stop karo. Project ko OneDrive-sync folder se bahar rakhkar retry karo. Zarurat ho to stopped project ka generated `.next` folder remove karke build karo. |

## 12. Updates aur maintenance

Code changes ke baad `npm run check`, `npm test`, `npm run build`, phir Git commit/push karo. Connected Vercel Git deployment update karega.

Expired sessions/rate-limit entries clean karne ke liye periodically:

```powershell
npm run db:cleanup
```

Initial migration v1 idempotent hai; existing records delete nahi hote. Future schema changes ke liye separate reviewed migrations add karna hoga. Neon backup/restore, budgets aur actual expected load ko apne selected plan ke hisaab se configure karo.

## Demo dekhna ho, Neon abhi ready na ho

Hosted demo mein top par clear **DEMO WORKSPACE** label aur role selector hai. Source se demo chalana ho to temporarily `.env.local` mein `NEXT_PUBLIC_DEMO_MODE=true` karke `npm run dev` chala sakte ho. Demo passwords `Demo@2026!` hain; sample emails README mein hain. Real launch se pehle flag `false` karke rebuild karna hai.
