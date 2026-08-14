# HackInMotion-RICR-HIM-1177
├── frontend/
│   ├── app/                      # Next.js routes and server actions
│   ├── components/               # Dashboard and form components
│   ├── e2e/                      # Playwright end-to-end tests
│   └── lib/                      # Analytics, categories, and shared helpers
├── architecture-diagram.png
└── presentation.pptx
```

## Prerequisites

- Node.js 18.17 or later
- npm
- A Supabase project

## Local setup

1. Clone the repository and open the frontend directory.

   ```bash
   git clone <repository-url>
   cd HackInMotion-RICR-HIM-1177/frontend
   ```

2. Install dependencies.

   ```bash
   npm install
   ```

3. In your Supabase project, run the SQL migrations in `backend/migrations` in numeric order:

   ```text
   001_initial_schema.sql
   002_rls_policies.sql
   003_create_profile_on_signup.sql
   004_recurring_payment_analysis.sql
   005_add_transaction_type.sql
   ```

4. Add the Supabase project values to `frontend/.env.local`.

   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://<your-project-ref>.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
   ```

5. In Supabase Auth, add your local application URL (for example, `http://localhost:3000`) to the allowed redirect URLs. This is required for email confirmation and password resets.

6. Start the development server.

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000). Create an account, verify the confirmation email, and sign in.

## Using FinSight

1. Set your monthly income from the dashboard.
2. Add individual transactions or import a CSV file.
3. Create category budgets for the selected month.
4. Add savings goals and update their progress over time.
5. Use the dashboard to review your financial health, spending trends, budget progress, and recurring payments.

### CSV import format

The importer requires date, description, and amount information. Column names are matched case-insensitively and may use common alternatives:

| Required data | Supported column names |
| --- | --- |
| Date | `Date`, `Txn Date`, `Transaction Date`, `Posted Date` |
| Description | `Description`, `Narration`, `Note`, `Memo` |
| Amount | `Amount`, `Value`, or separate `Debit`/`Credit` columns |
| Merchant (optional) | `Merchant`, `Vendor`, `Store`, `Payee` |

Accepted dates include `YYYY-MM-DD`, `DD/MM/YYYY`, and ISO 8601 dates. Positive amounts are imported as income; negative amounts are imported as expenses. Each upload accepts 1 to 5,000 records. A duplicate is a record with the same date, description, and amount as an existing transaction for that user.

## Available commands

Run these from `frontend/`.

| Command | Description |
| --- | --- |
| `npm run dev` | Start the local development server. |
| `npm run build` | Build the production application. |
| `npm run start` | Run the built production application. |
| `npm run lint` | Run ESLint with warnings treated as errors. |
| `npm run test:e2e` | Run the Playwright end-to-end test suite. |

## Security and data access

All application tables use Supabase RLS policies. A signed-in user can only read, create, update, or delete their own profile, transactions, budgets, goals, and recurring-payment records. Server actions additionally validate input and scope update and delete operations to the authenticated user.

## Documentation

- [API and server-action reference](api-documentation.md)
- [Architecture diagram](architecture-diagram.png)

## License

This project does not currently include a license file. Add one before distributing or reusing the code outside the project team.