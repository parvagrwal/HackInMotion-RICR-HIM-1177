import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { RecurringPayment } from '@/lib/analysis';

export function RecurringPaymentsCard({ payments }: { payments: RecurringPayment[] }) {
  const monthlyTotal = payments.reduce((sum, payment) => sum + payment.monthlyCost, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Recurring payments</CardTitle>
        <p className="text-sm text-muted-foreground">
          {payments.length === 0 ? 'No recurring payments detected yet.' : `$${monthlyTotal.toFixed(2)} estimated monthly cost`}
        </p>
      </CardHeader>
      {payments.length > 0 && (
        <CardContent>
          <div className="space-y-3">
            {payments.slice(0, 5).map((payment) => (
              <div key={`${payment.merchant}-${payment.lastChargeDate}`} className="flex items-center justify-between text-sm">
                <div>
                  <p className="font-medium">{payment.merchant}</p>
                  <p className="text-muted-foreground capitalize">{payment.cadence} · next: {payment.nextExpectedDate}</p>
                </div>
                <span className="font-medium">${payment.monthlyCost.toFixed(2)}/mo</span>
              </div>
            ))}
          </div>
        </CardContent>
      )}
    </Card>
  );
}
