Returns the authenticated user's goals, ordered by deadline ascending.

```ts
getGoals()
// => Array<{ id, user_id, name, target_amount, current_amount, deadline, created_at }>
```

### `updateGoal(id, current_amount)`

Sets the current saved amount. `current_amount` must be between 0 and 10,000,000, inclusive.

```ts
updateGoal('8a70a3c2-5d64-4b37-9cd9-7bf8d6c3a718', 2500)
// => { success: true }
```

### `deleteGoal(id)`

Deletes a goal owned by the current user.

```ts
deleteGoal('8a70a3c2-5d64-4b37-9cd9-7bf8d6c3a718')
// => { success: true }
```

## Dashboard actions

These actions are in `frontend/app/dashboard/actions.ts`.

| Action | Input | Output | Description |
| --- | --- | --- | --- |
| `getMonthlyIncome()` | None | `number` | Returns the profile's monthly income, or `0` when no profile value exists. |
| `updateMonthlyIncome(monthlyIncome)` | Number from 0 to 10,000,000 | No success body | Creates or updates the user's profile income and revalidates `/dashboard`. |
| `getBudgetProgress()` | None | `Array<{ category, spent, target }>` | Combines current-month budgets with current-month spending by category. |

## Analytics services

Analytics functions live in `frontend/lib/analysis.ts` and are called by the dashboard. They only read the authenticated user's data, except `getRecurringPayments`, which also persists detections.

| Function | Input | Output | Behavior |
| --- | --- | --- | --- |
| `getTopCategories(monthFilter?)` | Optional `YYYY-MM` | `CategorySummary[]` | Expense totals, counts, and percentages by category, sorted by total descending. |
| `getMonthlyTrends(monthsBack = 6)` | Optional number | `MonthlyTrend[]` | Expense totals and counts by month across the lookback period. |
| `getSpikes(currentMonth)` | `YYYY-MM` | `SpikeAlert[]` | Flags a category whose current-month spend is more than 30% above its average historical transaction amount in the prior six months. |
| `getFinancialHealthScore()` | None | `FinancialHealthScore` | Calculates a 0–100 score from savings rate, budget adherence, and spike alerts. |
| `getRecommendations()` | None | `string[]` | Generates up to three recommendations from recurring charges, top category, spikes, and savings rate. |
| `getRecurringPayments()` | None | `RecurringPayment[]` | Detects and saves qualifying repeated expense charges, sorted by estimated monthly cost. |

### Analytics response types

```ts
interface CategorySummary {
  category: string;
  total: number;
  count: number;
  percentage: number;
}

interface MonthlyTrend {
  month: string; // YYYY-MM
  total: number;
  count: number;
}

interface SpikeAlert {
  category: string;
  currentMonth: string;
  currentSpend: number;
  historicalAverage: number;
  percentageAbove: number;
}

interface FinancialHealthScore {
  score: number;
  savingsRate: number;
  savingsPoints: number;
  budgetAdherence: number;
  budgetPoints: number;
  spikePenalty: number;
  breakdown: string;
}

interface RecurringPayment {
  merchant: string;
  cadence: 'weekly' | 'monthly' | 'yearly';
  typicalAmount: number;
  monthlyCost: number;
  lastChargeDate: string;
  nextExpectedDate: string;
  transactionIds: string[];
}
```

### Financial-health score

The score is calculated for the current calendar month:

- **Savings rate (0–50 points):** `(income − expenses) / income`. A rate of 20% or higher receives 50 points; a positive rate below 20% receives a proportional score.
- **Budget adherence (0–30 points):** the percentage of current-month budget categories whose spending does not exceed the target.
- **Spending spikes (0–20 points):** 20 points when no spike is detected, 10 points for one, and 0 points for two or more.

The monthly income from the profile is used when it is greater than zero. Otherwise, current-month `income` transactions are used.

### Recurring-payment detection

A recurring payment must have at least three expense charges in the last 12 months for the same normalized merchant or description. The algorithm accepts average intervals of 6–8 days (weekly), 25–35 days (monthly), or 330–400 days (yearly), with no more than 15% amount variance and five days of interval variance. Detected charges are marked as recurring and upserted into `recurring_payments`.

## Categorization service

`categorizeTransaction(merchant?, description?)` uses rule-based matching against the category keyword dictionary, followed by Fuse.js fuzzy matching when there is no exact match. It can return `Food`, `Rent`, `Shopping`, `Subscriptions`, `Travel`, `Bills`, `Entertainment`, `Income`, or `Other`; unmatched transactions are assigned `Other`. `categorizeBatch(transactions)` applies the same process to each record.

The category dictionary is in `frontend/lib/constants.ts` and can be extended without changing the action API.