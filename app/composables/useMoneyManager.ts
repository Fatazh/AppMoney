import { computed } from 'vue';

type NotificationType = 'success' | 'warning' | 'info' | 'alert';
type WalletType = 'Cash' | 'Bank' | 'E-Wallet';
type TransactionType = 'expense' | 'income';
type CurrencyCode = 'IDR' | 'USD';
type LanguageCode = 'id' | 'en';
type DbWalletType = 'CASH' | 'BANK' | 'WALLET';
type DbCategoryType = 'INCOME' | 'EXPENSE';
type FlashType = 'success' | 'error' | 'info';

interface UserInfo {
  id: string;
  email: string;
  name?: string | null;
  avatarUrl?: string | null;
  notificationsEnabled?: boolean | null;
  darkMode?: boolean | null;
  currency?: CurrencyCode | null;
  language?: LanguageCode | null;
}

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  type: NotificationType;
  read: boolean;
}

interface FlashMessage {
  id: number;
  type: FlashType;
  message: string;
}

interface WalletItem {
  id: string;
  name: string;
  type: WalletType;
  balance: number;
  color: string;
  icon: string;
  incomeTotal?: number;
  expenseTotal?: number;
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
  pending?: boolean;
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

interface ProfileFormState {
  name: string;
  avatarUrl: string | null;
}

interface PasswordFormState {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface UserPreferences {
  notificationsEnabled: boolean;
  darkMode: boolean;
  currency: CurrencyCode;
  language: LanguageCode;
}

interface ExchangeRatesState {
  base: string;
  rates: Record<string, number>;
  updatedAt: number;
}

interface AnalyticsSummary {
  income: number;
  expense: number;
  net: number;
}

interface WeeklyBucket {
  week: number;
  startDay: number;
  endDay: number;
  income: number;
  expense: number;
}

interface WeeklyChart {
  data: WeeklyBucket[];
  maxVal: number;
  daysInMonth: number;
}

interface BootstrapPayload {
  user: UserInfo;
  wallets: Array<{
    id: string;
    name: string;
    type: DbWalletType;
    initialBalance: number;
    balance: number;
    incomeTotal?: number;
    expenseTotal?: number;
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
  notifications: Array<{
    id: string;
    title: string;
    message: string;
    type: NotificationType;
    read: boolean;
    createdAt: string;
  }>;
}

type NotificationPayload = BootstrapPayload['notifications'][number];
type TransactionPayload = BootstrapPayload['transactions'][number];

interface OfflineTransactionPayload {
  id: string;
  createdAt: string;
  payload: {
    categoryId: string;
    walletId: string;
    amount: number;
    date: string;
    productName: string;
    note: string | null;
    quantity: number;
    pricePerUnit: number | null;
    promoType: string | null;
    promoValue: number | null;
    promoBuyX: number | null;
    promoGetY: number | null;
  };
}

interface OfflineCache {
  version: number;
  user: UserInfo;
  wallets: WalletItem[];
  expenseCategories: CategoryItem[];
  incomeCategories: CategoryItem[];
  transactions: TransactionItem[];
  notifications: NotificationItem[];
  updatedAt: string;
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

const offlineCacheKey = 'mm-offline-cache-v1';
const offlineQueueKey = 'mm-offline-queue-v1';
const offlineCacheVersion = 1;

export const useMoneyManager = () => {
  const currentUser = useState<UserInfo | null>('mm-user', () => null);
  const bootstrapped = useState<boolean>('mm-bootstrapped', () => false);
  const bootstrapping = useState<boolean>('mm-bootstrapping', () => false);
  const flashMessage = useState<FlashMessage | null>('mm-flash', () => null);
  const runtimeConfig = useRuntimeConfig();

  const displayName = computed(() => {
    const name = currentUser.value?.name?.trim();
    if (name) return name;
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

  const avatarUrl = computed(() => {
    const raw = currentUser.value?.avatarUrl;
    if (!raw) return null;
    const trimmed = raw.trim();
    return trimmed ? trimmed : null;
  });

  const notificationsEnabled = computed(
    () => currentUser.value?.notificationsEnabled ?? true
  );
  const darkModeEnabled = computed(() => currentUser.value?.darkMode ?? false);
  const preferredCurrency = computed<CurrencyCode>(() =>
    currentUser.value?.currency === 'USD' ? 'USD' : 'IDR'
  );
  const preferredLanguage = computed<LanguageCode>(() =>
    currentUser.value?.language === 'en' ? 'en' : 'id'
  );
  const preferredLocale = computed(() => (preferredLanguage.value === 'en' ? 'en-US' : 'id-ID'));
  const exchangeRates = useState<ExchangeRatesState>('mm-exchangeRates', () => ({
    base: 'IDR',
    rates: { IDR: 1, USD: 1 / 15500 },
    updatedAt: 0,
  }));
  const exchangeRateTtlMs = 1000 * 60 * 60;

  const loadExchangeRates = async () => {
    if (process.server) return;
    const now = Date.now();
    if (exchangeRates.value.updatedAt && now - exchangeRates.value.updatedAt < exchangeRateTtlMs) {
      return;
    }

    try {
      const data = await $fetch<{ base?: string; rates?: Record<string, number> }>(
        '/api/exchange-rates'
      );
      if (data?.rates) {
        exchangeRates.value = {
          base: data.base || 'IDR',
          rates: data.rates,
          updatedAt: now,
        };
      }
    } catch (error) {
      if (preferredCurrency.value !== 'IDR') {
        setFlash(t('rateUnavailable'), 'info');
      }
    }
  };

  const resolveCurrencyRate = (currency: CurrencyCode) => {
    if (currency === 'IDR') return 1;
    const rates = exchangeRates.value.rates || {};
    if (exchangeRates.value.base === 'IDR') {
      return typeof rates[currency] === 'number' ? rates[currency] : 1 / 15500;
    }

    const rateToCurrency = rates[currency];
    const rateToIdr = rates['IDR'];
    if (typeof rateToCurrency === 'number' && typeof rateToIdr === 'number' && rateToIdr > 0) {
      return rateToCurrency / rateToIdr;
    }
    return 1 / 15500;
  };

  const convertToPreferredCurrency = (amount: number) =>
    amount * resolveCurrencyRate(preferredCurrency.value);

  const translations = {
    id: {
      preferences: 'Preferensi',
      notifications: 'Notifikasi',
      notificationsOff: 'Notifikasi sedang dimatikan.',
      noNotifications: 'Belum ada notifikasi.',
      loadMore: 'Lihat lebih banyak',
      markReadFailed: 'Gagal menandai notifikasi dibaca.',
      pushNotSupported: 'Browser tidak mendukung notifikasi.',
      pushKeyMissing: 'Kunci push belum diatur.',
      pushPermissionDenied: 'Izin notifikasi ditolak.',
      pushPermissionBlocked: 'Izin notifikasi diblokir di browser.',
      pushRegisterFailed: 'Gagal mendaftarkan notifikasi.',
      pushSubscriptionFailed: 'Gagal mengaktifkan notifikasi.',
      pushUnsubscribeFailed: 'Gagal menonaktifkan notifikasi.',
      darkMode: 'Mode Gelap',
      currency: 'Mata Uang',
      language: 'Bahasa',
      indonesian: 'Indonesia',
      english: 'Inggris',
      greeting: 'Selamat Pagi,',
      loading: 'Memuat data...',
      markAllRead: 'Tandai Dibaca',
      viewAll: 'Lihat Semua',
      home: 'Beranda',
      analytics: 'Analitik',
      master: 'Master',
      profile: 'Profil',
      totalBalance: 'Total Saldo Anda',
      totalAssets: 'Total Aset',
      income: 'Pemasukan',
      expense: 'Pengeluaran',
      incoming: 'Masuk',
      outgoing: 'Keluar',
      addTransaction: 'Tambah Transaksi',
      productName: 'Nama Produk',
      productExample: 'Contoh: Nasi Padang',
      selectCategory: 'Pilih kategori',
      quantity: 'Jml',
      price: 'Harga',
      usePromo: 'Gunakan Promo',
      promoTypeLabel: 'Tipe Promo',
      promoPercent: 'Diskon (%)',
      promoNominal: 'Diskon Nominal',
      promoBuyXGetY: 'Buy X Get Y',
      discountNominalLabel: 'Diskon Nominal',
      buyXLabel: 'Buy X',
      getYLabel: 'Get Y',
      insufficientFunds: 'Sumber dana yang anda pilih tidak memiliki saldo yang cukup.',
      finalTotal: 'Total Akhir',
      incomeExample: 'Contoh: Bonus Tahunan',
      amountLabel: 'Jumlah',
      saveTransaction: 'Simpan Transaksi',
      transactionSaved: 'Transaksi berhasil disimpan.',
      transactionNameRequired: 'Nama transaksi wajib diisi.',
      transactionAmountInvalid: 'Jumlah transaksi harus lebih dari 0.',
      transactionCategoryRequired: 'Kategori transaksi wajib dipilih.',
      transactionWalletRequired: 'Dompet transaksi wajib dipilih.',
      transactionSaveFailed: 'Gagal menyimpan transaksi.',
      editWallet: 'Edit Dompet',
      walletNameLabel: 'Nama Dompet',
      walletExample: 'Contoh: Tabungan Liburan',
      currentBalance: 'Saldo Saat Ini',
      addBalanceLabel: 'Tambah Saldo',
      initialBalanceLabel: 'Saldo Awal (Opsional)',
      emptyIfNoAdd: 'Kosongkan jika tidak menambah saldo.',
      emptyIfZero: 'Kosongkan jika 0.',
      saveChanges: 'Simpan Perubahan',
      createWallet: 'Buat Dompet',
      editCategory: 'Edit Kategori',
      categoryNameLabel: 'Nama Kategori',
      categoryExample: 'Contoh: Hiburan, Bonus',
      saveCategory: 'Simpan Kategori',
      deleteCategory: 'Hapus Kategori',
      deleteWarning: 'Tindakan ini tidak bisa dibatalkan.',
      deleteWalletItemLabel: 'Dompet yang akan dihapus',
      deleteCategoryItemLabel: 'Kategori yang akan dihapus',
      deleteNote: 'Transaksi terkait tetap tersimpan.',
      cancel: 'Batal',
      deleteAction: 'Hapus',
      emailLabel: 'Email',
      currentPassword: 'Password Lama',
      newPassword: 'Password Baru',
      confirmPassword: 'Konfirmasi Password Baru',
      savePassword: 'Simpan Password',
      weeklyCashFlow: 'Arus Kas Mingguan',
      transactionsThisMonth: 'Transaksi Bulan Ini',
      noTransactionsThisMonth: 'Belum ada transaksi di bulan ini.',
      noTransactionsThisWeek: 'Tidak ada transaksi pada minggu ini.',
      weekShort: 'Mg {week}',
      weekRange: 'Minggu {week} ({start}-{end})',
      weeklyTooltipIncome: 'Masuk {count} transaksi',
      weeklyTooltipExpense: 'Keluar {count} transaksi',
      weeklyDetailTitle: 'Detail Minggu {week} - {type}',
      weeklyRangeLabel: 'Rentang {start}-{end} bulan ini',
      detailTransactions: 'Detail Transaksi',
      close: 'Tutup',
      type: 'Tipe',
      date: 'Tanggal',
      incomeName: 'Nama Pemasukan',
      name: 'Nama',
      categoryLabel: 'Kategori',
      walletIn: 'Masuk ke Dompet',
      amount: 'Jumlah',
      note: 'Keterangan',
      nominal: 'Nominal',
      unitPrice: 'Satuan',
      promo: 'Promo',
      discountPercent: 'Diskon {value}%',
      discountNominal: 'Diskon {value}',
      buyXGetY: 'Beli {buy} Gratis {get}',
      sourceWallet: 'Sumber Dana',
      transactionsCount: '{count} transaksi',
      monthSummary: 'Ringkasan Bulan Ini',
      monthSummarySubtitle: 'Analisis pemasukan dan pengeluaran',
      net: 'Selisih',
      comparisonTitle: 'Perbandingan Bulan Ini',
      comparisonSubtitle: 'Pemasukan vs Pengeluaran',
      totalLabel: 'Total',
      transactionsDetailTitle: 'Detail Transaksi Bulan Ini',
      transactionsDetailSubtitle: 'Menampilkan 5 transaksi terbaru dengan pagination',
      tableDate: 'Tanggal',
      tableName: 'Nama',
      tableCategory: 'Kategori',
      tableType: 'Tipe',
      tableWallet: 'Dompet',
      tableAmount: 'Nominal',
      noTransactionsTable: 'Tidak ada transaksi di bulan ini.',
      showingRange: 'Menampilkan {start}-{end} dari {total}',
      pageLabel: 'Hal {current} / {total}',
      prev: 'Sebelumnya',
      next: 'Berikutnya',
      masterData: 'Master Data',
      wallet: 'Dompet',
      category: 'Kategori',
      addWallet: 'Tambah Dompet',
      addCategory: 'Tambah Kategori',
      categoryList: 'Daftar Kategori',
      categoryListSubtitle: 'Icon dan tipe kategori untuk transaksi.',
      icon: 'Icon',
      typeLabel: 'Tipe',
      actions: 'Aksi',
      edit: 'Edit',
      delete: 'Hapus',
      deleteWallet: 'Hapus Dompet',
      noCategories: 'Belum ada kategori.',
      showingCategories: 'Menampilkan {start}-{end} dari {total} kategori',
      account: 'Akun',
      editProfile: 'Edit Profil',
      avatar: 'Avatar',
      changeAvatar: 'Ganti Avatar',
      removeAvatar: 'Hapus Avatar',
      avatarHint: 'PNG/JPG, maks 512KB.',
      changePassword: 'Ganti Password',
      dataSecurity: 'Data & Keamanan',
      exportData: 'Ekspor Data (CSV)',
      privacyPolicy: 'Kebijakan Privasi',
      helpCenter: 'Pusat Bantuan',
      deleteAccount: 'Hapus Akun',
      logout: 'Keluar',
      appVersion: 'Versi Aplikasi {version} - MoneyKu Inc.',
      loadFailed: 'Gagal memuat data. Coba muat ulang.',
      offlineMode: 'Sedang offline, menampilkan data tersimpan.',
      offlineSaved: 'Transaksi disimpan offline dan akan tersinkron saat online.',
      offlineNoCache: 'Anda offline dan belum ada data tersimpan.',
      offlineSyncFailed: 'Gagal sinkron transaksi offline. Akan dicoba lagi.',
      rateUnavailable: 'Gagal mengambil kurs terbaru, memakai kurs cadangan.',
      incomeBadge: 'Pemasukan',
      expenseBadge: 'Pengeluaran',
      downloadCsv: 'Excel (.csv)',
      downloadPdf: 'PDF / Print',
      noDataToExport: 'Tidak ada data untuk diekspor.',
    },
    en: {
      preferences: 'Preferences',
      notifications: 'Notifications',
      notificationsOff: 'Notifications are turned off.',
      noNotifications: 'No notifications yet.',
      loadMore: 'Load more',
      markReadFailed: 'Failed to mark notifications as read.',
      pushNotSupported: 'Browser does not support notifications.',
      pushKeyMissing: 'Push key is not configured.',
      pushPermissionDenied: 'Notification permission was denied.',
      pushPermissionBlocked: 'Notification permission is blocked in the browser.',
      pushRegisterFailed: 'Failed to register notifications.',
      pushSubscriptionFailed: 'Failed to enable notifications.',
      pushUnsubscribeFailed: 'Failed to disable notifications.',
      darkMode: 'Dark Mode',
      currency: 'Currency',
      language: 'Language',
      indonesian: 'Indonesian',
      english: 'English',
      greeting: 'Good Morning,',
      loading: 'Loading data...',
      markAllRead: 'Mark all read',
      viewAll: 'View all',
      home: 'Home',
      analytics: 'Analytics',
      master: 'Master',
      profile: 'Profile',
      totalBalance: 'Total Balance',
      totalAssets: 'Total Assets',
      income: 'Income',
      expense: 'Expense',
      incoming: 'In',
      outgoing: 'Out',
      addTransaction: 'Add Transaction',
      productName: 'Product Name',
      productExample: 'Example: Lunch',
      selectCategory: 'Select category',
      quantity: 'Qty',
      price: 'Price',
      usePromo: 'Use Promo',
      promoTypeLabel: 'Promo Type',
      promoPercent: 'Discount (%)',
      promoNominal: 'Fixed Discount',
      promoBuyXGetY: 'Buy X Get Y',
      discountNominalLabel: 'Fixed Discount',
      buyXLabel: 'Buy X',
      getYLabel: 'Get Y',
      insufficientFunds: 'The selected wallet does not have enough balance.',
      finalTotal: 'Final Total',
      incomeExample: 'Example: Annual bonus',
      amountLabel: 'Amount',
      saveTransaction: 'Save Transaction',
      transactionSaved: 'Transaction saved.',
      transactionNameRequired: 'Transaction name is required.',
      transactionAmountInvalid: 'Transaction amount must be greater than 0.',
      transactionCategoryRequired: 'Transaction category is required.',
      transactionWalletRequired: 'Transaction wallet is required.',
      transactionSaveFailed: 'Failed to save transaction.',
      editWallet: 'Edit Wallet',
      walletNameLabel: 'Wallet Name',
      walletExample: 'Example: Holiday Savings',
      currentBalance: 'Current Balance',
      addBalanceLabel: 'Add Balance',
      initialBalanceLabel: 'Initial Balance (Optional)',
      emptyIfNoAdd: 'Leave empty if no balance added.',
      emptyIfZero: 'Leave empty if 0.',
      saveChanges: 'Save Changes',
      createWallet: 'Create Wallet',
      editCategory: 'Edit Category',
      categoryNameLabel: 'Category Name',
      categoryExample: 'Example: Entertainment, Bonus',
      saveCategory: 'Save Category',
      deleteCategory: 'Delete Category',
      deleteWarning: 'This action cannot be undone.',
      deleteWalletItemLabel: 'Wallet to be deleted',
      deleteCategoryItemLabel: 'Category to be deleted',
      deleteNote: 'Related transactions will remain.',
      cancel: 'Cancel',
      deleteAction: 'Delete',
      emailLabel: 'Email',
      currentPassword: 'Current Password',
      newPassword: 'New Password',
      confirmPassword: 'Confirm New Password',
      savePassword: 'Save Password',
      weeklyCashFlow: 'Weekly Cash Flow',
      transactionsThisMonth: 'Transactions This Month',
      noTransactionsThisMonth: 'No transactions this month.',
      noTransactionsThisWeek: 'No transactions this week.',
      weekShort: 'Wk {week}',
      weekRange: 'Week {week} ({start}-{end})',
      weeklyTooltipIncome: 'In {count} transactions',
      weeklyTooltipExpense: 'Out {count} transactions',
      weeklyDetailTitle: 'Week {week} Details - {type}',
      weeklyRangeLabel: 'Range {start}-{end} this month',
      detailTransactions: 'Transaction Details',
      close: 'Close',
      type: 'Type',
      date: 'Date',
      incomeName: 'Income Name',
      name: 'Name',
      categoryLabel: 'Category',
      walletIn: 'To Wallet',
      amount: 'Amount',
      note: 'Note',
      nominal: 'Amount',
      unitPrice: 'Unit Price',
      promo: 'Promo',
      discountPercent: 'Discount {value}%',
      discountNominal: 'Discount {value}',
      buyXGetY: 'Buy {buy} Get {get}',
      sourceWallet: 'Source Wallet',
      transactionsCount: '{count} transactions',
      monthSummary: 'This Month Summary',
      monthSummarySubtitle: 'Income and expense analysis',
      net: 'Net',
      comparisonTitle: 'This Month Comparison',
      comparisonSubtitle: 'Income vs Expense',
      totalLabel: 'Total',
      transactionsDetailTitle: 'This Month Transaction Details',
      transactionsDetailSubtitle: 'Showing latest 5 transactions with pagination',
      tableDate: 'Date',
      tableName: 'Name',
      tableCategory: 'Category',
      tableType: 'Type',
      tableWallet: 'Wallet',
      tableAmount: 'Amount',
      noTransactionsTable: 'No transactions this month.',
      showingRange: 'Showing {start}-{end} of {total}',
      pageLabel: 'Page {current} / {total}',
      prev: 'Previous',
      next: 'Next',
      masterData: 'Master Data',
      wallet: 'Wallet',
      category: 'Category',
      addWallet: 'Add Wallet',
      addCategory: 'Add Category',
      categoryList: 'Category List',
      categoryListSubtitle: 'Icons and types for transactions.',
      icon: 'Icon',
      typeLabel: 'Type',
      actions: 'Actions',
      edit: 'Edit',
      delete: 'Delete',
      deleteWallet: 'Delete Wallet',
      noCategories: 'No categories yet.',
      showingCategories: 'Showing {start}-{end} of {total} categories',
      account: 'Account',
      editProfile: 'Edit Profile',
      avatar: 'Avatar',
      changeAvatar: 'Change Avatar',
      removeAvatar: 'Remove Avatar',
      avatarHint: 'PNG/JPG, max 512KB.',
      changePassword: 'Change Password',
      dataSecurity: 'Data & Security',
      exportData: 'Export Data (CSV)',
      privacyPolicy: 'Privacy Policy',
      helpCenter: 'Help Center',
      deleteAccount: 'Delete Account',
      logout: 'Sign Out',
      appVersion: 'App Version {version} - MoneyKu Inc.',
      loadFailed: 'Failed to load data. Please refresh.',
      offlineMode: 'You are offline, showing cached data.',
      offlineSaved: 'Transaction saved offline and will sync when online.',
      offlineNoCache: 'You are offline and no cached data is available.',
      offlineSyncFailed: 'Failed to sync offline transactions. Will retry.',
      rateUnavailable: 'Unable to fetch latest rates, using fallback.',
      incomeBadge: 'Income',
      expenseBadge: 'Expense',
      downloadCsv: 'Excel (.csv)',
      downloadPdf: 'PDF / Print',
      noDataToExport: 'No data to export.',
    },
  } as const;

  type TranslationKey = keyof typeof translations.id;

  const t = (key: TranslationKey, params?: Record<string, string | number>) => {
    const lang = preferredLanguage.value;
    let text = translations[lang]?.[key] || translations.id[key] || key;
    if (params) {
      Object.entries(params).forEach(([param, value]) => {
        text = text.replace(new RegExp(`\\{${param}\\}`, 'g'), String(value));
      });
    }
    return text;
  };

  const notificationStyles: Record<NotificationType, { icon: string; bg: string; color: string }> = {
    success: { icon: 'fa-check-circle', bg: 'bg-green-100', color: 'text-green-600' },
    warning: { icon: 'fa-triangle-exclamation', bg: 'bg-yellow-100', color: 'text-yellow-600' },
    alert: { icon: 'fa-shield-alt', bg: 'bg-red-100', color: 'text-red-600' },
    info: { icon: 'fa-info-circle', bg: 'bg-blue-100', color: 'text-blue-600' },
  };

  const notifications = useState<NotificationItem[]>('mm-notifications', () => []);
  const notificationsCursor = useState<string | null>('mm-notificationsCursor', () => null);
  const notificationsHasMore = useState<boolean>('mm-notificationsHasMore', () => false);

  const wallets = useState<WalletItem[]>('mm-wallets', () => []);
  const expenseCategories = useState<CategoryItem[]>('mm-expenseCategories', () => []);
  const incomeCategories = useState<CategoryItem[]>('mm-incomeCategories', () => []);
  const transactions = useState<TransactionItem[]>('mm-transactions', () => []);
  const analyticsSummary = useState<AnalyticsSummary>('mm-analyticsSummary', () => ({
    income: 0,
    expense: 0,
    net: 0,
  }));
  const analyticsWeekly = useState<WeeklyChart>('mm-analyticsWeekly', () => ({
    data: [],
    maxVal: 1,
    daysInMonth: 0,
  }));
  const analyticsTransactions = useState<TransactionItem[]>('mm-analyticsTransactions', () => []);
  const analyticsTotal = useState<number>('mm-analyticsTotal', () => 0);
  const analyticsPage = useState<number>('mm-analyticsPage', () => 1);
  const analyticsLoading = useState<boolean>('mm-analyticsLoading', () => false);
  const analyticsTableLoading = useState<boolean>('mm-analyticsTableLoading', () => false);
  const analyticsPageSize = 5;
  const isOnline = useState<boolean>('mm-isOnline', () =>
    process.client ? navigator.onLine : true
  );
  const connectionReady = useState<boolean>('mm-connectionReady', () => false);
  const offlineQueue = useState<OfflineTransactionPayload[]>('mm-offlineQueue', () => []);
  const offlineQueueLoaded = useState<boolean>('mm-offlineQueueLoaded', () => false);
  const syncingQueue = useState<boolean>('mm-offlineSyncing', () => false);
  const pendingSyncRefresh = useState<boolean>('mm-offlineSyncRefresh', () => false);
  const allCategories = computed(() => [...expenseCategories.value, ...incomeCategories.value]);

  const showAddModal = useState<boolean>('mm-showAddModal', () => false);
  const showWalletModal = useState<boolean>('mm-showWalletModal', () => false);
  const showCategoryModal = useState<boolean>('mm-showCategoryModal', () => false);
  const showDeleteWalletModal = useState<boolean>('mm-showDeleteWalletModal', () => false);
  const showDeleteCategoryModal = useState<boolean>('mm-showDeleteCategoryModal', () => false);
  const showProfileModal = useState<boolean>('mm-showProfileModal', () => false);
  const showPasswordModal = useState<boolean>('mm-showPasswordModal', () => false);

  const showNotifications = useState<boolean>('mm-showNotifications', () => false);
  const hasUnread = useState<boolean>('mm-hasUnread', () => false);

  const editingWallet = useState<WalletItem | null>('mm-editingWallet', () => null);
  const walletToDelete = useState<WalletItem | null>('mm-walletToDelete', () => null);
  const editingCategory = useState<CategoryItem | null>('mm-editingCategory', () => null);
  const categoryToDelete = useState<CategoryItem | null>('mm-categoryToDelete', () => null);
  const profileForm = useState<ProfileFormState>('mm-profileForm', () => ({ name: '', avatarUrl: null }));
  const passwordForm = useState<PasswordFormState>('mm-passwordForm', () => ({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  }));

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

  const normalizeNotificationType = (type: string): NotificationType => {
    if (type === 'success' || type === 'warning' || type === 'alert') return type;
    return 'info';
  };

  const formatNotificationTime = (value: string) => {
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return '';
    return parsed.toLocaleString(preferredLocale.value);
  };

  const mapNotifications = (items: NotificationPayload[]) =>
    items.map((notif) => ({
      id: notif.id,
      title: notif.title,
      message: notif.message,
      time: formatNotificationTime(notif.createdAt),
      type: normalizeNotificationType(notif.type),
      read: notif.read,
    }));

  const mapTransactions = (items: TransactionPayload[]) =>
    items.map((tx) => {
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

  const updateHasUnread = () => {
    hasUnread.value = notifications.value.some((notif) => !notif.read);
  };

  const formatRupiah = (number: number) => {
    const currency = preferredCurrency.value;
    const locale = preferredLocale.value;
    const fractionDigits = currency === 'IDR' ? 0 : 2;
    const converted = convertToPreferredCurrency(number);
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      minimumFractionDigits: fractionDigits,
      maximumFractionDigits: fractionDigits,
    }).format(converted);
  };

  const formatShortRupiah = (number: number) => {
    const converted = convertToPreferredCurrency(number);
    const abs = Math.abs(converted);
    const isEnglish = preferredLanguage.value === 'en';
    if (abs >= 1000000) return `${(converted / 1000000).toFixed(1)}${isEnglish ? 'M' : 'jt'}`;
    if (abs >= 1000) return `${(converted / 1000).toFixed(0)}${isEnglish ? 'K' : 'rb'}`;
    if (preferredCurrency.value === 'USD') return converted.toFixed(2);
    return Math.round(converted).toString();
  };

  const toggleNotifications = () => {
    if (!notificationsEnabled.value) {
      setFlash(t('notificationsOff'), 'info');
      return;
    }
    showNotifications.value = !showNotifications.value;
  };

  const markAllNotificationsRead = async () => {
    if (!notificationsEnabled.value) return;
    try {
      await $fetch('/api/notifications/read', { method: 'PUT' });
      notifications.value = notifications.value.map((notif) => ({ ...notif, read: true }));
      updateHasUnread();
      persistOfflineCache();
    } catch (error) {
      setFlash(resolveErrorMessage(error, t('markReadFailed')), 'error');
    }
  };

  const markNotificationRead = async (notificationId: string) => {
    const target = notifications.value.find((notif) => notif.id === notificationId);
    if (!target || target.read) return;
    target.read = true;
    updateHasUnread();

    try {
      await $fetch(`/api/notifications/${notificationId}`, { method: 'PUT' });
    } catch (error) {
      target.read = false;
      updateHasUnread();
      setFlash(resolveErrorMessage(error, t('markReadFailed')), 'error');
    } finally {
      persistOfflineCache();
    }
  };

  const refreshNotifications = async (limit = 50) => {
    try {
      const data = await $fetch<{
        notifications: NotificationPayload[];
        nextCursor?: string | null;
      }>(`/api/notifications?limit=${limit}`);
      notifications.value = mapNotifications(data.notifications || []);
      notificationsCursor.value = data.nextCursor || null;
      notificationsHasMore.value = Boolean(data.nextCursor);
      updateHasUnread();
      persistOfflineCache();
    } catch (error) {
      setFlash(resolveErrorMessage(error, t('loadFailed')), 'error');
    }
  };

  const loadMoreNotifications = async (limit = 50) => {
    if (!notificationsHasMore.value || !notificationsCursor.value) return;
    try {
      const data = await $fetch<{
        notifications: NotificationPayload[];
        nextCursor?: string | null;
      }>(`/api/notifications?limit=${limit}&cursor=${encodeURIComponent(notificationsCursor.value)}`);
      const nextItems = mapNotifications(data.notifications || []);
      notifications.value = [...notifications.value, ...nextItems];
      notificationsCursor.value = data.nextCursor || null;
      notificationsHasMore.value = Boolean(data.nextCursor);
      updateHasUnread();
      persistOfflineCache();
    } catch (error) {
      setFlash(resolveErrorMessage(error, t('loadFailed')), 'error');
    }
  };

  const setFlash = (message: string, type: FlashType = 'success') => {
    flashMessage.value = { id: Date.now(), type, message };
  };

  const clearFlash = () => {
    flashMessage.value = null;
  };

  const resolveErrorMessage = (error: any, fallback: string) =>
    error?.data?.statusMessage ||
    error?.data?.message ||
    error?.message ||
    fallback;

  const isClient = typeof window !== 'undefined';
  const isOffline = () => isClient && !isOnline.value;

  const readStorage = <T,>(key: string, fallback: T) => {
    if (!isClient) return fallback;
    try {
      const raw = window.localStorage.getItem(key);
      if (!raw) return fallback;
      return JSON.parse(raw) as T;
    } catch (error) {
      return fallback;
    }
  };

  const writeStorage = (key: string, value: unknown) => {
    if (!isClient) return;
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      // Ignore storage errors (quota, private mode).
    }
  };

  const removeStorage = (key: string) => {
    if (!isClient) return;
    try {
      window.localStorage.removeItem(key);
    } catch (error) {
      // Ignore storage errors.
    }
  };

  const loadOfflineQueue = () => {
    if (!isClient) return [] as OfflineTransactionPayload[];
    if (offlineQueueLoaded.value) return offlineQueue.value;
    const saved = readStorage<OfflineTransactionPayload[]>(offlineQueueKey, []);
    offlineQueue.value = Array.isArray(saved) ? saved : [];
    offlineQueueLoaded.value = true;
    return offlineQueue.value;
  };

  const saveOfflineQueue = (items: OfflineTransactionPayload[]) => {
    offlineQueue.value = items;
    offlineQueueLoaded.value = true;
    writeStorage(offlineQueueKey, items);
  };

  const clearOfflineQueue = () => {
    offlineQueue.value = [];
    offlineQueueLoaded.value = true;
    removeStorage(offlineQueueKey);
  };

  const loadOfflineCache = () => {
    const cached = readStorage<OfflineCache | null>(offlineCacheKey, null);
    if (!cached || cached.version !== offlineCacheVersion) return null;
    return cached;
  };

  const persistOfflineCache = () => {
    if (!currentUser.value) return;
    const payload: OfflineCache = {
      version: offlineCacheVersion,
      user: currentUser.value,
      wallets: wallets.value,
      expenseCategories: expenseCategories.value,
      incomeCategories: incomeCategories.value,
      transactions: transactions.value,
      notifications: notifications.value,
      updatedAt: new Date().toISOString(),
    };
    writeStorage(offlineCacheKey, payload);
  };

  const clearOfflineCache = () => {
    removeStorage(offlineCacheKey);
  };

  const applyOfflineCache = (cache: OfflineCache) => {
    currentUser.value = cache.user || null;
    wallets.value = cache.wallets || [];
    expenseCategories.value = cache.expenseCategories || [];
    incomeCategories.value = cache.incomeCategories || [];
    transactions.value = cache.transactions || [];
    notifications.value = cache.notifications || [];
    notificationsCursor.value = null;
    notificationsHasMore.value = false;
    updateHasUnread();
    if (cache.user?.currency && cache.user.currency !== 'IDR') {
      void loadExchangeRates();
    }
  };

  const applyPendingToWallet = (walletId: string, signedAmount: number) => {
    const wallet = wallets.value.find((item) => item.id === walletId);
    if (!wallet) return;
    wallet.balance = Number(wallet.balance || 0) + signedAmount;
    if (signedAmount > 0 && typeof wallet.incomeTotal === 'number') {
      wallet.incomeTotal += signedAmount;
    }
    if (signedAmount < 0 && typeof wallet.expenseTotal === 'number') {
      wallet.expenseTotal += Math.abs(signedAmount);
    }
  };

  const buildLocalTransaction = (item: OfflineTransactionPayload) => {
    const category = allCategories.value.find((cat) => cat.id === item.payload.categoryId);
    const type: TransactionType = category?.type === 'income' ? 'income' : 'expense';
    const amount = type === 'income' ? item.payload.amount : -item.payload.amount;
    const title = item.payload.productName?.trim() || category?.name || 'Transaksi';
    const icon = category?.icon || resolveTransactionIcon(category?.name || '', type);
    const wallet = wallets.value.find((w) => w.id === item.payload.walletId);

    return {
      id: item.id,
      title,
      category: category?.name || 'Kategori',
      categoryId: item.payload.categoryId,
      type,
      amount,
      date: item.payload.date,
      createdAt: item.createdAt,
      icon,
      wallet: wallet?.name || '-',
      walletId: wallet?.id || null,
      note: item.payload.note ?? null,
      quantity: item.payload.quantity ?? 1,
      pricePerUnit: item.payload.pricePerUnit ?? null,
      promoType: item.payload.promoType ?? null,
      promoValue: item.payload.promoValue ?? null,
      promoBuyX: item.payload.promoBuyX ?? null,
      promoGetY: item.payload.promoGetY ?? null,
      pending: true,
    };
  };

  const mergePendingTransactions = (queue: OfflineTransactionPayload[]) => {
    if (!queue.length) return;
    const existing = new Set(transactions.value.map((tx) => tx.id));
    const additions: TransactionItem[] = [];

    queue.forEach((item) => {
      if (existing.has(item.id)) return;
      const localTx = buildLocalTransaction(item);
      additions.push(localTx);
      applyPendingToWallet(item.payload.walletId, localTx.amount);
    });

    if (additions.length) {
      transactions.value = [...additions, ...transactions.value];
    }
  };

  const setupConnectionListeners = () => {
    if (!isClient || connectionReady.value) return;
    connectionReady.value = true;
    isOnline.value = navigator.onLine;

    window.addEventListener('online', () => {
      isOnline.value = true;
      void syncPendingTransactions();
    });

    window.addEventListener('offline', () => {
      isOnline.value = false;
    });
  };

  const syncPendingTransactions = async () => {
    if (!isClient || syncingQueue.value) return;
    if (!isOnline.value) return;
    const queue = loadOfflineQueue();
    if (queue.length === 0) return;

    syncingQueue.value = true;
    const remaining: OfflineTransactionPayload[] = [];
    let syncedCount = 0;

    try {
      for (const item of queue) {
        try {
          await $fetch('/api/transactions', {
            method: 'POST',
            body: item.payload,
          });
          syncedCount += 1;
        } catch (error) {
          remaining.push(item);
        }
      }

      saveOfflineQueue(remaining);
      if (syncedCount > 0) {
        if (bootstrapping.value) {
          pendingSyncRefresh.value = true;
        } else {
          await refreshData();
        }
      }
      if (remaining.length > 0) {
        setFlash(t('offlineSyncFailed'), 'error');
      }
    } finally {
      syncingQueue.value = false;
    }
  };

  const isPushSupported = () =>
    typeof window !== 'undefined' &&
    'serviceWorker' in navigator &&
    'PushManager' in window &&
    'Notification' in window;

  const urlBase64ToUint8Array = (base64String: string) => {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; i += 1) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  };

  const sendPushSubscription = async (subscription: PushSubscription) => {
    await $fetch('/api/push/subscribe', {
      method: 'POST',
      body: { subscription: subscription.toJSON() },
    });
  };

  const registerPushWorker = async () => {
    if (!isPushSupported()) return null;
    try {
      return await navigator.serviceWorker.register('/sw.js');
    } catch (error) {
      setFlash(resolveErrorMessage(error, t('pushRegisterFailed')), 'error');
      return null;
    }
  };

  const syncPushSubscription = async () => {
    if (!isPushSupported()) return;
    if (Notification.permission !== 'granted') return;
    try {
      const registration =
        (await navigator.serviceWorker.getRegistration('/sw.js')) || (await registerPushWorker());
      if (!registration) return;
      const subscription = await registration.pushManager.getSubscription();
      if (subscription) {
        await sendPushSubscription(subscription);
      }
    } catch (error) {
      console.error('Failed to sync push subscription', error);
    }
  };

  const enablePushNotifications = async () => {
    if (!isPushSupported()) {
      setFlash(t('pushNotSupported'), 'error');
      return false;
    }

    const publicKey = runtimeConfig.public?.webPushPublicKey as string | undefined;
    if (!publicKey) {
      setFlash(t('pushKeyMissing'), 'error');
      return false;
    }

    if (Notification.permission === 'denied') {
      setFlash(t('pushPermissionBlocked'), 'error');
      return false;
    }

    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      setFlash(t('pushPermissionDenied'), 'error');
      return false;
    }

    const registration = await registerPushWorker();
    if (!registration) {
      setFlash(t('pushRegisterFailed'), 'error');
      return false;
    }

    const existing = await registration.pushManager.getSubscription();
    const subscription =
      existing ||
      (await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey),
      }));

    try {
      await sendPushSubscription(subscription);
      return true;
    } catch (error) {
      setFlash(resolveErrorMessage(error, t('pushSubscriptionFailed')), 'error');
      return false;
    }
  };

  const disablePushNotifications = async () => {
    if (!isPushSupported()) return;
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      if (subscription) {
        await subscription.unsubscribe();
        await $fetch('/api/push/unsubscribe', {
          method: 'POST',
          body: { endpoint: subscription.endpoint },
        });
      }
    } catch (error) {
      setFlash(resolveErrorMessage(error, t('pushUnsubscribeFailed')), 'error');
    }
  };

  const handleApiError = (error: any, fallback: string) => {
    const message = resolveErrorMessage(error, fallback);
    setFlash(message, 'error');
  };

  const fetchBootstrap = async () => {
    const headers = process.server ? useRequestHeaders(['cookie']) : undefined;
    const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
    const timeout = controller ? setTimeout(() => controller.abort(), 12000) : null;
    try {
      const data = await $fetch<BootstrapPayload>('/api/bootstrap', {
        headers,
        signal: controller?.signal,
      });

      currentUser.value = data.user;
      if (data.user?.currency && data.user.currency !== 'IDR') {
        void loadExchangeRates();
      }

      const categoryItems: CategoryItem[] = (data.categories || []).map((cat) => ({
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
          incomeTotal: typeof wallet.incomeTotal === 'number' ? wallet.incomeTotal : undefined,
          expenseTotal: typeof wallet.expenseTotal === 'number' ? wallet.expenseTotal : undefined,
          color: meta.color,
          icon: meta.icon,
        };
      });

      transactions.value = mapTransactions(data.transactions || []);

      notifications.value = mapNotifications(data.notifications || []);
      updateHasUnread();

      if (process.client && currentUser.value?.notificationsEnabled) {
        void syncPushSubscription();
      }

      const pendingQueue = loadOfflineQueue();
      if (pendingQueue.length) {
        mergePendingTransactions(pendingQueue);
      }

      bootstrapped.value = true;
      persistOfflineCache();
    } finally {
      if (timeout) clearTimeout(timeout);
    }
  };

  const ensureLoaded = async () => {
    if (process.server) return;
    setupConnectionListeners();
    if (bootstrapped.value || bootstrapping.value) return;
    bootstrapping.value = true;
    try {
      if (isOffline()) {
        const cached = loadOfflineCache();
        if (cached) {
          applyOfflineCache(cached);
          mergePendingTransactions(loadOfflineQueue());
          bootstrapped.value = true;
          setFlash(t('offlineMode'), 'info');
          return;
        }
        throw new Error('offline-no-cache');
      }

      await fetchBootstrap();
    } catch (error) {
      const cached = loadOfflineCache();
      if (cached) {
        applyOfflineCache(cached);
        mergePendingTransactions(loadOfflineQueue());
        bootstrapped.value = true;
        setFlash(t('offlineMode'), 'info');
      } else {
        console.error('Bootstrap error', error);
        currentUser.value = null;
        wallets.value = [];
        expenseCategories.value = [];
        incomeCategories.value = [];
        transactions.value = [];
        notifications.value = [];
        hasUnread.value = false;
        bootstrapped.value = false;
        setFlash(isOffline() ? t('offlineNoCache') : t('loadFailed'), 'error');
      }
    } finally {
      bootstrapping.value = false;
      if (pendingSyncRefresh.value) {
        pendingSyncRefresh.value = false;
        await refreshData();
        return;
      }
      if (!isOffline()) {
        const pendingQueue = loadOfflineQueue();
        if (pendingQueue.length) {
          void syncPendingTransactions();
        }
      }
    }
  };

  const refreshData = async () => {
    bootstrapped.value = false;
    await ensureLoaded();
  };

  const parseMonthKey = (monthKey: string) => {
    const [yearText, monthText] = monthKey.split('-');
    const year = Number(yearText);
    const month = Number(monthText);
    if (!Number.isFinite(year) || !Number.isFinite(month) || month < 1 || month > 12) {
      return null;
    }
    return { year, monthIndex: month - 1 };
  };

  const getTransactionsForMonth = (monthKey: string) => {
    const parsed = parseMonthKey(monthKey);
    if (!parsed) return [] as TransactionItem[];
    return transactions.value.filter((t) => {
      const tDate = new Date(t.date);
      if (Number.isNaN(tDate.getTime())) return false;
      return tDate.getFullYear() === parsed.year && tDate.getMonth() === parsed.monthIndex;
    });
  };

  const sortTransactionsByDate = (items: TransactionItem[]) =>
    [...items].sort(
      (a, b) => new Date(b.createdAt || b.date).getTime() - new Date(a.createdAt || a.date).getTime()
    );

  const buildWeeklyChart = (items: TransactionItem[], monthKey: string): WeeklyChart => {
    const parsed = parseMonthKey(monthKey);
    if (!parsed) return { data: [], maxVal: 1, daysInMonth: 0 };
    const daysInMonth = new Date(parsed.year, parsed.monthIndex + 1, 0).getDate();
    const data: WeeklyBucket[] = [];
    for (let day = 1, index = 0; day <= daysInMonth; day += 7, index += 1) {
      data.push({
        week: index + 1,
        startDay: day,
        endDay: Math.min(day + 6, daysInMonth),
        income: 0,
        expense: 0,
      });
    }

    items.forEach((t) => {
      const tDate = new Date(t.date);
      if (Number.isNaN(tDate.getTime())) return;
      const day = tDate.getDate();
      const index = Math.floor((day - 1) / 7);
      const bucket = data[index];
      if (!bucket) return;
      if (t.type === 'income') {
        bucket.income += 1;
      } else {
        bucket.expense += 1;
      }
    });

    const maxVal = Math.max(...data.map((d) => Math.max(d.income, d.expense)), 1);
    return { data, maxVal, daysInMonth };
  };

  const applyOfflineAnalyticsOverview = (monthKey: string) => {
    const items = getTransactionsForMonth(monthKey);
    const income = items
      .filter((t) => t.amount > 0)
      .reduce((acc, curr) => acc + curr.amount, 0);
    const expense = items
      .filter((t) => t.amount < 0)
      .reduce((acc, curr) => acc + Math.abs(curr.amount), 0);

    analyticsSummary.value = { income, expense, net: income - expense };
    analyticsWeekly.value = buildWeeklyChart(items, monthKey);
  };

  const applyOfflineAnalyticsTransactions = (monthKey: string, page = 1) => {
    const items = sortTransactionsByDate(getTransactionsForMonth(monthKey));
    analyticsTotal.value = items.length;
    analyticsPage.value = page;
    const start = (page - 1) * analyticsPageSize;
    analyticsTransactions.value = items.slice(start, start + analyticsPageSize);
  };

  const fetchAnalyticsOverview = async (monthKey: string) => {
    analyticsLoading.value = true;
    if (isOffline()) {
      applyOfflineAnalyticsOverview(monthKey);
      analyticsLoading.value = false;
      return;
    }
    try {
      const data = await $fetch<{
        summary: AnalyticsSummary;
        weekly: WeeklyChart;
      }>(`/api/analytics?month=${monthKey}`);
      analyticsSummary.value = data.summary || { income: 0, expense: 0, net: 0 };
      analyticsWeekly.value = data.weekly || { data: [], maxVal: 1, daysInMonth: 0 };
    } catch (error) {
      setFlash(resolveErrorMessage(error, t('loadFailed')), 'error');
    } finally {
      analyticsLoading.value = false;
    }
  };

  const fetchAnalyticsTransactions = async (monthKey: string, page = 1) => {
    analyticsTableLoading.value = true;
    if (isOffline()) {
      applyOfflineAnalyticsTransactions(monthKey, page);
      analyticsTableLoading.value = false;
      return;
    }
    try {
      const data = await $fetch<{
        transactions: TransactionPayload[];
        total: number;
      }>(`/api/transactions?month=${monthKey}&page=${page}&limit=${analyticsPageSize}`);
      analyticsTransactions.value = mapTransactions(data.transactions || []);
      analyticsTotal.value = Number(data.total || 0);
      analyticsPage.value = page;
    } catch (error) {
      setFlash(resolveErrorMessage(error, t('loadFailed')), 'error');
    } finally {
      analyticsTableLoading.value = false;
    }
  };

  const loadAnalytics = async (page = 1) => {
    const monthKey = monthInputValue.value;
    await Promise.all([
      fetchAnalyticsOverview(monthKey),
      fetchAnalyticsTransactions(monthKey, page),
    ]);
  };

  const clearData = () => {
    currentUser.value = null;
    wallets.value = [];
    expenseCategories.value = [];
    incomeCategories.value = [];
    transactions.value = [];
    notifications.value = [];
    notificationsCursor.value = null;
    notificationsHasMore.value = false;
    hasUnread.value = false;
    bootstrapped.value = false;
    analyticsSummary.value = { income: 0, expense: 0, net: 0 };
    analyticsWeekly.value = { data: [], maxVal: 1, daysInMonth: 0 };
    analyticsTransactions.value = [];
    analyticsTotal.value = 0;
    analyticsPage.value = 1;
    analyticsLoading.value = false;
    analyticsTableLoading.value = false;
    clearOfflineCache();
    clearOfflineQueue();
    offlineQueueLoaded.value = false;
    syncingQueue.value = false;
    pendingSyncRefresh.value = false;
  };

  const updatePreferences = async (updates: Partial<UserPreferences>) => {
    if (!currentUser.value) return;
    const previous = { ...currentUser.value };
    currentUser.value = { ...currentUser.value, ...updates };

    if (updates.notificationsEnabled === false) {
      showNotifications.value = false;
      hasUnread.value = false;
    }

    try {
      const response = await $fetch<{ user: UserInfo }>('/api/user/preferences', {
        method: 'PUT',
        body: updates,
      });
      currentUser.value = response.user;
      if (updates.notificationsEnabled === true) {
        updateHasUnread();
      }
      persistOfflineCache();
    } catch (error) {
      currentUser.value = previous;
      setFlash(resolveErrorMessage(error, 'Gagal memperbarui preferensi.'), 'error');
      persistOfflineCache();
    }
  };

  const toggleNotificationsPreference = async () => {
    const nextValue = !notificationsEnabled.value;
    if (nextValue) {
      const enabled = await enablePushNotifications();
      if (!enabled) return;
      await updatePreferences({ notificationsEnabled: true });
    } else {
      await updatePreferences({ notificationsEnabled: false });
      await disablePushNotifications();
    }
  };

  const toggleDarkModePreference = () =>
    updatePreferences({ darkMode: !darkModeEnabled.value });

  const setCurrencyPreference = (currency: CurrencyCode) => {
    if (currency === preferredCurrency.value) return;
    if (currency !== 'IDR') {
      void loadExchangeRates();
    }
    updatePreferences({ currency });
  };

  const setLanguagePreference = (language: LanguageCode) => {
    if (language === preferredLanguage.value) return;
    updatePreferences({ language });
  };

  const currencyOptions = computed(() => [
    { value: 'IDR' as CurrencyCode, label: 'IDR (Rupiah)' },
    { value: 'USD' as CurrencyCode, label: preferredLanguage.value === 'en' ? 'USD (US Dollar)' : 'USD (Dolar AS)' },
  ]);

  const languageOptions = computed(() => [
    { value: 'id' as LanguageCode, label: t('indonesian') },
    { value: 'en' as LanguageCode, label: t('english') },
  ]);

  const openProfileModal = () => {
    profileForm.value.name = currentUser.value?.name?.trim() || displayName.value;
    profileForm.value.avatarUrl = currentUser.value?.avatarUrl ?? null;
    showProfileModal.value = true;
  };

  const closeProfileModal = () => {
    showProfileModal.value = false;
  };

  const handleSaveProfile = async () => {
    const name = profileForm.value.name.trim();
    if (!name) {
      setFlash('Nama wajib diisi.', 'error');
      return;
    }
    const avatarUrl = profileForm.value.avatarUrl?.trim() || null;
    try {
      const response = await $fetch<{ user: UserInfo }>('/api/user', {
        method: 'PUT',
        body: { name, avatarUrl },
      });
      currentUser.value = response.user;
      setFlash('Profil berhasil diperbarui.', 'success');
      persistOfflineCache();
      closeProfileModal();
    } catch (error) {
      setFlash(resolveErrorMessage(error, 'Gagal memperbarui profil.'), 'error');
    }
  };

  const openPasswordModal = () => {
    passwordForm.value = { currentPassword: '', newPassword: '', confirmPassword: '' };
    showPasswordModal.value = true;
  };

  const closePasswordModal = () => {
    showPasswordModal.value = false;
  };

  const handleChangePassword = async () => {
    const currentPassword = passwordForm.value.currentPassword;
    const newPassword = passwordForm.value.newPassword;
    const confirmPassword = passwordForm.value.confirmPassword;

    if (!currentPassword || !newPassword) {
      setFlash('Password wajib diisi.', 'error');
      return;
    }
    if (newPassword.length < 6) {
      setFlash('Password minimal 6 karakter.', 'error');
      return;
    }
    if (newPassword !== confirmPassword) {
      setFlash('Konfirmasi password tidak cocok.', 'error');
      return;
    }

    try {
      await $fetch('/api/auth/password', {
        method: 'PUT',
        body: { currentPassword, newPassword },
      });
      setFlash('Password berhasil diperbarui.', 'success');
      closePasswordModal();
      passwordForm.value = { currentPassword: '', newPassword: '', confirmPassword: '' };
    } catch (error) {
      setFlash(resolveErrorMessage(error, 'Gagal memperbarui password.'), 'error');
    }
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
    if (!title) {
      setFlash(t('transactionNameRequired'), 'error');
      return;
    }
    if (formData.value.totalAmount <= 0) {
      setFlash(t('transactionAmountInvalid'), 'error');
      return;
    }

    const walletId =
      formData.value.type === 'expense' ? formData.value.sourceWallet : formData.value.destWallet;

    if (!formData.value.category) {
      setFlash(t('transactionCategoryRequired'), 'error');
      return;
    }
    if (!walletId) {
      setFlash(t('transactionWalletRequired'), 'error');
      return;
    }
    if (formData.value.type === 'expense') {
      const wallet = wallets.value.find((item) => item.id === walletId);
      if (wallet && wallet.balance < formData.value.totalAmount) {
        setFlash(t('insufficientFunds'), 'error');
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

    const payload = {
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
    };

    const saveOffline = () => {
      const localId = `offline-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
      const offlineItem: OfflineTransactionPayload = {
        id: localId,
        createdAt: new Date().toISOString(),
        payload,
      };
      const queue = loadOfflineQueue();
      saveOfflineQueue([...queue, offlineItem]);
      mergePendingTransactions([offlineItem]);
      persistOfflineCache();
      showAddModal.value = false;
      resetTransactionForm();
      setFlash(t('offlineSaved'), 'info');
    };

    if (isOffline()) {
      saveOffline();
      return;
    }

    try {
      await $fetch('/api/transactions', {
        method: 'POST',
        body: payload,
      });

      showAddModal.value = false;
      resetTransactionForm();
      await refreshData();
      setFlash(t('transactionSaved'), 'success');
    } catch (error) {
      if (isOffline()) {
        saveOffline();
        return;
      }
      setFlash(resolveErrorMessage(error, t('transactionSaveFailed')), 'error');
    }
  };

  const getWalletIncome = (walletId: string) => {
    const wallet = wallets.value.find((item) => item.id === walletId);
    if (wallet && typeof wallet.incomeTotal === 'number') {
      return wallet.incomeTotal;
    }
    return transactions.value
      .filter((t) => t.walletId === walletId && t.amount > 0)
      .reduce((acc, curr) => acc + curr.amount, 0);
  };

  const getWalletExpense = (walletId: string) => {
    const wallet = wallets.value.find((item) => item.id === walletId);
    if (wallet && typeof wallet.expenseTotal === 'number') {
      return wallet.expenseTotal;
    }
    return transactions.value
      .filter((t) => t.walletId === walletId && t.amount < 0)
      .reduce((acc, curr) => acc + Math.abs(curr.amount), 0);
  };

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

    const data: WeeklyBucket[] = [];
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
      .map((cat) => {
        const amount = catMap[cat] || 0;
        return {
          name: cat,
          amount,
          percent: totalExp === 0 ? '0%' : `${Math.round((amount / totalExp) * 100)}%`,
          color: colorMap[cat] || 'bg-blue-500',
          icon: iconMap.get(cat) || 'fa-tag',
        };
      })
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
      .map((cat) => {
        const amount = catMap[cat] || 0;
        return {
          name: cat,
          amount,
          percent: totalInc === 0 ? '0%' : `${Math.round((amount / totalInc) * 100)}%`,
          color: colorMap[cat] || 'bg-lime-400',
          icon: iconMap.get(cat) || 'fa-tag',
        };
      })
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
    new Date(statsDate.value).toLocaleString(preferredLocale.value, {
      month: 'long',
      year: 'numeric',
    })
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
    void loadAnalytics(1);
  };

  const handleDatePickerChange = (event: Event) => {
    const target = event.target as HTMLInputElement;
    if (!target.value) return;
    const [year, month] = target.value.split('-');
    statsDate.value = new Date(Number(year), Number(month) - 1, 1).getTime();
    void loadAnalytics(1);
  };

  const fetchAllTransactionsForMonth = async (monthKey: string) => {
    if (isOffline()) {
      return sortTransactionsByDate(getTransactionsForMonth(monthKey));
    }
    const all: TransactionItem[] = [];
    const pageSize = 50;
    let page = 1;
    let total = 0;

    while (true) {
      const data = await $fetch<{
        transactions: TransactionPayload[];
        total: number;
      }>(`/api/transactions?month=${monthKey}&page=${page}&limit=${pageSize}`);
      const items = mapTransactions(data.transactions || []);
      if (page === 1) {
        total = Number(data.total || 0);
      }
      all.push(...items);
      if (all.length >= total || items.length === 0) break;
      page += 1;
    }

    return all;
  };

  const handleDownloadExcel = async () => {
    let items: TransactionItem[] = [];
    try {
      items = await fetchAllTransactionsForMonth(monthInputValue.value);
    } catch (error) {
      setFlash(resolveErrorMessage(error, t('loadFailed')), 'error');
      return;
    }

    if (items.length === 0) {
      setFlash(t('noDataToExport'), 'info');
      return;
    }

    const headers = ['Tanggal', 'Judul', 'Kategori', 'Jumlah', 'Tipe', 'Dompet'];
    const csvContent = [
      headers.join(','),
      ...items.map((t) =>
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
    await disablePushNotifications();
    await $fetch('/api/auth/logout', { method: 'POST' });
    clearData();
    await navigateTo('/auth/login');
  };

  return {
    currentUser,
    displayName,
    displayEmail,
    initials,
    avatarUrl,
    notificationsEnabled,
    darkModeEnabled,
    preferredCurrency,
    preferredLanguage,
    currencyOptions,
    languageOptions,
    t,
    notifications,
    notificationsHasMore,
    notificationStyles,
    bootstrapping,
    flashMessage,
    wallets,
    expenseCategories,
    incomeCategories,
    transactions,
    analyticsSummary,
    analyticsWeekly,
    analyticsTransactions,
    analyticsTotal,
    analyticsPage,
    analyticsPageSize,
    analyticsLoading,
    analyticsTableLoading,
    showAddModal,
    showWalletModal,
    showCategoryModal,
    showDeleteWalletModal,
    showDeleteCategoryModal,
    showProfileModal,
    showPasswordModal,
    showNotifications,
    hasUnread,
    editingWallet,
    walletToDelete,
    categoryToDelete,
    editingCategory,
    profileForm,
    passwordForm,
    formData,
    walletFormData,
    categoryForm,
    statsDate,
    formatRupiah,
    formatShortRupiah,
    toggleNotifications,
    markAllNotificationsRead,
    markNotificationRead,
    refreshNotifications,
    loadMoreNotifications,
    ensureLoaded,
    refreshData,
    setFlash,
    clearFlash,
    toggleNotificationsPreference,
    toggleDarkModePreference,
    setCurrencyPreference,
    setLanguagePreference,
    openProfileModal,
    closeProfileModal,
    handleSaveProfile,
    openPasswordModal,
    closePasswordModal,
    handleChangePassword,
    handleOpenAddWallet,
    handleOpenEditWallet,
    handleSaveWallet,
    requestDeleteWallet,
    confirmDeleteWallet,
    cancelDeleteWallet,
    loadAnalytics,
    fetchAnalyticsTransactions,
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
