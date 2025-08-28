import React, { useState } from 'react';
import { Card } from '../components/Card';
import { Badge } from '../components/Badge';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { fmt } from '../api';

interface DashboardProps {
  account: { id: number; balance_cents: number; display_number: string } | null;
  card?: { last4: string } | null;
  transactions: Array<{
    id: number;
    type: "DEPOSIT" | "PURCHASE";
    amount_cents: number;
    status: "APPROVED" | "DECLINED" | "SETTLED";
    merchant?: string | null;
    note?: string | null;
    created_at: string;
  }>;
  onRefresh: () => void;
  onDeposit?: (amount: string) => void;
  onIssueCard?: () => void;
  onPurchase?: (amount: string, merchant: string, category: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  account,
  card,
  transactions,
  onRefresh,
  onDeposit,
  onIssueCard,
  onPurchase
}) => {
  // Local form state
  const [depositAmount, setDepositAmount] = useState("");
  const [purchaseAmount, setPurchaseAmount] = useState("");
  const [purchaseMerchant, setPurchaseMerchant] = useState("");
  const [purchaseCategory, setPurchaseCategory] = useState("");

  // Helpers (kept local to avoid altering imports)
  const amountOk = (s: string) => {
    const n = parseFloat(s);
    return Number.isFinite(n) && n > 0;
  };
  const purchaseOk =
    amountOk(purchaseAmount) &&
    purchaseMerchant.trim().length > 0 &&
    /^\d{4}$/.test(purchaseCategory.trim());

  const prettyDate = (iso: string) =>
    new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });

  const maskedLast4 = (last4?: string) =>
    last4 ? `•••• ${last4}` : '';

  const statusVariant = (s: "APPROVED" | "DECLINED" | "SETTLED") => {
    if (s === "APPROVED") return "info"; // blue theme
    if (s === "DECLINED") return "error";
    return "default";
  };

  if (!account) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-6">
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h10M5 6h14" />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Welcome to HealthSavings</h2>
        <p className="text-gray-600">Create your account to get started with your HSA.</p>
        </div>
      </div>
    );
  }

  const recentTransactions = transactions.slice(0, 6);

  return (
    <div className="space-y-8 max-w-6xl mx-auto px-6 py-6 dashboard-shell">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Balance / Hero */}
          <div className="rounded-2xl shadow-xl overflow-hidden bg-gradient-to-br from-blue-600 to-cyan-400">
          <div className="p-6">
            <div className="text-white/80 text-sm">Available Balance</div>
            <div className="text-4xl font-extrabold text-white mt-2">{fmt(account.balance_cents)}</div>
            <div className="mt-6 flex items-center text-white/80 text-xs">
              <span className="mr-2">Account Type</span>
              <span className="px-2 py-1 rounded-md bg-white/10">HSA</span>
            </div>
          </div>
        </div>

          {/* Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card title="Deposit Funds" subtitle="Add funds to your HSA" hover>
              <div className="space-y-4">
                <label className="text-sm text-gray-700">Amount ($)</label>
                <Input
                  type="number"
                  inputMode="decimal"
                  aria-label="Deposit amount in dollars"
                  placeholder="0.00"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                />
                <div className="flex justify-end">
                  <Button
                    variant="primary"
                    disabled={!amountOk(depositAmount)}
                    onClick={() => onDeposit && onDeposit(depositAmount)}
                  >
                    Deposit
                  </Button>
                </div>
          </div>
        </Card>

            <Card title="Make Purchase" subtitle="Validate medical expense" hover>
              <div className="space-y-3">
                <label className="text-sm text-gray-700">Amount ($)</label>
                <Input
                  type="number"
                  inputMode="decimal"
                  aria-label="Purchase amount in dollars"
                  placeholder="0.00"
                  value={purchaseAmount}
                  onChange={(e) => setPurchaseAmount(e.target.value)}
                />
                <label className="text-sm text-gray-700">Merchant</label>
                <Input
                  placeholder="e.g., Walgreens"
                  aria-label="Merchant name"
                  value={purchaseMerchant}
                  onChange={(e) => setPurchaseMerchant(e.target.value)}
                />
                <label className="text-sm text-gray-700">Category code (MCC)</label>
                <Input
                  placeholder="e.g., 8062"
                  aria-label="Merchant category code"
                  value={purchaseCategory}
                  onChange={(e) => setPurchaseCategory(e.target.value)}
                />
                <div className="flex justify-end">
                  <Button
                    variant="primary"
                    disabled={!purchaseOk || !card}
                    title={!card ? 'Issue a card first' : undefined}
                    onClick={() =>
                      onPurchase && onPurchase(purchaseAmount, purchaseMerchant.trim(), purchaseCategory.trim())
                    }
                  >
                    Submit
                  </Button>
                </div>
          </div>
        </Card>
      </div>

          {/* Virtual Card */}
          <Card title="Virtual Card" subtitle="Create or view your card" hover>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="text-sm text-gray-700">
                {card?.last4
                  ? <>Card {maskedLast4(card.last4)} • linked to current balance</>
                  : <>No card issued yet</>}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant={card?.last4 ? "outline" : "primary"}
                  onClick={() => onIssueCard && onIssueCard()}
                >
                  {card?.last4 ? "Reissue / Replace" : "Issue Card"}
                </Button>
                <Button variant="ghost" onClick={onRefresh}>Refresh</Button>
              </div>
            </div>
          </Card>
          </div>

        {/* Right column */}
        <div className="space-y-6 lg:sticky lg:top-6">
        <Card title="Recent Transactions" subtitle="Latest account activity" hover>
          <div className="space-y-4">
            {recentTransactions.length === 0 ? (
              <div className="text-center py-10 text-gray-600">No transactions yet</div>
            ) : (
                recentTransactions.map((tx) => {
                  const isDeposit = tx.type === 'DEPOSIT';
                  return (
                <div key={tx.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center text-base bg-blue-100 text-blue-700`}
                          aria-hidden="true"
                        >
                          {isDeposit ? '↑' : '↓'}
                        </div>
                    <div>
                          <div className="font-medium text-gray-900">
                            {isDeposit ? 'Deposit' : (tx.merchant || 'Purchase')}
                          </div>
                          <div className="text-xs text-gray-500">{prettyDate(tx.created_at)}</div>
                    </div>
                  </div>
                  <div className="text-right">
                        <div className={`font-semibold text-blue-700`}>
                          {isDeposit ? '+' : '-'}{fmt(tx.amount_cents)}
                        </div>
                        <Badge variant={statusVariant(tx.status)} size="sm">{tx.status}</Badge>
                  </div>
                </div>
                  );
                })
            )}
            <div className="flex items-center justify-end pt-2">
                <Button variant="ghost" size="sm" onClick={onRefresh}>Refresh</Button>
              </div>
            </div>
          </Card>
          </div>
      </div>
    </div>
  );
};
