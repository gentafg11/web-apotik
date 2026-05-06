# apotik
=======
# Apotik CRUD & Reporting App

## Prerequisites
- Docker Desktop (or Docker Engine) installed.
- Node.js 20 (for local development without Docker, optional).

## Run with Docker (recommended)
```bash
cd C:/laragon/www/apotik
docker compose up --build
```
The services will start:
- MySQL on **3306**
- Backend API on **5000**
- Frontend (Next.js) on **3000**

Open `http://localhost:3000` in your browser.  The first login requires a user record; you can create one directly in the database:
```sql
INSERT INTO User (email, password, role) VALUES
('admin@example.com', '<bcrypt-hash>', 'ADMIN');
```
Use `bcrypt` to hash a password, e.g. `node -e "console.log(require('bcryptjs').hashSync('yourpwd',10))"`.

## Development without Docker
1. **Backend**
   ```bash
   cd backend
   npm install
   npx prisma generate   # creates client
   npx prisma migrate dev --name init   # creates tables
   npm run dev            # runs on http://localhost:5000
   ```
2. **Frontend**
   ```bash
   cd frontend
   npm install
   npm run dev            # runs on http://localhost:3000
   ```
   The `next.config.js` rewrites `/api/*` to the local backend.

## Features
- **Admin**: full CRUD for products, categories, suppliers, customers, users, sales & expenses.
- **Cashier**: can create sales and expenses, edit only their own records.
- **Reports**: daily, weekly, monthly totals (sales, expenses, profit).
- **Charts**: visual bar charts on the dashboard (Chart.js).
- **Responsive UI** built with Tailwind CSS – works on phone, tablet, desktop.
- **Image upload** for product pictures (stored under `backend/public/uploads`).

## Environment variables
Create `.env` in `backend/` (already provided) and adjust if needed:
```
DATABASE_URL="mysql://root:password@db:3306/apotik"
JWT_SECRET="supersecretkey"
PORT=5000
```

## Notes
- All API routes are protected by JWT; admin‑only routes check the `role` field.
- passwords are stored hashed with bcrypt.
- The Docker setup mounts source code, so you can edit files locally and see changes live.

Happy coding!
>>>>>>> 76fd86f3 (Initial commit)
