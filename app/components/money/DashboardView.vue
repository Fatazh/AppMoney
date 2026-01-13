<script setup lang="ts">
import { computed, ref } from 'vue';

const router = useRouter();
const {
  totalBalance,
  dashboardIncome,
  dashboardExpense,
  weeklyChart,
  formatRupiah,
  topTransactions,
  currentMonthTransactions,
  t,
} = useMoneyManager();

const weeklyChartSafe = computed(
  () => weeklyChart?.value ?? { data: [], maxVal: 1, daysInMonth: 0 }
);

const hasWeeklyData = computed(() =>
  weeklyChartSafe.value.data.some((d) => d.income > 0 || d.expense > 0)
);

const activeWeekIndex = ref<number | null>(null);
const activeType = ref<'income' | 'expense' | null>(null);

const selectedWeek = computed(() =>
  activeWeekIndex.value === null ? null : weeklyChartSafe.value.data[activeWeekIndex.value]
);

const activeTypeLabel = computed(() => {
  if (!activeType.value) return '';
  return activeType.value === 'income' ? t('incomeBadge') : t('expenseBadge');
});

const detailTransactions = computed(() => {
  if (!selectedWeek.value || !activeType.value) return [];
  const { startDay, endDay } = selectedWeek.value;
  return currentMonthTransactions.value
    .filter((t) => {
      const day = new Date(t.date).getDate();
      const isType = activeType.value === 'income' ? t.amount > 0 : t.amount < 0;
      return day >= startDay && day <= endDay && isType;
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
});

const selectWeek = (index: number, type: 'income' | 'expense') => {
  activeWeekIndex.value = index;
  activeType.value = type;
};

const clearSelection = () => {
  activeWeekIndex.value = null;
  activeType.value = null;
};

const selectedTransaction = ref<{
  id: string;
  title: string;
  category: string;
  type: 'expense' | 'income';
  date: string;
  amount: number;
  note: string | null;
  pricePerUnit: number | null;
  promoType: string | null;
  promoValue: number | null;
  promoBuyX: number | null;
  promoGetY: number | null;
  shoppingType?: string | null;
  incomePeriod?: string | null;
  wallet: string;
} | null>(null);

const openTransactionDetail = (transaction: typeof selectedTransaction.value) => {
  if (!transaction) return;
  selectedTransaction.value = transaction;
};

const closeTransactionDetail = () => {
  selectedTransaction.value = null;
};

const formatPromo = (transaction: typeof selectedTransaction.value) => {
  if (!transaction?.promoType) return '-';
  if (transaction.promoType === 'PERCENT') {
    return t('discountPercent', { value: transaction.promoValue ?? 0 });
  }
  if (transaction.promoType === 'FIXED') {
    return t('discountNominal', { value: formatRupiah(transaction.promoValue ?? 0) });
  }
  if (transaction.promoType === 'BUY_X_GET_Y') {
    return t('buyXGetY', { buy: transaction.promoBuyX ?? 0, get: transaction.promoGetY ?? 0 });
  }
  return '-';
};

const formatSatuan = (transaction: typeof selectedTransaction.value) => {
  if (!transaction?.pricePerUnit) return '-';
  return formatRupiah(transaction.pricePerUnit);
};

const formatNote = (transaction: typeof selectedTransaction.value) =>
  transaction?.note?.trim() ? transaction.note : '-';

const formatShoppingType = (transaction: typeof selectedTransaction.value) =>
  transaction?.shoppingType?.trim() ? transaction.shoppingType : null;

const goToTransactions = () => {
  router.push({ path: '/analytics', query: { section: 'transactions' } });
};
</script>

<template>
  <div class="md:grid md:grid-cols-12 md:gap-8">
    <div class="md:col-span-7 lg:col-span-8 space-y-8">
      <div
        class="w-full bg-slate-900 rounded-3xl p-6 md:p-8 text-white shadow-lg shadow-slate-200 relative overflow-hidden animate-fade-in"
      >
        <div class="absolute -right-4 -top-4 w-32 h-32 bg-lime-400 opacity-20 rounded-full blur-2xl"></div>
        <div class="absolute -left-4 -bottom-4 w-24 h-24 bg-blue-500 opacity-20 rounded-full blur-xl"></div>
        <p class="text-slate-300 text-sm mb-1">{{ t('totalBalance') }}</p>
        <h1 class="text-3xl md:text-4xl font-bold mb-6 text-lime-400 tracking-tight">
          {{ formatRupiah(totalBalance) }}
        </h1>
        <div class="flex justify-between items-center bg-white/10 p-4 rounded-2xl backdrop-blur-sm">
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-full bg-lime-400/20 flex items-center justify-center text-lime-400">
              <i class="fas fa-arrow-down text-sm"></i>
            </div>
            <div>
              <p class="text-xs text-slate-300">{{ t('income') }}</p>
              <p class="font-semibold text-sm">{{ formatRupiah(dashboardIncome) }}</p>
            </div>
          </div>
          <div class="w-[1px] h-8 bg-white/20"></div>
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white">
              <i class="fas fa-arrow-up text-sm"></i>
            </div>
            <div>
              <p class="text-xs text-slate-300">{{ t('expense') }}</p>
              <p class="font-semibold text-sm">{{ formatRupiah(dashboardExpense) }}</p>
            </div>
          </div>
        </div>
      </div>

      <div class="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm mb-6 animate-fade-in">
        <div class="flex justify-between items-center mb-4">
          <h3 class="font-bold text-slate-900 text-sm">{{ t('weeklyCashFlow') }}</h3>
          <div class="flex gap-3">
            <div class="flex items-center gap-1">
              <div class="w-2 h-2 rounded-full bg-lime-400"></div>
              <span class="text-[10px] text-gray-500">{{ t('incoming') }}</span>
            </div>
            <div class="flex items-center gap-1">
              <div class="w-2 h-2 rounded-full bg-slate-900 mm-expense-dot"></div>
              <span class="text-[10px] text-gray-500">{{ t('outgoing') }}</span>
            </div>
          </div>
        </div>

        <div v-if="hasWeeklyData" class="pb-2">
          <div class="flex items-end h-40 gap-4 px-1">
            <div
              v-for="(d, index) in weeklyChartSafe.data"
              :key="d.week"
              class="flex flex-col items-center gap-3 flex-1 min-w-0 group cursor-pointer h-full"
            >
              <div class="flex items-end gap-1 flex-1 relative">
                <div
                  class="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 hidden group-hover:block z-10"
                >
                  <div class="bg-slate-800 text-white text-[10px] p-2 rounded-lg shadow-lg whitespace-nowrap">
                    <p class="text-lime-400 font-bold">{{ t('weeklyTooltipIncome', { count: d.income }) }}</p>
                    <p class="text-white font-bold">{{ t('weeklyTooltipExpense', { count: d.expense }) }}</p>
                    <p class="text-gray-400 text-center mt-1 border-t border-gray-600 pt-1">
                      {{ t('weekRange', { week: d.week, start: d.startDay, end: d.endDay }) }}
                    </p>
                  </div>
                </div>
                <div
                  class="w-2 rounded-t-sm bg-lime-400 transition-all duration-500 hover:bg-lime-300"
                  @click.stop="selectWeek(index, 'income')"
                  :style="{
                    height: `${(d.income / weeklyChartSafe.maxVal) * 100}%`,
                    minHeight: d.income > 0 ? '4px' : '0',
                  }"
                ></div>
                <div
                  class="w-2 rounded-t-sm bg-slate-900 transition-all duration-500 hover:bg-slate-700 mm-expense-bar"
                  @click.stop="selectWeek(index, 'expense')"
                  :style="{
                    height: `${(d.expense / weeklyChartSafe.maxVal) * 100}%`,
                    minHeight: d.expense > 0 ? '4px' : '0',
                  }"
                ></div>
              </div>
              <div class="flex flex-col items-center leading-tight">
                <span class="text-[10px] text-gray-400 font-semibold">{{ t('weekShort', { week: d.week }) }}</span>
                <span class="text-[9px] text-gray-300">{{ d.startDay }}-{{ d.endDay }}</span>
              </div>
            </div>
          </div>
        </div>
        <div v-else class="text-center py-10 text-gray-400 border border-dashed border-gray-200 rounded-2xl">
          <p>{{ t('noTransactionsThisMonth') }}</p>
        </div>

        <div v-if="selectedWeek && activeType" class="mt-5 border-t border-gray-100 pt-4">
          <div class="flex items-center justify-between mb-3">
            <div>
              <h4 class="text-sm font-bold text-slate-900">
                {{ t('weeklyDetailTitle', { week: selectedWeek.week, type: activeTypeLabel }) }}
              </h4>
              <p class="text-[11px] text-gray-400">
                {{ t('weeklyRangeLabel', { start: selectedWeek.startDay, end: selectedWeek.endDay }) }}
              </p>
            </div>
            <button
              class="text-xs font-semibold text-gray-400 hover:text-slate-600"
              @click="clearSelection"
            >
              {{ t('close') }}
            </button>
          </div>
          <div class="space-y-3 max-h-64 overflow-y-auto scrollbar-hide pr-1">
            <div
              v-for="t in detailTransactions"
              :key="t.id"
              class="flex items-center justify-between p-3 bg-gray-50 rounded-2xl border border-gray-100"
            >
              <div class="flex items-center gap-3">
                <div
                  class="w-9 h-9 rounded-xl flex items-center justify-center"
                  :class="t.amount > 0 ? 'bg-lime-50 text-lime-600' : 'bg-slate-100 text-slate-700'"
                >
                  <i class="fas text-sm" :class="t.icon"></i>
                </div>
                <div>
                  <p class="text-sm font-semibold text-slate-800">{{ t.title }}</p>
                  <p class="text-[10px] text-gray-400">{{ t.category }} - {{ t.date }}</p>
                </div>
              </div>
              <span class="text-sm font-bold" :class="t.amount > 0 ? 'text-lime-600' : 'text-slate-900'">
                {{ t.amount > 0 ? '+' : '' }}{{ formatRupiah(t.amount) }}
              </span>
            </div>
            <div v-if="detailTransactions.length === 0" class="text-center py-6 text-gray-400">
              <p>{{ t('noTransactionsThisWeek') }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="md:col-span-5 lg:col-span-4 mt-8 md:mt-0">
      <div class="flex justify-between items-center mb-4 animate-fade-in">
        <h3 class="font-bold text-slate-900 text-lg">{{ t('transactionsThisMonth') }}</h3>
        <button class="text-lime-600 text-sm font-semibold" @click="goToTransactions">{{ t('viewAll') }}</button>
      </div>
      <div class="space-y-6 animate-slide-up-content">
        <div v-if="topTransactions.length > 0">
          <div
            v-for="t in topTransactions"
            :key="t.id"
            class="p-4 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow cursor-pointer mb-1"
            @click="openTransactionDetail(t)"
          >
            <div class="flex items-start gap-4">
              <div
                class="w-12 h-12 rounded-xl flex items-center justify-center"
                :class="t.amount > 0 ? 'bg-lime-50 text-lime-600' : 'bg-slate-50 text-slate-900'"
              >
                <i class="fas text-lg" :class="t.icon"></i>
              </div>
              <div class="min-w-0 flex-1">
                <div class="flex items-start justify-between gap-3">
                  <div class="min-w-0">
                    <h4 class="font-bold text-slate-900 truncate">{{ t.title }}</h4>
                    <p class="text-xs text-gray-400 mt-1">{{ t.category }} - {{ t.date }}</p>
                  </div>
                  <span class="font-bold shrink-0" :class="t.amount > 0 ? 'text-lime-600' : 'text-slate-900'">
                    {{ t.amount > 0 ? '+' : '' }}{{ formatRupiah(t.amount) }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div v-else class="text-center py-8 text-gray-400 border border-dashed rounded-xl border-gray-200">
          <p>{{ t('noTransactionsThisMonth') }}</p>
        </div>
      </div>
    </div>

    <teleport to="body">
      <div
        v-if="selectedTransaction"
        class="fixed inset-0 z-[70] flex items-end md:items-center justify-center"
      >
        <div class="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" @click="closeTransactionDetail"></div>
        <div class="relative z-10 bg-white w-full sm:w-11/12 md:max-w-lg rounded-t-3xl sm:rounded-3xl shadow-2xl animate-slide-up md:animate-fade-in">
          <div class="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
            <div>
              <p class="text-xs text-gray-400">{{ t('detailTransactions') }}</p>
              <h3 class="text-lg font-bold text-slate-900">{{ selectedTransaction.title }}</h3>
            </div>
            <button
              class="p-2 bg-gray-100 rounded-full text-gray-500 hover:bg-gray-200"
              @click="closeTransactionDetail"
            >
              <i class="fas fa-times"></i>
            </button>
          </div>
          <div class="px-6 py-5 space-y-3">
            <template v-if="selectedTransaction.type === 'income'">
              <div class="flex justify-between items-center">
                <span class="text-xs text-gray-400">{{ t('type') }}</span>
                <span class="text-xs font-bold px-2.5 py-1 rounded-full bg-lime-50 text-lime-600">
                  {{ t('incomeBadge') }}
                </span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-xs text-gray-400">{{ t('date') }}</span>
                <span class="text-sm font-semibold text-slate-700">{{ selectedTransaction.date }}</span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-xs text-gray-400">{{ t('incomeName') }}</span>
                <span class="text-sm font-semibold text-slate-700 text-right">{{ selectedTransaction.title }}</span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-xs text-gray-400">{{ t('categoryLabel') }}</span>
                <span class="text-sm font-semibold text-slate-700 text-right">{{ selectedTransaction.category }}</span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-xs text-gray-400">{{ t('walletIn') }}</span>
                <span class="text-sm font-semibold text-slate-700">{{ selectedTransaction.wallet }}</span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-xs text-gray-400">{{ t('amount') }}</span>
                <span class="text-sm font-bold text-slate-900">
                  {{ formatRupiah(Math.abs(selectedTransaction.amount)) }}
                </span>
              </div>
            </template>
            <template v-else>
              <div class="flex justify-between items-center">
                <span class="text-xs text-gray-400">{{ t('type') }}</span>
                <span class="text-xs font-bold px-2.5 py-1 rounded-full bg-red-50 text-red-600">
                  {{ t('expenseBadge') }}
                </span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-xs text-gray-400">{{ t('name') }}</span>
                <span class="text-sm font-semibold text-slate-700 text-right">{{ selectedTransaction.title }}</span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-xs text-gray-400">{{ t('date') }}</span>
                <span class="text-sm font-semibold text-slate-700">{{ selectedTransaction.date }}</span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-xs text-gray-400">{{ t('note') }}</span>
                <span class="text-sm font-semibold text-slate-700 text-right">{{ formatNote(selectedTransaction) }}</span>
              </div>
              <div v-if="formatShoppingType(selectedTransaction)" class="flex justify-between items-center">
                <span class="text-xs text-gray-400">{{ t('shoppingTypeLabel') }}</span>
                <span class="text-sm font-semibold text-slate-700 text-right">
                  {{ formatShoppingType(selectedTransaction) }}
                </span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-xs text-gray-400">{{ t('nominal') }}</span>
                <span class="text-sm font-bold text-slate-900">
                  {{ formatRupiah(Math.abs(selectedTransaction.amount)) }}
                </span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-xs text-gray-400">{{ t('unitPrice') }}</span>
                <span class="text-sm font-semibold text-slate-700">{{ formatSatuan(selectedTransaction) }}</span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-xs text-gray-400">{{ t('promo') }}</span>
                <span class="text-sm font-semibold text-slate-700">{{ formatPromo(selectedTransaction) }}</span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-xs text-gray-400">{{ t('sourceWallet') }}</span>
                <span class="text-sm font-semibold text-slate-700">{{ selectedTransaction.wallet }}</span>
              </div>
            </template>
          </div>
          <div class="px-6 pb-6">
            <button
              class="w-full bg-slate-900 text-white py-3 rounded-xl font-bold hover:bg-slate-800 transition-colors"
              @click="closeTransactionDetail"
            >
              {{ t('close') }}
            </button>
          </div>
        </div>
      </div>
    </teleport>
  </div>
</template>
