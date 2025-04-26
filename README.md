# FinSmart

A personal finance visualizer web application for tracking transactions, managing budgets, and visualizing your financial data with beautiful charts.

## Features
- **Dashboard:** Monthly summary, income/expenses, pie/bar/line charts, recent transactions
- **Transactions:** Add, edit, delete, and search transactions
- **Categories:** Manage expense/income categories with color and icon
- **Budgets:** Set monthly budgets per category and global monthly budget
- **Settings:** Configure your total monthly budget
- **Responsive UI:** Clean, modern, and mobile-friendly design
- **Animations:** Smooth transitions using Framer Motion

## Tech Stack
- Next.js (App Router)
- React
- Tailwind CSS
- shadcn/ui
- MongoDB (via Mongoose)
- Recharts (charts)
- Framer Motion (animations)
- React Hook Form & Zod (forms/validation)
- Lucide React (icons)

## Getting Started

1. **Clone the repository:**
   ```bash
   git clone <your-repo-url>
   cd finsmart
   ```
2. **Install dependencies:**
   ```bash
   npm install
   # or yarn install
   ```
3. **Configure Environment Variables:**
   - Copy `.env.local.example` to `.env.local` and set your MongoDB URI.
4. **Run the development server:**
   ```bash
   npm run dev
   # or yarn dev
   ```
5. **Open the app:**
   Visit [http://localhost:3000](http://localhost:3000)

## Environment Variables
Create a `.env.local` file based on `.env.local.example`:

```
MONGODB_URI=your-mongodb-connection-string
```

## Folder Structure
- `src/app` — Next.js app pages and API routes
- `src/components` — UI and feature components
- `src/models` — Mongoose models
- `src/lib` — Database connection utilities

## License
MIT

---

> Built with ❤️ for personal finance enthusiasts.
