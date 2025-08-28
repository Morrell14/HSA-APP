import React, { useState } from 'react';
import { Card } from '../components/Card';
import { Badge } from '../components/Badge';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { fmt } from '../api';

// Icons
import { FaPiggyBank, FaCreditCard, FaShoppingBag, FaSyncAlt, FaPlusCircle, FaStore } from 'react-icons/fa';
import { MdHistory } from 'react-icons/md';

interface DashboardProps {
  account: { id: number; balance_cents: number; display_number: string } | null;
  card?: { last4: string } | null;
  transactions: Array<{
    id: number;
    type: 'DEPOSIT' | 'PURCHASE';
    amount_cents: number;
    status: 'APPROVED' | 'DECLINED' | 'SETTLED';
    merchant?: string | null;
    note?: string | null;
    created_at: string;
  }>;
  userName?: string;
  onRefresh: () => void;
  onDeposit?: (amount: string) => void;
  onIssueCard?: () => void;
  onPurchase?: (amount: string, merchant: string, category: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  account,
  card,
  transactions,
  userName,
  onRefresh,
  onDeposit,
  onIssueCard,
  onPurchase,
}) => {
  // Local form state
  const [depositAmount, setDepositAmount] = useState('');
  const [purchaseAmount, setPurchaseAmount] = useState('');
  const [purchaseMerchant, setPurchaseMerchant] = useState('');
  const [purchaseCategory, setPurchaseCategory] = useState('');

  // Helpers
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

  const maskedLast4 = (last4?: string) => (last4 ? `•••• ${last4}` : '');

  const statusVariant = (s: 'APPROVED' | 'DECLINED' | 'SETTLED') => {
    if (s === 'APPROVED') return 'info'; // blue theme
    if (s === 'DECLINED') return 'error';
    return 'default';
  };

  if (!account) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="text-center" style={{ maxWidth: 360 }}>
          <div
            className="rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ width: 64, height: 64, background: 'var(--blue-100)' }}
          >
            <FaPiggyBank size={28} style={{ color: 'var(--blue-600)' }} />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Welcome to HealthSavings</h2>
          <p className="text-gray-600">Create your account to get started with your HSA.</p>
        </div>
      </div>
    );
  }

  const recentTransactions = transactions.slice(0, 6);

  return (
    <div className="px-6 py-6">
      {/* Center shell like other pages */}
      <div className="dashboard-shell" style={{ maxWidth: 1100, margin: '0 auto' }}>
        {/* Welcome banner */}
        {userName && (
          <div className="mb-4 p-4 rounded-xl bg-blue-50 border border-blue-200 text-blue-800">
            <div className="flex items-center gap-2">
              <div
                className="rounded-full flex items-center justify-center"
                style={{ width: 32, height: 32, background: 'var(--blue-100)', color: 'var(--blue-600)' }}
                aria-hidden="true"
              >
                <FaPiggyBank size={16} />
              </div>
              <span className="font-extrabold text-xl">Welcome, {userName}!</span>
            </div>
          </div>
        )}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT COLUMN */}
          <div className="lg:col-span-2 space-y-6">
            {/* Hero / Balance */}
            <div
              className="rounded-2xl shadow-xl overflow-hidden"
              style={{ background: 'linear-gradient(135deg, var(--blue-600) 0%, var(--blue-500) 100%)' }}
            >
              <div className="p-6">
                <div className="flex items-center gap-4" style={{ color: '#fff' }}>
                  <div
                    className="rounded-xl flex items-center justify-center"
                    style={{ width: 48, height: 48, background: 'rgba(255,255,255,0.12)' }}
                  >
                    <FaPiggyBank size={22} />
                  </div>
                  <div>
                    <div className="text-sm" style={{ opacity: 0.85 }}>
                      Available Balance
                    </div>
                    <div className="text-4xl font-extrabold">{fmt(account.balance_cents)}</div>
                  </div>
                </div>
                <div className="mt-6 flex items-center" style={{ color: 'rgba(255,255,255,0.85)' }}>
                  <span className="text-xs">Account Type</span>
                  <span
                    className="text-xs"
                    style={{
                      marginLeft: '0.5rem',
                      padding: '0.25rem 0.5rem',
                      borderRadius: 6,
                      background: 'rgba(255,255,255,0.12)',
                      color: '#fff',
                    }}
                  >
                    HSA
                  </span>
                </div>
              </div>
            </div>

            {/* ACTIONS — side by side */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Deposit */}
              <Card title="Deposit Funds" subtitle="Add funds to your HSA" hover>
                <div className="space-y-3">
                  <label className="text-sm text-gray-700">Amount ($)</label>
                  <Input
                    type="number"
                    inputMode="decimal"
                    aria-label="Deposit amount in dollars"
                    placeholder="0.00"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    // style={{ height: 44 }} // uncomment to match Register input height
                  />
                  <div className="flex items-center justify-end gap-4">
                    <Button variant="ghost" className="btn-animate" onClick={() => setDepositAmount('')}>
                      Clear
                    </Button>
                    <Button
                      variant="primary"
                      disabled={!amountOk(depositAmount)}
                      onClick={() => onDeposit && onDeposit(depositAmount)}
                      className="btn-animate"
                      style={{ background: 'var(--blue-600)', color: '#fff' }}
                    >
                      <FaPlusCircle style={{ marginRight: 8 }} /> Deposit
                    </Button>
                  </div>
                </div>
              </Card>

              {/* Purchase */}
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
                    // style={{ height: 44 }}
                  />
                  <label className="text-sm text-gray-700">Merchant</label>
                  <Input
                    placeholder="e.g., Walgreens"
                    aria-label="Merchant name"
                    value={purchaseMerchant}
                    onChange={(e) => setPurchaseMerchant(e.target.value)}
                    // style={{ height: 44 }}
                  />
                  <label className="text-sm text-gray-700">Category code (MCC)</label>
                  <Input
                    placeholder="Use a 4-digit MCC such as 5912 (Pharmacy) or 8062 (Doctor)"
                    aria-label="Merchant category code"
                    value={purchaseCategory}
                    onChange={(e) => setPurchaseCategory(e.target.value)}
                    // style={{ height: 44 }}
                  />
                  <div className="flex items-center justify-end gap-4">
                    <Button
                      variant="ghost"
                      className="btn-animate"
                      onClick={() => {
                        setPurchaseAmount('');
                        setPurchaseMerchant('');
                        setPurchaseCategory('');
                      }}
                    >
                      Clear
                    </Button>
                    <Button
                      variant="primary"
                      disabled={!purchaseOk || !card}
                      title={!card ? 'Issue a card first' : undefined}
                      onClick={() =>
                        onPurchase &&
                        onPurchase(
                          purchaseAmount,
                          purchaseMerchant.trim(),
                          purchaseCategory.trim()
                        )
                      }
                      className="btn-animate"
                      style={{ background: 'var(--blue-600)', color: '#fff' }}
                    >
                      <FaStore style={{ marginRight: 8 }} /> Submit
                    </Button>
                  </div>
                </div>
              </Card>
            </div>

            {/* Virtual Card — stacked */}
            <Card title="Virtual Card" subtitle="Create or view your card" hover>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div
                    className="rounded-xl flex items-center justify-center"
                    style={{ width: 40, height: 40, background: 'var(--blue-100)', color: 'var(--blue-600)' }}
                  >
                    <FaCreditCard size={18} />
                  </div>
                  <div className="text-sm text-gray-700">
                    {card?.last4 ? (
                      <>Card {maskedLast4(card.last4)} • linked to current balance</>
                    ) : (
                      <>No card issued yet</>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Button
                    variant={card?.last4 ? 'outline' : 'primary'}
                    onClick={() => onIssueCard && onIssueCard()}
                    className="btn-animate"
                    style={card?.last4 ? undefined : { background: 'var(--blue-600)', color: '#fff' }}
                  >
                    {card?.last4 ? 'Reissue / Replace' : 'Issue Card'}
                  </Button>
                  <Button variant="ghost" onClick={onRefresh}>
                    <FaSyncAlt style={{ marginRight: 8 }} /> Refresh
                  </Button>
                </div>
              </div>
            </Card>
          </div>

          {/* RIGHT COLUMN (sticky) */}
          <div className="space-y-6" style={{ position: 'sticky', top: '1.5rem' }}>
            <Card
              title={
                <span className="flex items-center gap-2">
                  <MdHistory /> Recent Transactions
                </span>
              }
              subtitle="Latest account activity"
              hover
            >
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
                            className="rounded-full flex items-center justify-center"
                            style={{
                              width: 40,
                              height: 40,
                              background: 'var(--blue-100)',
                              color: 'var(--blue-600)',
                            }}
                            aria-hidden="true"
                          >
                            {isDeposit ? <FaPlusCircle /> : <FaShoppingBag />}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">
                              {isDeposit ? 'Deposit' : tx.merchant || 'Purchase'}
                            </div>
                            <div className="text-xs text-gray-500">{prettyDate(tx.created_at)}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-blue-600">
                            {isDeposit ? '+' : '-'}
                            {fmt(tx.amount_cents)}
                          </div>
                          <Badge variant={statusVariant(tx.status)} size="sm">
                            {tx.status}
                          </Badge>
                        </div>
                      </div>
                    );
                  })
                )}

                <div className="flex items-center justify-end pt-2">
                  <Button variant="ghost" size="sm" onClick={onRefresh}>
                    <FaSyncAlt style={{ marginRight: 6 }} />
                    Refresh
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
