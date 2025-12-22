import { computed } from 'vue';

type NotificationType = 'success' | 'warning' | 'info' | 'alert';
type WalletType = 'Cash' | 'Bank' | 'E-Wallet';
type TransactionType = 'expense' | 'income';
type DbWalletType = 'CASH' | 'BANK' | 'WALLET';
type DbCategoryType = 'INCOME' | 'EXPENSE';

interface UserInfo {
  id: string;
  email: string;
}

interface NotificationItem {
  id: number;
  title: string;
  message: string;
  time: string;
  type: NotificationType;
  read: boolean;
}

interface WalletItem {
  id: string;
  name: string;
  type: WalletType;
  balance: number;
  color: string;
  icon: string;
}

interface TransactionItem {
  id: string;
  title: string;
  category: string;
  categoryId: string;
  type: TransactionType;
  amount: number;
  date: string;
  createdAt: string;
  icon: string;
  wallet: string;
  walletId: string | null;
  note: string | null;
  quantity: number;
  pricePerUnit: number | null;
  promoType: string | null;
  promoValue: number | null;
  promoBuyX: number | null;
  promoGetY: number | null;
}

interface CategoryItem {
  id: string;
  name: string;
  type: TransactionType;
  icon: string;
}

interface CategoryStat {
  name: string;
  amount: number;
  percent: string;
  color: string;
  icon: string;
}

interface WalletFormState {
  name: string;
  type: WalletType;
  balance: string;
}

interface CategoryFormState {
  name: string;
  type: TransactionType;
  icon: string;
}

interface BootstrapPayload {
  user: UserInfo;
  wallets: Array<{
    id: string;
    name: string;
    type: DbWalletType;
    initialBalance: number;
    balance: number;
  }>;
  categories: Array<{
    id: string;
    name: string;
    type: DbCategoryType;
    icon?: string | null;
  }>;
  transactions: Array<{
    id: string;
    amount: number;
    date: string;
    createdAt: string;
    productName?: string | null;
    note?: string | null;
    quantity?: number | null;
    pricePerUnit?: number | null;
    promoType?: string | null;
    promoValue?: number | null;
    promoBuyX?: number | null;
    promoGetY?: number | null;
    category: {
      id: string;
      name: string;
      type: DbCategoryType;
      icon?: string | null;
    };
    wallet?: {
      id: string;
      name: string;
    } | null;
  }>;
}

const walletTypeMapToUi: Record<DbWalletType, WalletType> = {
  CASH: 'Cash',
  BANK: 'Bank',
  WALLET: 'E-Wallet',
};

const walletTypeMapToDb: Record<WalletType, DbWalletType> = {
  Cash: 'CASH',
  Bank: 'BANK',
  'E-Wallet': 'WALLET',
};

const resolveWalletMeta = (type: WalletType) => {
  if (type === 'Bank') return { color: 'bg-blue-600', icon: 'fa-landmark' };
  if (type === 'E-Wallet') return { color: 'bg-sky-400', icon: 'fa-mobile-screen-button' };
  return { color: 'bg-emerald-500', icon: 'fa-money-bill-wave' };
};

const resolveTransactionIcon = (category: string, type: TransactionType) => {
  const mapping: Record<string, string> = {
    Makanan: 'fa-mug-hot',
    Belanja: 'fa-shopping-bag',
    Transport: 'fa-car',
    Tagihan: 'fa-bolt',
    Hiburan: 'fa-film',
    Kesehatan: 'fa-heart',
    Gaji: 'fa-briefcase',
    Bonus: 'fa-gift',
    Investasi: 'fa-chart-line',
    Hadiah: 'fa-gift',
    Penjualan: 'fa-box-open',
    Lainnya: 'fa-coins',
  };

  if (mapping[category]) return mapping[category];
  return type === 'income' ? 'fa-briefcase' : 'fa-shopping-bag';
};

const getTodayString = () => new Date().toISOString().split('T')[0];

export const useMoneyManager = () => {
  const currentUser = useState<UserInfo | null>('mm-user', () => null);
  const bootstrapped = useState<boolean>('mm-bootstrapped', () => false);
  const bootstrapping = useState<boolean>('mm-bootstrapping', () => false);

  const displayName = computed(() => {
    const email = currentUser.value?.email || '';
    const [local = ''] = email.split('@');
    if (!local) return 'Dimas Pratama';
    return local.charAt(0).toUpperCase() + local.slice(1);
  });

  const displayEmail = computed(() => currentUser.value?.email || 'dimas@example.com');

  const initials = computed(() => {
    const parts = displayName.value.split(' ').filter(Boolean);
    if (parts.length === 0) return 'MM';
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  });

  const notificationStyles: Record<NotificationType, { icon: string; bg: string; color: string }> = {
    success: { icon: 'fa-check-circle', bg: 'bg-green-100', color: 'text-green-600' },
    warning: { icon: 'fa-triangle-exclamation', bg: 'bg-yellow-100', color: 'text-yellow-600' },
    alert: { icon: 'fa-shield-alt', bg: 'bg-red-100', color: 'text-red-600' },
    info: { icon: 'fa-info-circle', bg: 'bg-blue-100', color: 'text-blue-600' },
  };

  const notifications = useState<NotificationItem[]>('mm-notifications', () => [
    {
      id: 1,
      title: 'Gaji Masuk!',
      message: 'Pemasukan sebesar Rp8.500.000 telah tercatat.',
      time: 'Baru saja',
      type: 'success',
      read: false,
    },
    {
      id: 2,
      title: 'Tagihan Listrik',
      message: 'Jangan lupa bayar tagihan listrik sebelum tgl 20.',
      time: '1 jam yang lalu',
      type: 'warning',
      read: false,
    },
    {
      id: 3,
      title: 'Tips Hemat',
      message: 'Kurangi beli kopi di luar bisa hemat Rp500rb/bulan.',
      time: 'Kemarin',
      type: 'info',
      read: true,
    },
    {
      id: 4,
      title: 'Batas Pengeluaran',
      message: 'Anda hampir mencapai batas budget Makanan.',
      time: '2 hari lalu',
      type: 'alert',
      read: true,
    },
  ]);

  const wallets = useState<WalletItem[]>('mm-wallets', () => []);
  const expenseCategories = useState<CategoryItem[]>('mm-expenseCategories', () => []);
  const incomeCategories = useState<CategoryItem[]>('mm-incomeCategories', () => []);
  const transactions = useState<TransactionItem[]>('mm-transactions', () => []);
  const allCategories = computed(() => [...expenseCategories.value, ...incomeCategories.value]);

  const showAddModal = useState<boolean>('mm-showAddModal', () => false);
  const showWalletModal = useState<boolean>('mm-showWalletModal', () => false);
  const showCategoryModal = useState<boolean>('mm-showCategoryModal', () => false);
  const showDeleteWalletModal = useState<boolean>('mm-showDeleteWalletModal', () => false);
  const showDeleteCategoryModal = useState<boolean>('mm-showDeleteCategoryModal', () => false);

  const showNotifications = useState<boolean>('mm-showNotifications', () => false);
  const hasUnread = useState<boolean>('mm-hasUnread', () => true);

  const editingWallet = useState<WalletItem | null>('mm-editingWallet', () => null);
  const walletToDelete = useState<WalletItem | null>('mm-walletToDelete', () => null);
  const editingCategory = useState<CategoryItem | null>('mm-editingCategory', () => null);
  const categoryToDelete = useState<CategoryItem | null>('mm-categoryToDelete', () => null);

  const statsDate = useState<number>('mm-statsDate', () => {
    const now = new Date();
    now.setDate(1);
    return now.getTime();
  });

  const getInitialFormState = () => ({
    type: 'expense' as TransactionType,
    date: getTodayString(),
    productName: '',
    category: expenseCategories.value[0]?.id || '',
    quantity: 1,
    pricePerItem: '',
    hasPromo: false,
    promoType: 'percent',
    promoValue: '',
    buyX: 1,
    getY: 1,
    sourceWallet: wallets.value[0]?.id || '',
    destWallet: wallets.value[0]?.id || '',
    incomeAmount: '',
    notes: '',
    totalAmount: 0,
  });

  type FormState = ReturnType<typeof getInitialFormState>;

  const formData = useState<FormState>('mm-formData', () => getInitialFormState());

  const walletFormData = useState<WalletFormState>('mm-walletFormData', () => ({
    name: '',
    type: 'Cash',
    balance: '',
  }));

  const categoryForm = useState<CategoryFormState>('mm-categoryForm', () => ({
    name: '',
    type: 'expense',
    icon: 'fa-tag',
  }));

  const resetTransactionForm = () => {
    Object.assign(formData.value, getInitialFormState());
  };

  const resetWalletForm = () => {
    walletFormData.value = { name: '', type: 'Cash', balance: '' };
  };

  const formatRupiah = (number: number) =>
    new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(number);

  const formatShortRupiah = (number: number) => {
    const abs = Math.abs(number);
    if (abs >= 1000000) return `${(number / 1000000).toFixed(1)}jt`;
    if (abs >= 1000) return `${(number / 1000).toFixed(0)}rb`;
    return number.toString();
  };

  const toggleNotifications = () => {
    showNotifications.value = !showNotifications.value;
    if (showNotifications.value) {
      hasUnread.value = false;
    }
  };

  const markAllNotificationsRead = () => {
    notifications.value = notifications.value.map((notif) => ({ ...notif, read: true }));
    hasUnread.value = false;
  };

  const handleApiError = (error: any, fallback: string) => {
    const message =
      error?.data?.statusMessage ||
      error?.data?.message ||
      error?.message ||
      fallback;
    if (typeof window !== 'undefined') {
      alert(message);
    }
  };

  const fetchBootstrap = async () => {
    const headers = process.server ? useRequestHeaders(['cookie']) : undefined;
    const data = await $fetch<BootstrapPayload>('/api/bootstrap', { headers });

    currentUser.value = data.user;

    const categoryItems = (data.categories || []).map((cat) => ({
      id: cat.id,
      name: cat.name,
      type: cat.type === 'INCOME' ? 'income' : 'expense',
      icon: cat.icon || 'fa-tag',
    }));

    expenseCategories.value = categoryItems.filter((cat) => cat.type === 'expense');
    incomeCategories.value = categoryItems.filter((cat) => cat.type === 'income');

    wallets.value = (data.wallets || []).map((wallet) => {
      const uiType = walletTypeMapToUi[wallet.type] || 'Cash';
      const meta = resolveWalletMeta(uiType);
      return {
        id: wallet.id,
        name: wallet.name,
        type: uiType,
        balance: Number(wallet.balance || 0),
        color: meta.color,
        icon: meta.icon,
      };
    });

    transactions.value = (data.transactions || []).map((tx) => {
      const txType: TransactionType = tx.category.type === 'INCOME' ? 'income' : 'expense';
      const title = (tx.productName || tx.category.name || '').trim() || tx.category.name;
      const icon = tx.category.icon || resolveTransactionIcon(tx.category.name, txType);
      return {
        id: tx.id,
        title,
        category: tx.category.name,
        categoryId: tx.category.id,
        type: txType,
        amount: Number(tx.amount || 0),
        date: tx.date,
        createdAt: tx.createdAt || tx.date,
        icon,
        wallet: tx.wallet?.name || '-',
        walletId: tx.wallet?.id || null,
        note: tx.note || null,
        quantity: tx.quantity ?? 1,
        pricePerUnit: tx.pricePerUnit ?? null,
        promoType: tx.promoType ?? null,
        promoValue: tx.promoValue ?? null,
        promoBuyX: tx.promoBuyX ?? null,
        promoGetY: tx.promoGetY ?? null,
      };
    });

    bootstrapped.value = true;
  };

  const ensureLoaded = async () => {
    if (bootstrapped.value || bootstrapping.value) return;
    bootstrapping.value = true;
    try {
      await fetchBootstrap();
    } catch (error) {
      currentUser.value = null;
      wallets.value = [];
      expenseCategories.value = [];
      incomeCategories.value = [];
      transactions.value = [];
      bootstrapped.value = false;
    } finally {
      bootstrapping.value = false;
    }
  };

  const refreshData = async () => {
    bootstrapped.value = false;
    await ensureLoaded();
  };

  const clearData = () => {
    currentUser.value = null;
    wallets.value = [];
    expenseCategories.value = [];
    incomeCategories.value = [];
    transactions.value = [];
    bootstrapped.value = false;
  };

  const handleOpenAddWallet = () => {
    editingWallet.value = null;
    resetWalletForm();
    showWalletModal.value = true;
  };

  const handleOpenEditWallet = (wallet: WalletItem) => {
    editingWallet.value = wallet;
    walletFormData.value = {
      name: wallet.name,
      type: wallet.type,
      balance: '',
    };
    showWalletModal.value = true;
  };

  const handleSaveWallet = async () => {
    const name = walletFormData.value.name.trim();
    if (!name) return;

    const balanceValue = parseFloat(walletFormData.value.balance) || 0;

    try {
      if (editingWallet.value) {
        await $fetch(`/api/wallets/${editingWallet.value.id}`, {
          method: 'PUT',
          body: {
            name,
            type: walletTypeMapToDb[walletFormData.value.type],
            balanceAdjustment: balanceValue,
          },
        });
      } else {
        await $fetch('/api/wallets', {
          method: 'POST',
          body: {
            name,
            type: walletTypeMapToDb[walletFormData.value.type],
            initialBalance: balanceValue,
          },
        });
      }

      await refreshData();
      showWalletModal.value = false;
      editingWallet.value = null;
      resetWalletForm();
    } catch (error) {
      handleApiError(error, 'Gagal menyimpan dompet.');
    }
  };

  const requestDeleteWallet = (walletId?: string) => {
    const targetId = walletId || editingWallet.value?.id;
    if (!targetId) return;
    const target = wallets.value.find((item) => item.id === targetId) || editingWallet.value;
    if (!target) return;
    walletToDelete.value = target;
    showDeleteWalletModal.value = true;
  };

  const cancelDeleteWallet = () => {
    showDeleteWalletModal.value = false;
    walletToDelete.value = null;
  };

  const confirmDeleteWallet = async () => {
    const targetId = walletToDelete.value?.id;
    if (!targetId) return;

    try {
      await $fetch(`/api/wallets/${targetId}`, { method: 'DELETE' });
      showWalletModal.value = false;
      editingWallet.value = null;
      resetWalletForm();
      await refreshData();
    } catch (error) {
      handleApiError(error, 'Gagal menghapus dompet.');
    } finally {
      cancelDeleteWallet();
    }
  };

  const openCategoryModal = (type: TransactionType = 'expense') => {
    categoryForm.value.name = '';
    categoryForm.value.type = type;
    categoryForm.value.icon = 'fa-tag';
    editingCategory.value = null;
    showCategoryModal.value = true;
  };

  const handleOpenEditCategory = (category: CategoryItem) => {
    editingCategory.value = category;
    categoryForm.value.name = category.name;
    categoryForm.value.type = category.type;
    categoryForm.value.icon = category.icon || 'fa-tag';
    showCategoryModal.value = true;
  };

  const handleSaveCategory = async () => {
    const name = categoryForm.value.name.trim();
    if (!name) return;

    try {
      if (editingCategory.value) {
        await $fetch(`/api/categories/${editingCategory.value.id}`, {
          method: 'PUT',
          body: {
            name,
            type: categoryForm.value.type === 'expense' ? 'EXPENSE' : 'INCOME',
            icon: categoryForm.value.icon,
          },
        });
      } else {
        await $fetch('/api/categories', {
          method: 'POST',
          body: {
            name,
            type: categoryForm.value.type === 'expense' ? 'EXPENSE' : 'INCOME',
            icon: categoryForm.value.icon,
          },
        });
      }

      showCategoryModal.value = false;
      categoryForm.value = { name: '', type: 'expense', icon: 'fa-tag' };
      editingCategory.value = null;
      await refreshData();
    } catch (error) {
      handleApiError(error, 'Gagal menyimpan kategori.');
    }
  };

  const requestDeleteCategory = (categoryId?: string) => {
    const targetId = categoryId || editingCategory.value?.id;
    if (!targetId) return;
    const target =
      allCategories.value.find((item) => item.id === targetId) || editingCategory.value;
    if (!target) return;
    categoryToDelete.value = target;
    showDeleteCategoryModal.value = true;
  };

  const cancelDeleteCategory = () => {
    showDeleteCategoryModal.value = false;
    categoryToDelete.value = null;
  };

  const confirmDeleteCategory = async () => {
    const targetId = categoryToDelete.value?.id;
    if (!targetId) return;

    try {
      await $fetch(`/api/categories/${targetId}`, { method: 'DELETE' });
      await refreshData();
    } catch (error) {
      handleApiError(error, 'Gagal menghapus kategori.');
    } finally {
      cancelDeleteCategory();
    }
  };

  const handleSaveTransaction = async () => {
    const title = formData.value.productName.trim();
    if (!title || formData.value.totalAmount <= 0) {
      return;
    }

    const walletId =
      formData.value.type === 'expense' ? formData.value.sourceWallet : formData.value.destWallet;

    if (!formData.value.category || !walletId) return;
    if (formData.value.type === 'expense') {
      const wallet = wallets.value.find((item) => item.id === walletId);
      if (wallet && wallet.balance < formData.value.totalAmount) {
        return;
      }
    }

    let promoType: string | null = null;
    let promoValue: number | null = null;
    let promoBuyX: number | null = null;
    let promoGetY: number | null = null;

    if (formData.value.type === 'expense' && formData.value.hasPromo) {
      if (formData.value.promoType === 'percent') {
        promoType = 'PERCENT';
        promoValue = parseFloat(String(formData.value.promoValue)) || 0;
      } else if (formData.value.promoType === 'nominal') {
        promoType = 'FIXED';
        promoValue = parseFloat(String(formData.value.promoValue)) || 0;
      } else if (formData.value.promoType === 'buyXgetY') {
        promoType = 'BUY_X_GET_Y';
        promoBuyX = Math.max(0, Math.floor(parseFloat(String(formData.value.buyX)) || 0));
        promoGetY = Math.max(0, Math.floor(parseFloat(String(formData.value.getY)) || 0));
      }
    }

    const quantity = Math.max(1, Math.floor(parseFloat(String(formData.value.quantity)) || 1));
    const pricePerUnit = parseFloat(String(formData.value.pricePerItem)) || 0;

    try {
      await $fetch('/api/transactions', {
        method: 'POST',
        body: {
          categoryId: formData.value.category,
          walletId,
          amount: formData.value.totalAmount,
          date: formData.value.date,
          productName: title,
          note: formData.value.notes || null,
          quantity: formData.value.type === 'expense' ? quantity : 1,
          pricePerUnit: formData.value.type === 'expense' && pricePerUnit > 0 ? pricePerUnit : null,
          promoType,
          promoValue,
          promoBuyX,
          promoGetY,
        },
      });

      showAddModal.value = false;
      resetTransactionForm();
      await refreshData();
    } catch (error) {
      handleApiError(error, 'Gagal menyimpan transaksi.');
    }
  };

  const getWalletIncome = (walletId: string) =>
    transactions.value
      .filter((t) => t.walletId === walletId && t.amount > 0)
      .reduce((acc, curr) => acc + curr.amount, 0);

  const getWalletExpense = (walletId: string) =>
    transactions.value
      .filter((t) => t.walletId === walletId && t.amount < 0)
      .reduce((acc, curr) => acc + Math.abs(curr.amount), 0);

  const currentMonthTransactions = computed(() => {
    const now = new Date();
    return transactions.value.filter((t) => {
      const tDate = new Date(t.date);
      return tDate.getMonth() === now.getMonth() && tDate.getFullYear() === now.getFullYear();
    });
  });

  const currentMonthTransactionsSorted = computed(() =>
    [...currentMonthTransactions.value].sort(
      (a, b) => new Date(b.createdAt || b.date).getTime() - new Date(a.createdAt || a.date).getTime()
    )
  );

  const topTransactions = computed(() => currentMonthTransactionsSorted.value.slice(0, 5));

  const dashboardIncome = computed(() =>
    currentMonthTransactions.value
      .filter((t) => t.amount > 0)
      .reduce((acc, curr) => acc + curr.amount, 0)
  );

  const dashboardExpense = computed(() =>
    currentMonthTransactions.value
      .filter((t) => t.amount < 0)
      .reduce((acc, curr) => acc + Math.abs(curr.amount), 0)
  );

  const totalBalance = computed(() => wallets.value.reduce((acc, curr) => acc + curr.balance, 0));

  const weeklyChart = computed(() => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const data = [];
    for (let start = 1, index = 0; start <= daysInMonth; start += 7, index += 1) {
      const end = Math.min(start + 6, daysInMonth);
      data.push({
        week: index + 1,
        startDay: start,
        endDay: end,
        income: 0,
        expense: 0,
      });
    }

    currentMonthTransactions.value.forEach((t) => {
      const tDate = new Date(t.date);
      if (tDate.getMonth() === month && tDate.getFullYear() === year) {
        const day = tDate.getDate();
        const weekIndex = Math.floor((day - 1) / 7);
        const bucket = data[weekIndex];
        if (!bucket) return;
        if (t.type === 'income') {
          bucket.income += 1;
        } else {
          bucket.expense += 1;
        }
      }
    });

    const maxVal = Math.max(...data.map((d) => Math.max(d.income, d.expense)), 1);
    return { data, maxVal, daysInMonth };
  });

  const filteredTransactions = computed(() =>
    transactions.value.filter((t) => {
      const tDate = new Date(t.date);
      const stats = new Date(statsDate.value);
      return tDate.getMonth() === stats.getMonth() && tDate.getFullYear() === stats.getFullYear();
    })
  );

  const chartData = computed(() => {
    const stats = new Date(statsDate.value);
    const daysInMonth = new Date(stats.getFullYear(), stats.getMonth() + 1, 0).getDate();

    const data = Array.from({ length: daysInMonth }, (_, i) => ({
      day: i + 1,
      income: 0,
      expense: 0,
    }));

    filteredTransactions.value.forEach((t) => {
      const day = new Date(t.date).getDate();
      const bucket = data[day - 1];
      if (!bucket) return;
      const amount = Math.abs(Number(t.amount || 0));
      if (t.type === 'income') {
        bucket.income += amount;
      } else {
        bucket.expense += amount;
      }
    });

    const maxAmount = Math.max(...data.map((d) => Math.max(d.income, d.expense)), 0);
    return data.map((d) => ({
      ...d,
      incomeHeight: maxAmount === 0 ? '0%' : `${(d.income / maxAmount) * 100}%`,
      expenseHeight: maxAmount === 0 ? '0%' : `${(d.expense / maxAmount) * 100}%`,
      activeIncome: maxAmount > 0 && d.income === maxAmount,
      activeExpense: maxAmount > 0 && d.expense === maxAmount,
    }));
  });

  const condensedChartData = computed(() =>
    chartData.value.filter((_, i) => i % 4 === 0 || i === chartData.value.length - 1)
  );

  const expenseCategoryStats = computed<CategoryStat[]>(() => {
    const expenses = filteredTransactions.value.filter((t) => t.type === 'expense');
    const totalExp = expenses.reduce((acc, curr) => acc + Math.abs(curr.amount), 0);
    const catMap: Record<string, number> = {};
    const iconMap = new Map(
      [...expenseCategories.value, ...incomeCategories.value].map((cat) => [cat.name, cat.icon])
    );
    const colorMap: Record<string, string> = {
      Makanan: 'bg-lime-400',
      Belanja: 'bg-slate-900',
      Transport: 'bg-blue-500',
      Tagihan: 'bg-yellow-500',
      Hiburan: 'bg-pink-500',
      Kesehatan: 'bg-red-500',
      Lainnya: 'bg-gray-500',
    };

    expenses.forEach((t) => {
      catMap[t.category] = (catMap[t.category] || 0) + Math.abs(t.amount);
    });

    return Object.keys(catMap)
      .map((cat) => ({
        name: cat,
        amount: catMap[cat],
        percent: totalExp === 0 ? '0%' : `${Math.round((catMap[cat] / totalExp) * 100)}%`,
        color: colorMap[cat] || 'bg-blue-500',
        icon: iconMap.get(cat) || 'fa-tag',
      }))
      .sort((a, b) => b.amount - a.amount);
  });

  const incomeCategoryStats = computed<CategoryStat[]>(() => {
    const incomes = filteredTransactions.value.filter((t) => t.type === 'income');
    const totalInc = incomes.reduce((acc, curr) => acc + Math.abs(curr.amount), 0);
    const catMap: Record<string, number> = {};
    const iconMap = new Map(
      [...expenseCategories.value, ...incomeCategories.value].map((cat) => [cat.name, cat.icon])
    );
    const colorMap: Record<string, string> = {
      Gaji: 'bg-lime-400',
      Bonus: 'bg-yellow-400',
      Investasi: 'bg-blue-500',
      Hadiah: 'bg-pink-400',
      Penjualan: 'bg-slate-900',
      Lainnya: 'bg-gray-500',
    };

    incomes.forEach((t) => {
      catMap[t.category] = (catMap[t.category] || 0) + Math.abs(t.amount);
    });

    return Object.keys(catMap)
      .map((cat) => ({
        name: cat,
        amount: catMap[cat],
        percent: totalInc === 0 ? '0%' : `${Math.round((catMap[cat] / totalInc) * 100)}%`,
        color: colorMap[cat] || 'bg-lime-400',
        icon: iconMap.get(cat) || 'fa-tag',
      }))
      .sort((a, b) => b.amount - a.amount);
  });

  const totalMonthExpense = computed(() =>
    filteredTransactions.value
      .filter((t) => t.type === 'expense')
      .reduce((acc, curr) => acc + Math.abs(curr.amount), 0)
  );

  const totalMonthIncome = computed(() =>
    filteredTransactions.value
      .filter((t) => t.type === 'income')
      .reduce((acc, curr) => acc + Math.abs(curr.amount), 0)
  );

  const totalMonthNet = computed(() => totalMonthIncome.value - totalMonthExpense.value);

  const monthName = computed(() =>
    new Date(statsDate.value).toLocaleString('id-ID', { month: 'long', year: 'numeric' })
  );

  const monthInputValue = computed(() => {
    const stats = new Date(statsDate.value);
    const year = stats.getFullYear();
    const month = (stats.getMonth() + 1).toString().padStart(2, '0');
    return `${year}-${month}`;
  });

  const changeMonth = (direction: number) => {
    const newDate = new Date(statsDate.value);
    newDate.setMonth(newDate.getMonth() + direction);
    statsDate.value = newDate.getTime();
  };

  const handleDatePickerChange = (event: Event) => {
    const target = event.target as HTMLInputElement;
    if (!target.value) return;
    const [year, month] = target.value.split('-');
    statsDate.value = new Date(Number(year), Number(month) - 1, 1).getTime();
  };

  const handleDownloadExcel = () => {
    const filtered = filteredTransactions.value;
    if (filtered.length === 0) {
      alert('Tidak ada data.');
      return;
    }

    const headers = ['Tanggal', 'Judul', 'Kategori', 'Jumlah', 'Tipe', 'Dompet'];
    const csvContent = [
      headers.join(','),
      ...filtered.map((t) =>
        [
          t.date,
          `"${t.title}"`,
          t.category,
          t.amount,
          t.amount > 0 ? 'Pemasukan' : 'Pengeluaran',
          t.wallet || '-',
        ].join(',')
      ),
    ].join('\n');

    const link = document.createElement('a');
    link.href = URL.createObjectURL(new Blob([csvContent], { type: 'text/csv;charset=utf-8;' }));
    link.download = `Laporan_${new Date(statsDate.value).getFullYear()}_${new Date(statsDate.value).getMonth() + 1}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  const handleLogout = async () => {
    await $fetch('/api/auth/logout', { method: 'POST' });
    clearData();
    await navigateTo('/auth/login');
  };

  return {
    currentUser,
    displayName,
    displayEmail,
    initials,
    notifications,
    notificationStyles,
    wallets,
    expenseCategories,
    incomeCategories,
    transactions,
    showAddModal,
    showWalletModal,
    showCategoryModal,
    showDeleteWalletModal,
    showDeleteCategoryModal,
    showNotifications,
    hasUnread,
    editingWallet,
    walletToDelete,
    categoryToDelete,
    editingCategory,
    formData,
    walletFormData,
    categoryForm,
    statsDate,
    formatRupiah,
    formatShortRupiah,
    toggleNotifications,
    markAllNotificationsRead,
    ensureLoaded,
    refreshData,
    handleOpenAddWallet,
    handleOpenEditWallet,
    handleSaveWallet,
    requestDeleteWallet,
    confirmDeleteWallet,
    cancelDeleteWallet,
    openCategoryModal,
    handleOpenEditCategory,
    handleSaveCategory,
    requestDeleteCategory,
    confirmDeleteCategory,
    cancelDeleteCategory,
    handleSaveTransaction,
    getWalletIncome,
    getWalletExpense,
    changeMonth,
    handleDatePickerChange,
    handleDownloadExcel,
    handlePrint,
    handleLogout,
    resetTransactionForm,
    currentMonthTransactions,
    topTransactions,
    dashboardIncome,
    dashboardExpense,
    totalBalance,
    weeklyChart,
    filteredTransactions,
    chartData,
    condensedChartData,
    expenseCategoryStats,
    incomeCategoryStats,
    totalMonthExpense,
    totalMonthIncome,
    totalMonthNet,
    monthName,
    monthInputValue,
  };
};
