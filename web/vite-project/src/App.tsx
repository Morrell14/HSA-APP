import { useEffect, useState } from "react";
import { api, toCents, fmt } from "./api";
import { Dashboard } from "./pages/Dashboard";
import { Register } from "./pages/Register";
import { Landing } from "./pages/Landing";

type Account = { id: number; balance_cents: number; display_number: string };
type Tx = {
  id: number; type: "DEPOSIT" | "PURCHASE"; amount_cents: number;
  status: "APPROVED" | "DECLINED" | "SETTLED";
  eligible: 0 | 1 | null; decline_reason?: string | null;
  merchant?: string | null; category_code?: string | null; item_code?: string | null;
  note?: string | null; created_at: string;
};
type Card = { id: number; last4: string; expiry_month: number; expiry_year: number; status: string };

function App() {
  const [account, setAccount] = useState<Account | null>(null);
  const [transactions, setTransactions] = useState<Tx[]>([]);
  const [card, setCard] = useState<Card | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isRegistered, setIsRegistered] = useState(false);
  const [showLanding, setShowLanding] = useState(true);

  const clearMessages = () => {
    setMessage(null);
    setError(null);
  };

  const loadAccount = async (accountId: number) => {
    try {
      const { data } = await api.get<{ account: Account; transactions: Tx[] }>(`/accounts/${accountId}`);
      setAccount(data.account);
      setTransactions(data.transactions);
    } catch (e: any) {
      console.error("Failed to load account:", e);
    }
  };

  const createUser = async (name: string, email: string) => {
    setLoading(true);
    clearMessages();
    try {
      const { data } = await api.post<{ user: any; account: Account }>(`/users`, { name, email });
      setAccount(data.account);
      setIsRegistered(true);
      setShowLanding(false);
      setMessage(`Welcome! Your HSA account has been created successfully.`);
      // Always land on dashboard in single-view app
    } catch (e: any) {
      const errorMessage = e?.response?.data?.error;
      if (errorMessage?.includes("already exists")) {
        setError("An account with this email already exists. Please use a different email address.");
      } else if (errorMessage?.includes("invalid")) {
        setError("Please check your email format and try again.");
      } else {
        setError(errorMessage ?? "Failed to create account. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const makeDeposit = async (amount: string) => {
    if (!account) return;
    setLoading(true);
    clearMessages();
    const cents = toCents(amount);
    if (!Number.isFinite(cents) || cents <= 0) {
      setError("Please enter a valid positive amount");
      setLoading(false);
      return;
    }
    try {
      const { data } = await api.post(`/accounts/${account.id}/deposits`, {
        amount_cents: cents, note: "Deposit from UI"
      });
      setMessage(`Deposit successful! Your new balance is ${fmt(data.new_balance_cents)}`);
      await loadAccount(account.id);
    } catch (e: any) {
      setError(e?.response?.data?.error ?? "Deposit failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const issueCard = async () => {
    if (!account) return;
    setLoading(true);
    clearMessages();
    try {
      const { data } = await api.post<{ card: Card }>(`/accounts/${account.id}/cards`, {});
      setCard(data.card);
      setMessage(`Virtual card issued successfully! Card ending in ${data.card.last4}`);
    } catch (e: any) {
      setError(e?.response?.data?.error ?? "Failed to issue card. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const makePurchase = async (amount: string, merchant: string, category: string) => {
    if (!account || !card) return;
    setLoading(true);
    clearMessages();
    const cents = toCents(amount);
    if (!Number.isFinite(cents) || cents <= 0) {
      setError("Please enter a valid positive amount");
      setLoading(false);
      return;
    }
    try {
      const { data } = await api.post(`/accounts/${account.id}/purchases`, {
        amount_cents: cents,
        merchant,
        category_code: category,
        card_id: card.id
      });
      if (data.transaction.status === "APPROVED") {
        setMessage(`Purchase approved! Transaction ID: ${data.transaction.id}`);
      } else {
        setError(`Purchase declined: ${data.transaction.decline_reason || "Unknown reason"}`);
      }
      await loadAccount(account.id);
    } catch (e: any) {
      setError(e?.response?.data?.error ?? "Purchase failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGetStarted = () => {
    setShowLanding(false);
  };

  const handleBackToLanding = () => {
    setShowLanding(true);
    setIsRegistered(false);
    setAccount(null);
  };

  // Show landing page if user hasn't started yet
  if (showLanding) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <Landing onGetStarted={handleGetStarted} />
      </div>
    );
  }

  // Show registration page if user hasn't registered yet
  if (!isRegistered && !account) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <Register 
          onCreateAccount={createUser}
          onBackToLanding={handleBackToLanding}
          loading={loading}
          message={message}
          error={error}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-6xl mx-auto p-8">
        {message && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg animate-fadeIn">
            <div className="flex items-center">
              <svg className="h-5 w-5 text-green-400 mr-3" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <p className="text-sm text-green-800 font-medium">{message}</p>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg animate-fadeIn">
            <div className="flex items-center">
              <svg className="h-5 w-5 text-red-400 mr-3" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <p className="text-sm text-red-800 font-medium">{error}</p>
            </div>
          </div>
        )}

        <Dashboard 
          account={account}
          card={card}
          transactions={transactions}
          onRefresh={() => account && loadAccount(account.id)}
          onDeposit={makeDeposit}
          onIssueCard={issueCard}
          onPurchase={makePurchase}
        />
      </main>
    </div>
  );
}

export default App;
