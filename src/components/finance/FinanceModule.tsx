"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "../../lib/auth-context";
import {
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  RefreshCw,
  PlusCircle,
  Calendar,
  Filter,
  CheckSquare,
  Trash2,
  PieChart,
  TrendingUp,
  Award
} from "lucide-react";

type TabType = "dashboard" | "transactions" | "mymoney" | "budgets" | "categories";

export default function FinanceModule() {
  const { addXP, gainStatPoints } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>("dashboard");

  // Local state synced with localStorage
  const [accounts, setAccounts] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [budgets, setBudgets] = useState<any[]>([]);
  const [investments, setInvestments] = useState<any[]>([]);
  const [recurring, setRecurring] = useState<any[]>([]);
  const [savingsBuckets, setSavingsBuckets] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);

  const [selectedMonth, setSelectedMonth] = useState("2026-06");

  // On mount, load from localStorage
  useEffect(() => {
    const storedAccounts = localStorage.getItem("atlas.finance.accounts");
    const storedTx = localStorage.getItem("atlas.finance.transactions");
    const storedBudgets = localStorage.getItem("atlas.finance.budgets");
    const storedInvest = localStorage.getItem("atlas.finance.investments");
    const storedRecurring = localStorage.getItem("atlas.finance.recurring");
    const storedBuckets = localStorage.getItem("atlas.finance.savingsBuckets");

    const defaultCategories = [
      { id: "cat-1", name: "💰 Salary", kind: "income" },
      { id: "cat-2", name: "🏠 Home", kind: "expense" },
      { id: "cat-3", name: "⛽ Fuel", kind: "expense" },
      { id: "cat-4", name: "📈 Investments", kind: "expense" },
      { id: "cat-5", name: "🔁 Subscriptions", kind: "expense" },
      { id: "cat-6", name: "✂️ EMIs", kind: "expense" },
      { id: "cat-7", name: "👤 Me", kind: "expense" },
      { id: "cat-8", name: "🧾 Lent", kind: "expense" },
      { id: "cat-9", name: "💳 Surplus", kind: "expense" }
    ];

    if (storedAccounts) setAccounts(JSON.parse(storedAccounts));
    if (storedTx) setTransactions(JSON.parse(storedTx));
    if (storedBudgets) setBudgets(JSON.parse(storedBudgets));
    if (storedInvest) setInvestments(JSON.parse(storedInvest));
    if (storedRecurring) setRecurring(JSON.parse(storedRecurring));
    if (storedBuckets) setSavingsBuckets(JSON.parse(storedBuckets));
    setCategories(defaultCategories);
  }, []);

  // Sync methods
  const saveAccounts = (data: any[]) => {
    setAccounts(data);
    localStorage.setItem("atlas.finance.accounts", JSON.stringify(data));
  };
  const saveTransactions = (data: any[]) => {
    setTransactions(data);
    localStorage.setItem("atlas.finance.transactions", JSON.stringify(data));
  };
  const saveBudgets = (data: any[]) => {
    setBudgets(data);
    localStorage.setItem("atlas.finance.budgets", JSON.stringify(data));
  };
  const saveInvestments = (data: any[]) => {
    setInvestments(data);
    localStorage.setItem("atlas.finance.investments", JSON.stringify(data));
  };
  const saveSavingsBuckets = (data: any[]) => {
    setSavingsBuckets(data);
    localStorage.setItem("atlas.finance.savingsBuckets", JSON.stringify(data));
  };

  // Indian Rupee formatting helper
  const formatRupee = (num: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0
    }).format(num);
  };

  // TRANSACTION FILTER & BULK DELETIONS
  const [filterType, setFilterType] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterAccount, setFilterAccount] = useState("all");
  const [selectedTxIds, setSelectedTxIds] = useState<Set<string>>(new Set());

  // TRANSACTION ADD FORM STATE
  const [txType, setTxType] = useState<"income" | "expense" | "transfer">("expense");
  const [txAmount, setTxAmount] = useState(1500);
  const [txDate, setTxDate] = useState(new Date().toISOString().split("T")[0]);
  const [txCategory, setTxCategory] = useState("🏠 Home");
  const [txAccountId, setTxAccountId] = useState("");
  const [txFromAccountId, setTxFromAccountId] = useState("");
  const [txToAccountId, setTxToAccountId] = useState("");
  const [txNote, setTxNote] = useState("");

  const handleAddTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (txAmount <= 0) {
      alert("Amount must be greater than 0");
      return;
    }

    const newTxId = `tx-${Date.now()}`;
    let sourceAcc = accounts.find(a => a.id === txAccountId);
    let fromAcc = accounts.find(a => a.id === txFromAccountId);
    let toAcc = accounts.find(a => a.id === txToAccountId);

    const updatedAccounts = accounts.map((acc) => {
      if (txType === "income" && acc.id === txAccountId) {
        return { ...acc, balance: acc.balance + txAmount };
      }
      if (txType === "expense" && acc.id === txAccountId) {
        return { ...acc, balance: acc.balance - txAmount };
      }
      if (txType === "transfer") {
        if (acc.id === txFromAccountId) return { ...acc, balance: acc.balance - txAmount };
        if (acc.id === txToAccountId) return { ...acc, balance: acc.balance + txAmount };
      }
      return acc;
    });

    const newTx = {
      id: newTxId,
      type: txType,
      amount: txAmount,
      date: txDate,
      note: txNote,
      accountId: txType !== "transfer" ? txAccountId : null,
      accountName: txType !== "transfer" ? (sourceAcc?.name || "") : null,
      category: txType !== "transfer" ? txCategory : "Transfer",
      fromAccountId: txType === "transfer" ? txFromAccountId : null,
      toAccountId: txType === "transfer" ? txToAccountId : null,
      fromAccountName: txType === "transfer" ? (fromAcc?.name || "") : null,
      toAccountName: txType === "transfer" ? (toAcc?.name || "") : null,
      createdAt: Date.now()
    };

    saveAccounts(updatedAccounts);
    saveTransactions([newTx, ...transactions]);

    // Finance action logic doesn't grant core leveling XP by design,
    // but rewards consistency in financial updates (25 XP)
    addXP(25, "Synchronized financial ledger");
    gainStatPoints({ discipline: 1 });

    alert("Transaction added! +25 XP awarded.");

    // reset fields
    setTxAmount(0);
    setTxNote("");
  };

  const handleBulkDelete = () => {
    if (selectedTxIds.size === 0) return;
    const nextTx = transactions.filter(t => !selectedTxIds.has(t.id));
    saveTransactions(nextTx);
    setSelectedTxIds(new Set());
    alert("Selected transactions removed.");
  };

  const toggleSelectTx = (id: string) => {
    const next = new Set(selectedTxIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedTxIds(next);
  };

  // DASHBOARD CALCULATIONS FOR SELECTED MONTH
  const getFilteredMonthTransactions = () => {
    return transactions.filter(t => t.date.startsWith(selectedMonth));
  };

  const monthTx = getFilteredMonthTransactions();
  const monthIncome = monthTx.filter(t => t.type === "income").reduce((acc, t) => acc + t.amount, 0);
  const monthExpense = monthTx.filter(t => t.type === "expense").reduce((acc, t) => acc + t.amount, 0);
  const monthNet = monthIncome - monthExpense;
  const totalBalance = accounts.reduce((acc, a) => acc + a.balance, 0);

  // ACCOUNT ADD FORM STATE
  const [newAccName, setNewAccName] = useState("");
  const [newAccType, setNewAccType] = useState<"savings" | "credit" | "cash">("savings");
  const [newAccBal, setNewAccBal] = useState(1000);

  const handleAddAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAccName) return;

    const newAcc = {
      id: `acc-${Date.now()}`,
      name: newAccName,
      type: newAccType,
      balance: newAccBal,
      openingBalance: newAccBal,
      createdAt: Date.now()
    };

    saveAccounts([...accounts, newAcc]);
    setNewAccName("");
    alert("Account created.");
  };

  // SAVINGS BUCKET ADD STATE
  const [newBucketName, setNewBucketName] = useState("");
  const handleAddBucket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBucketName) return;
    const newBucket = {
      id: `bucket-${Date.now()}`,
      name: newBucketName,
      isDefault: false,
      createdAt: Date.now()
    };
    saveSavingsBuckets([...savingsBuckets, newBucket]);
    setNewBucketName("");
    alert("Savings bucket created.");
  };

  return (
    <div className="space-y-6">
      
      {/* Sub tabs */}
      <div className="flex border-b border-zinc-900 overflow-x-auto gap-2.5 pb-0.5">
        {(["dashboard", "transactions", "mymoney", "budgets", "categories"] as TabType[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2.5 text-xs font-mono font-bold uppercase tracking-wider border-b-2 transition-all whitespace-nowrap ${
              activeTab === tab
                ? "border-violet-500 text-violet-400"
                : "border-transparent text-zinc-500 hover:text-zinc-300"
            }`}
          >
            {tab === "mymoney" ? "My Money" : tab}
          </button>
        ))}
      </div>

      {activeTab === "dashboard" && (
        <div className="space-y-6">
          
          {/* Month Selector & Net calculations banner */}
          <div className="flex justify-between items-center bg-zinc-950/40 border border-zinc-900 rounded-2xl p-4">
            <span className="text-xs font-mono text-zinc-500 uppercase">Selected Cashflow Month</span>
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  const [y, m] = selectedMonth.split("-").map(Number);
                  const prevDate = new Date(y, m - 2, 1);
                  setSelectedMonth(`${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, "0")}`);
                }}
                className="p-1 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 rounded"
              >
                &lsaquo;
              </button>
              <span className="font-mono text-sm font-bold text-zinc-200">{selectedMonth}</span>
              <button
                onClick={() => {
                  const [y, m] = selectedMonth.split("-").map(Number);
                  const nextDate = new Date(y, m, 1);
                  setSelectedMonth(`${nextDate.getFullYear()}-${String(nextDate.getMonth() + 1).padStart(2, "0")}`);
                }}
                className="p-1 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 rounded"
              >
                &rsaquo;
              </button>
            </div>
          </div>

          {/* Money Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="bg-zinc-950/60 border border-zinc-900 rounded-2xl p-5 backdrop-blur">
              <span className="text-[10px] font-mono text-zinc-500 uppercase block">Income</span>
              <span className="text-xl font-bold text-emerald-400 block mt-2 font-mono">{formatRupee(monthIncome)}</span>
            </div>
            <div className="bg-zinc-950/60 border border-zinc-900 rounded-2xl p-5 backdrop-blur">
              <span className="text-[10px] font-mono text-zinc-500 uppercase block">Expenses</span>
              <span className="text-xl font-bold text-rose-400 block mt-2 font-mono">{formatRupee(monthExpense)}</span>
            </div>
            <div className="bg-zinc-950/60 border border-zinc-900 rounded-2xl p-5 backdrop-blur">
              <span className="text-[10px] font-mono text-zinc-500 uppercase block">Net Savings</span>
              <span className={`text-xl font-bold block mt-2 font-mono ${monthNet >= 0 ? "text-violet-400" : "text-red-500"}`}>
                {formatRupee(monthNet)}
              </span>
            </div>
            <div className="bg-zinc-950/60 border border-zinc-900 rounded-2xl p-5 backdrop-blur font-bold bg-gradient-to-tr from-violet-950/15 to-transparent">
              <span className="text-[10px] font-mono text-zinc-400 uppercase block">Total Net Balance</span>
              <span className="text-xl text-zinc-100 block mt-2 font-mono">{formatRupee(totalBalance)}</span>
            </div>
          </div>

          {/* Budget progress bars */}
          <div className="bg-zinc-950/60 border border-zinc-900 rounded-2xl p-6 backdrop-blur space-y-4">
            <h3 className="text-xs font-bold text-zinc-100 uppercase tracking-wider font-mono">
              Monthly Budget Progress
            </h3>

            {budgets.length === 0 ? (
              <div className="py-6 text-center text-xs text-zinc-600 font-medium">
                No active monthly budgets configured.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {budgets.filter(b => b.month === selectedMonth).map((b) => {
                  const spent = monthTx
                    .filter(t => t.type === "expense" && t.category === b.category)
                    .reduce((acc, t) => acc + t.amount, 0);
                  const percent = Math.min(100, Math.round((spent / b.amount) * 100));

                  return (
                    <div key={b.id} className="bg-zinc-900/30 border border-zinc-900 rounded-xl p-4 space-y-2">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-semibold text-zinc-200">{b.category}</span>
                        <span className="text-zinc-500 font-mono">
                          {formatRupee(spent)} / {formatRupee(b.amount)}
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-zinc-900 rounded-full overflow-hidden border border-zinc-900">
                        <div
                          style={{ width: `${percent}%` }}
                          className={`h-full rounded-full ${percent >= 90 ? "bg-red-500" : percent >= 70 ? "bg-amber-500" : "bg-violet-500"}`}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Recent ledger transactions */}
          <div className="bg-zinc-950/60 border border-zinc-900 rounded-2xl p-6 backdrop-blur space-y-4">
            <h3 className="text-xs font-bold text-zinc-100 uppercase tracking-wider font-mono">
              Recent Transactions
            </h3>

            <div className="space-y-2.5">
              {monthTx.slice(0, 5).map((t) => (
                <div key={t.id} className="flex justify-between items-center bg-zinc-900/20 border border-zinc-900 rounded-xl p-3.5">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${t.type === "income" ? "bg-emerald-500/10 text-emerald-400" : t.type === "expense" ? "bg-rose-500/10 text-rose-400" : "bg-zinc-800 text-zinc-400"}`}>
                      {t.type === "income" ? <ArrowDownLeft className="w-4 h-4" /> : t.type === "expense" ? <ArrowUpRight className="w-4 h-4" /> : <RefreshCw className="w-4 h-4" />}
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-zinc-200">{t.note || t.category}</span>
                      <span className="text-[10px] text-zinc-500 font-mono block mt-0.5">{t.date} · {t.accountName || `${t.fromAccountName} → ${t.toAccountName}`}</span>
                    </div>
                  </div>
                  <span className={`text-xs font-mono font-bold ${t.type === "income" ? "text-emerald-400" : t.type === "expense" ? "text-rose-400" : "text-zinc-400"}`}>
                    {t.type === "income" ? "+" : t.type === "expense" ? "-" : ""}{formatRupee(t.amount)}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {activeTab === "transactions" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left: Transaction History filter list */}
          <div className="lg:col-span-2 bg-zinc-950/60 border border-zinc-900 rounded-2xl p-6 backdrop-blur space-y-4">
            <div className="flex justify-between items-center border-b border-zinc-900 pb-4">
              <h3 className="text-xs font-bold text-zinc-100 uppercase tracking-wider font-mono">
                Transaction Ledger
              </h3>
              <div className="flex gap-2">
                <button
                  disabled={selectedTxIds.size === 0}
                  onClick={handleBulkDelete}
                  className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 rounded-lg text-[10px] font-mono font-bold disabled:opacity-40 transition-colors"
                >
                  Delete Selected ({selectedTxIds.size})
                </button>
              </div>
            </div>

            {/* List */}
            <div className="space-y-2.5 max-h-[420px] overflow-y-auto pr-2 scrollbar-thin">
              {transactions.map((t) => {
                const isSelected = selectedTxIds.has(t.id);
                return (
                  <div
                    key={t.id}
                    className={`flex justify-between items-center border rounded-xl p-3.5 transition-all ${
                      isSelected ? "bg-zinc-900/40 border-violet-500/30" : "bg-zinc-900/20 border-zinc-900 hover:border-zinc-800"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelectTx(t.id)}
                        className="w-4 h-4 rounded text-violet-600 bg-zinc-900 border-zinc-800 accent-violet-600 cursor-pointer"
                      />
                      <div className={`p-2 rounded-lg ${t.type === "income" ? "bg-emerald-500/10 text-emerald-400" : t.type === "expense" ? "bg-rose-500/10 text-rose-400" : "bg-zinc-800 text-zinc-400"}`}>
                        {t.type === "income" ? <ArrowDownLeft className="w-4 h-4" /> : t.type === "expense" ? <ArrowUpRight className="w-4 h-4" /> : <RefreshCw className="w-4 h-4" />}
                      </div>
                      <div>
                        <span className="text-xs font-semibold text-zinc-200">{t.note || t.category}</span>
                        <span className="text-[10px] text-zinc-500 font-mono block mt-0.5">
                          {t.date} · {t.accountName || `${t.fromAccountName} → ${t.toAccountName}`}
                        </span>
                      </div>
                    </div>
                    <span className={`text-xs font-mono font-bold ${t.type === "income" ? "text-emerald-400" : t.type === "expense" ? "text-rose-400" : "text-zinc-400"}`}>
                      {t.type === "income" ? "+" : t.type === "expense" ? "-" : ""}{formatRupee(t.amount)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right: Add transaction form */}
          <div className="bg-zinc-950/60 border border-zinc-900 rounded-2xl p-6 backdrop-blur h-fit">
            <h4 className="font-bold text-xs text-zinc-100 uppercase tracking-wider mb-4">
              Add Transaction
            </h4>
            <form onSubmit={handleAddTransaction} className="space-y-4">
              <div>
                <label className="block text-[10px] font-mono text-zinc-500 uppercase mb-2">Type</label>
                <div className="grid grid-cols-3 gap-2">
                  {(["expense", "income", "transfer"] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => {
                        setTxType(t);
                        setTxCategory(t === "income" ? "💰 Salary" : "🏠 Home");
                      }}
                      className={`py-1.5 rounded-lg text-[10px] font-mono font-bold uppercase border transition-all ${
                        txType === t
                          ? "bg-violet-600 border-violet-500 text-white"
                          : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-mono text-zinc-500 uppercase mb-2">Amount (₹)</label>
                <input
                  type="number"
                  value={txAmount}
                  onChange={(e) => setTxAmount(parseFloat(e.target.value) || 0)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs font-mono text-center"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono text-zinc-500 uppercase mb-2">Date</label>
                <input
                  type="date"
                  value={txDate}
                  onChange={(e) => setTxDate(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs font-mono text-center"
                />
              </div>

              {txType !== "transfer" ? (
                <>
                  <div>
                    <label className="block text-[10px] font-mono text-zinc-500 uppercase mb-2">Account</label>
                    <select
                      value={txAccountId}
                      onChange={(e) => setTxAccountId(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs focus:outline-none"
                    >
                      <option value="">Select Account</option>
                      {accounts.map((a) => (
                        <option key={a.id} value={a.id}>{a.name} (₹{a.balance})</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono text-zinc-500 uppercase mb-2">Category</label>
                    <select
                      value={txCategory}
                      onChange={(e) => setTxCategory(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs focus:outline-none"
                    >
                      {categories.filter(c => c.kind === txType).map((c) => (
                        <option key={c.id} value={c.name}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                </>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-mono text-zinc-500 uppercase mb-2">From</label>
                    <select
                      value={txFromAccountId}
                      onChange={(e) => setTxFromAccountId(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2 py-2 text-xs focus:outline-none"
                    >
                      <option value="">Select</option>
                      {accounts.map((a) => (
                        <option key={a.id} value={a.id}>{a.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono text-zinc-500 uppercase mb-2">To</label>
                    <select
                      value={txToAccountId}
                      onChange={(e) => setTxToAccountId(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2 py-2 text-xs focus:outline-none"
                    >
                      <option value="">Select</option>
                      {accounts.map((a) => (
                        <option key={a.id} value={a.id}>{a.name}</option>
                      ))}
                      {/* Allow transfer to savings buckets */}
                      {savingsBuckets.map((b) => (
                        <option key={b.id} value={b.id}>{b.name} (Bucket)</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-[10px] font-mono text-zinc-500 uppercase mb-2">Note / Description</label>
                <input
                  type="text"
                  placeholder="Netflix, Groceries, etc."
                  value={txNote}
                  onChange={(e) => setTxNote(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs placeholder:text-zinc-700 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-violet-600 hover:bg-violet-500 text-white rounded-lg text-xs font-bold transition-all shadow-md"
              >
                Log Transaction
              </button>
            </form>
          </div>

        </div>
      )}

      {activeTab === "mymoney" && (
        <div className="space-y-8">
          
          {/* Accounts & Buckets */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Accounts Panel */}
            <div className="bg-zinc-950/60 border border-zinc-900 rounded-2xl p-6 backdrop-blur space-y-4">
              <div className="flex justify-between items-center border-b border-zinc-900 pb-3">
                <h3 className="text-xs font-bold text-zinc-100 uppercase tracking-wider font-mono">
                  Monetary Accounts
                </h3>
              </div>

              <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
                {accounts.map((acc) => (
                  <div key={acc.id} className="flex justify-between items-center bg-zinc-900/20 border border-zinc-900 rounded-xl p-3.5">
                    <div>
                      <span className="text-xs font-semibold text-zinc-200">{acc.name}</span>
                      <span className="text-[10px] text-zinc-500 font-mono block mt-0.5 uppercase">{acc.type}</span>
                    </div>
                    <span className="text-xs font-mono font-bold text-zinc-100">
                      {formatRupee(acc.balance)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Add Account Inline Form */}
              <form onSubmit={handleAddAccount} className="border-t border-zinc-900 pt-4 flex gap-2">
                <input
                  type="text"
                  placeholder="Acc Name"
                  value={newAccName}
                  onChange={(e) => setNewAccName(e.target.value)}
                  className="flex-1 bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs placeholder:text-zinc-700"
                />
                <select
                  value={newAccType}
                  onChange={(e) => setNewAccType(e.target.value as any)}
                  className="bg-zinc-900 border border-zinc-800 rounded-lg px-2 py-1.5 text-xs text-zinc-400"
                >
                  <option value="savings">Savings</option>
                  <option value="credit">Credit</option>
                  <option value="cash">Cash</option>
                </select>
                <input
                  type="number"
                  placeholder="Balance"
                  value={newAccBal}
                  onChange={(e) => setNewAccBal(parseFloat(e.target.value) || 0)}
                  className="w-16 bg-zinc-900 border border-zinc-800 rounded-lg px-1 py-1.5 text-xs text-center font-mono"
                />
                <button
                  type="submit"
                  className="p-1.5 bg-violet-600 hover:bg-violet-500 text-white rounded-lg flex items-center justify-center"
                >
                  +
                </button>
              </form>
            </div>

            {/* Savings Buckets */}
            <div className="bg-zinc-950/60 border border-zinc-900 rounded-2xl p-6 backdrop-blur space-y-4">
              <div className="flex justify-between items-center border-b border-zinc-900 pb-3">
                <h3 className="text-xs font-bold text-zinc-100 uppercase tracking-wider font-mono">
                  Savings Buckets (Target Allocation)
                </h3>
              </div>

              <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
                {savingsBuckets.map((bucket) => {
                  // Calculate balance allocated to this bucket based on transfers
                  const bucketBalance = transactions
                    .filter(t => t.type === "transfer" && t.toAccountId === bucket.id)
                    .reduce((acc, t) => acc + t.amount, 0);

                  return (
                    <div key={bucket.id} className="flex justify-between items-center bg-zinc-900/20 border border-zinc-900 rounded-xl p-3.5">
                      <span className="text-xs font-semibold text-zinc-200">{bucket.name}</span>
                      <span className="text-xs font-mono font-bold text-violet-400">
                        {formatRupee(bucketBalance)}
                      </span>
                    </div>
                  );
                })}
              </div>

              <form onSubmit={handleAddBucket} className="border-t border-zinc-900 pt-4 flex gap-2">
                <input
                  type="text"
                  placeholder="New Bucket (e.g. Goa Trip)"
                  value={newBucketName}
                  onChange={(e) => setNewBucketName(e.target.value)}
                  className="flex-1 bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs placeholder:text-zinc-700"
                />
                <button
                  type="submit"
                  className="p-1.5 bg-violet-600 hover:bg-violet-500 text-white rounded-lg flex items-center justify-center font-bold"
                >
                  Create Bucket
                </button>
              </form>
            </div>

          </div>

          {/* Investments Portfolio (preserves silverbees, pf, mutual funds) */}
          <div className="bg-zinc-950/60 border border-zinc-900 rounded-2xl p-6 backdrop-blur space-y-4">
            <h3 className="text-xs font-bold text-zinc-100 uppercase tracking-wider font-mono">
              Investment Assets Portfolio
            </h3>

            {investments.length === 0 ? (
              <div className="py-6 text-center text-xs text-zinc-600 font-medium">
                No active investment positions logged.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {investments.map((inv) => {
                  const gain = inv.current - inv.invested;
                  const gainPercent = inv.invested > 0 ? parseFloat(((gain / inv.invested) * 100).toFixed(2)) : 0;
                  const isGain = gain >= 0;

                  return (
                    <div key={inv.id} className="bg-zinc-900/30 border border-zinc-900 rounded-xl p-4 space-y-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-xs font-bold text-zinc-200 block">{inv.name}</span>
                          <span className="text-[9px] font-mono text-zinc-500 uppercase mt-0.5">{inv.type}</span>
                        </div>
                        <span className={`text-[10px] font-mono font-bold ${isGain ? "text-emerald-400" : "text-rose-500"}`}>
                          {isGain ? "▲" : "▼"} {Math.abs(gainPercent)}%
                        </span>
                      </div>
                      
                      <div className="flex justify-between items-center text-[10px] text-zinc-400 border-t border-zinc-900/60 pt-2 font-mono">
                        <span>Invested: {formatRupee(inv.invested)}</span>
                        <span className="text-zinc-100 font-semibold">Val: {formatRupee(inv.current)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>
      )}

      {activeTab === "budgets" && (
        <div className="bg-zinc-950/60 border border-zinc-900 rounded-2xl p-6 backdrop-blur space-y-4">
          <h3 className="text-xs font-bold text-zinc-100 uppercase tracking-wider font-mono mb-4">
            Manage Category Budgets
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {budgets.filter(b => b.month === selectedMonth).map((b) => (
              <div key={b.id} className="bg-zinc-900/30 border border-zinc-900 rounded-xl p-4 flex items-center justify-between">
                <span className="text-xs font-semibold text-zinc-200">{b.category}</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-zinc-500 font-mono">₹</span>
                  <input
                    type="number"
                    value={b.amount}
                    onChange={(e) => {
                      const nextVal = parseFloat(e.target.value) || 0;
                      const nextBudgets = budgets.map(x => x.id === b.id ? { ...x, amount: nextVal } : x);
                      saveBudgets(nextBudgets);
                    }}
                    className="w-24 bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1 text-xs text-right font-mono"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === "categories" && (
        <div className="bg-zinc-950/60 border border-zinc-900 rounded-2xl p-6 backdrop-blur space-y-4">
          <h3 className="text-xs font-bold text-zinc-100 uppercase tracking-wider font-mono">
            Transaction Categories
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {categories.map((c) => (
              <div key={c.id} className="p-3 bg-zinc-900/30 border border-zinc-900 rounded-xl text-center">
                <span className="text-xs font-bold text-zinc-200 block">{c.name}</span>
                <span className="text-[9px] font-mono text-zinc-500 uppercase mt-1 block">{c.kind}</span>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
