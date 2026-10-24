# 🚀 VASTRA Deployment Guide (Hinglish)

**Goal:** Aapki VASTRA website ko permanent public link dena — koi bhi laptop/phone se khule, 24/7, **bilkul free** (₹0).

**Time:** ~30–45 minute (one time setup)

**3 hisse hain:**
| Hissa | Kaam | Free plan |
|---|---|---|
| **MongoDB Atlas** | Database (cloud MongoDB) | 512 MB — kaafi |
| **GitHub** | Aapka code store karne ke liye | Unlimited |
| **Render** | Website ko chalane ke liye (server) | 750 hrs/month — kaafi |

---

## 📋 STEP 1 — MongoDB Atlas (Database) — 10 min

### 1.1 Account banao
1. Browser me kholo: **https://www.mongodb.com/cloud/atlas/register**
2. Sign up karo (Google se sign in sabse fast hai)

### 1.2 Free cluster banao
1. "Deploy your cluster" / "Build a Database" screen aayegi
2. **M0 FREE** plan chuno (512MB, $0)
3. Region: **Mumbai (ap-south-1)** chuno (India = fast)
4. Database name kuch mat badalna, bas **Create Deployment** dabao

### 1.3 Database user banao
1. Popup me "Connect" ke liye username/password maangega
2. Username: `vastra_user`, Password: **Auto-generate** karo aur **kahin note kar lo** (copy-paste safe jagah)
3. **Create User** dabao

### 1.4 Network access kholo (important!)
1. Left sidebar → **Network Access**
2. **Add IP Address** → **ALLOW ACCESS FROM ANYWHERE (0.0.0.0/0)** → Confirm
3. Ye zaroori hai kyunki Render ka server IP change hota rehta hai

### 1.5 Connection string copy karo
1. Left sidebar → **Database** → apne cluster ke saamne **Connect** dabao
2. **Drivers** chuno (Node.js icon)
3. Aisa string dikhega:
   ```
   mongodb+srv://vastra_user:<db_password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
4. Isme `<db_password>` ki jagah apna **asli password** daalo (angle brackets hatao!)
5. String ke end me `/` ke baad **`vastra`** likho (database ka naam):
   ```
   mongodb+srv://vastra_user:MyPass123@cluster0.xxxxx.mongodb.net/vastra?retryWrites=true&w=majority
   ```
6. **Ye string copy karke safe jagah rakho** — Step 3 me lagegi 🔑

---

## 📦 STEP 2 — GitHub (Code upload) — 10 min

### 2.1 Account banao
1. Kholo: **https://github.com/signup**
2. Email + password se sign up karo

### 2.2 Naya repo banao
1. Login ke baad right-top **+** → **New repository**
2. Repository name: `vastra`
3. **Public** chuno (Render free me public repo chahiye)
4. **"Add a README file" ko UNCHECK chhodo** (empty repo chahiye)
5. **Create repository** dabao

### 2.3 Project files upload karo
Sabse easy tarika (koi install nahi):
1. Abhi jo screen khuli hai ("Quick setup") → usme **"uploading an existing file"** link par click karo
2. Pehle mera diya hua **`vastra-deploy.zip` extract karo** apne computer par (Right-click → Extract All)
3. Extract hui folder ke **andar ki SAARI files + folders** select karo (Ctrl+A) aur browser me **drag karke drop** kar do
   - ⚠️ `node_modules` folder zip me hai hi nahi — wo automatic install ho jata hai
   - Upload me 2–5 min lag sakte hain (100+ files hain)
4. Neeche **Commit changes** dabao (message optional)
5. Ho gaya! Aapka code ab `github.com/aapka-username/vastra` par hai ✅

---

## 🌐 STEP 3 — Render (Website live) — 10 min

### 3.1 Deploy start karo
1. Kholo: **https://dashboard.render.com** → **Sign in with GitHub** (same account)
2. Top-right **New +** → **Web Service**
3. Apna `vastra` repo dikhenga → **Connect** dabao
4. Form bharo:
   - **Name:** `vastra` (link banega `vastra.onrender.com` — available na ho toh `vastra-shop`, `vastra-store` etc.)
   - **Language/Runtime:** Node
   - **Branch:** main
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm run start`
   - **Instance Type:** **Free**
5. **Advanced** section kholo → **Add Environment Variable**:
   - Key: `MONGO_URI`
   - Value: *(Step 1.5 wali Atlas string — poori copy-paste karo)*
6. **Create Web Service** dabao 🎉

### 3.2 Deploy hone do (5–10 min)
1. Live log dikhega — build chal raha hai
2. Sabse neeche aisa dikhega: `==> Your service is live 🎉`
3. Top par aapka **permanent link** milega: `https://vastra.onrender.com`

### 3.3 Pehli baar kholo
1. Link kholte hi **products automatically seed ho jayenge** (database khali hai toh server khud data daal deta hai)
2. Test karke dekho:
   - ✅ Homepage khula, products dikhe
   - ✅ Signup/login: `vastra@example.com` / `user123` (customer)
   - ✅ Admin panel: `admin@vastra.com` / `admin123` (admin login ke baad `/admin`)
   - ✅ Bag me add → checkout → order placed
   - ✅ Invoice PDF download

---

## ⚠️ Zaroori baatein

1. **Site "so" jaati hai (free plan):** 15 min tak koi visit na kare toh site sleep ho jaati hai. Agli visit par pehli load **30–50 sec slow** hogi, phir normal. Paid plan ($7/mo) lene par ye jata hai.
2. **Yahan sandbox wali site alag hai:** cloud par fresh data hoga (same products, same demo users). Sandbox ke test orders wahan nahi honge.
3. **Real payments:** abhi checkout **demo mode** me hai (koi asli paisa nahi katega). Real Razorpay/UPI chahiye toh baad me batao — keys lagani padengi.
4. **Code update karna ho:** GitHub repo me nayi file version daalo (upload/edit) → Render **automatic re-deploy** kar dega.

## 🔧 Troubleshooting

| Problem | Fix |
|---|---|
| Deploy fail — build error | Render log ka last 10 line dekho; mostly npm version issue — `Settings` me Node version `20` confirm karo |
| Site khuli par "Cannot connect" / empty page | Render Dashboard → Environment → `MONGO_URI` check karo (password `< >` brackets ke andar na ho, end me `/vastra` ho) |
| Atlas connect nahi ho raha | Atlas → Network Access me `0.0.0.0/0` entry hai? Nahi toh add karo |
| Products nahi dikh rahe | 1–2 min wait karo (seed chal raha hoga); phir browser hard-refresh (Ctrl+Shift+R) |
| Login kaam nahi kar raha | Fresh data hai — pehli baar signup karo ya `vastra@example.com` / `user123` try karo |

## 🌏 Bonus — Apna domain (optional, baad me)

GoDaddy/Namecheap se domain lo (₹500–1000/saal, jaise `vastra.in`) → Render Dashboard → Settings → **Custom Domains** → domain add karo → DNS records copy karke domain provider me paste karo. Guide chahiye toh mujhse pooch lena.
