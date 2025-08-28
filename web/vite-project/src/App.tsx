import { useEffect, useState } from "react";
import { api, toCents, fmt } from "./api";
import { Dashboard } from "./pages/Dashboard";
import { Modal } from "./components/Modal";
import { Register } from "./pages/Register.tsx";
import { Landing } from "./pages/Landing.tsx";

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

  // Modal state (explicit open + content)
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState<string | undefined>(undefined);
  const [modalDesc, setModalDesc] = useState<string | undefined>(undefined);
  const [modalTone, setModalTone] = useState<"info" | "success" | "error">("info");

  const openModal = (title: string, description: string, tone: "info" | "success" | "error" = "info") => {
    setModalTitle(title);
    setModalDesc(description);
    setModalTone(tone);
    setModalOpen(true);
  };

  // Derive modal open from message/error as a safety net
  useEffect(() => {
    if (message) {
      setModalTitle("Success");
      setModalDesc(message);
      setModalTone("success");
      setModalOpen(true);
    }
  }, [message]);

  useEffect(() => {
    if (error) {
      setModalTitle("Something went wrong");
      setModalDesc(error);
      setModalTone("error");
      setModalOpen(true);
    }
  }, [error]);

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
      const msg = `Welcome! Your HSA account has been created successfully.`;
      setMessage(msg);
      openModal("Account created", msg, "success");
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
      const msg = `Deposit successful. New balance: ${fmt(data.new_balance_cents)}.`;
      setMessage(msg);
      openModal("Deposit successful", msg, "success");
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
      const msg = `Virtual card issued successfully. Card ending in ${data.card.last4}.`;
      setMessage(msg);
      openModal("Card issued", msg, "success");
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
        const msg = `Purchase approved. Amount ${fmt(data.transaction.amount_cents)} at ${merchant}. Tx #${data.transaction.id}.`;
        setMessage(msg);
        openModal("Purchase approved", msg, "success");
      } else {
        const err = `Purchase declined (${data.transaction.decline_reason || "Unknown reason"}). Amount ${fmt(data.transaction.amount_cents)} at ${merchant}.`;
        setError(err);
        openModal("Purchase declined", err, "error");
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

      {/* Global Action Feedback Modal */}
      <Modal
        open={modalOpen}
        tone={modalTone}
        title={modalTitle}
        description={modalDesc}
        onClose={() => setModalOpen(false)}
      />
    </div>
  );
}

export default App;
