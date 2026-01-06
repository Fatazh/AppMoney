<script setup lang="ts">
import { computed, ref, onMounted, watch } from 'vue';

const route = useRoute();
const detailRef = ref<HTMLElement | null>(null);

const {
  monthName,
  monthInputValue,
  changeMonth,
  handleDatePickerChange,
  analyticsSummary,
  analyticsWeekly,
  analyticsTransactions,
  analyticsTotal,
  analyticsPage,
  analyticsPageSize,
  analyticsTableLoading,
  loadAnalytics,
  fetchAnalyticsTransactions,
  formatRupiah,
  handleDownloadExcel,
  handlePrint,
  t,
} = useMoneyManager();

const totalMonthIncome = computed(() => analyticsSummary.value?.income || 0);
const totalMonthExpense = computed(() => analyticsSummary.value?.expense || 0);
const totalMonthNet = computed(() => analyticsSummary.value?.net || 0);

const totalFlow = computed(() => totalMonthIncome.value + totalMonthExpense.value);
const incomePercent = computed(() =>
  totalFlow.value === 0 ? 0 : (totalMonthIncome.value / totalFlow.value) * 100
);
const expensePercent = computed(() =>
  totalFlow.value === 0 ? 0 : (totalMonthExpense.value / totalFlow.value) * 100
);
const pieStyle = computed(() => {
  if (totalFlow.value === 0) {
    return { background: 'conic-gradient(#e5e7eb 0 100%)' };
  }
  const income = incomePercent.value;
  return { background: `conic-gradient(#a3e635 0 ${income}%, #0f172a ${income}% 100%)` };
});

const weeklyChartSafe = computed(
  () => analyticsWeekly.value ?? { data: [], maxVal: 1, daysInMonth: 0 }
);

const hasWeeklyData = computed(() =>
  weeklyChartSafe.value.data.some((d) => d.income > 0 || d.expense > 0)
);

const totalPages = computed(() =>
  Math.max(1, Math.ceil(analyticsTotal.value / analyticsPageSize))
);

const pagedTransactions = computed(() => analyticsTransactions.value);

const pageStart = computed(() =>
  analyticsTotal.value === 0
    ? 0
    : (analyticsPage.value - 1) * analyticsPageSize + 1
);

const pageEnd = computed(() =>
  Math.min(analyticsPage.value * analyticsPageSize, analyticsTotal.value)
);

const goPrevPage = () => {
  if (analyticsPage.value <= 1) return;
  void fetchAnalyticsTransactions(monthInputValue.value, analyticsPage.value - 1);
};

const goNextPage = () => {
  if (analyticsPage.value >= totalPages.value) return;
  void fetchAnalyticsTransactions(monthInputValue.value, analyticsPage.value + 1);
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

const scrollToDetail = () => {
  if (!detailRef.value) return;
  detailRef.value.scrollIntoView({ behavior: 'smooth', block: 'start' });
};

onMounted(() => {
  void loadAnalytics(1);
  if (route.query.section === 'transactions') {
    scrollToDetail();
  }
});

watch(
  () => route.query.section,
  (value) => {
    if (value === 'transactions') {
      scrollToDetail();
    }
  }
);

</script>

<template>
  <div class="animate-fade-in pb-32 md:pb-32 md:grid md:grid-cols-12 md:gap-6 md:h-full md:overflow-y-auto pt-6">
    <div class="md:col-span-8 flex flex-col">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-2xl font-bold text-slate-900">{{ t('analytics') }}</h2>
        <div class="flex items-center gap-2 bg-white border border-gray-200 rounded-xl p-1 relative">
          <button @click="changeMonth(-1)" class="p-1 hover:bg-gray-100 rounded-lg text-slate-600 z-10">
            <i class="fas fa-chevron-left"></i>
          </button>
          <div class="relative min-w-[120px] text-center">
            <span class="text-sm font-bold text-slate-900 pointer-events-none">{{ monthName }}</span>
            <input
              type="month"
              :value="monthInputValue"
              @change="handleDatePickerChange"
              class="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
            />
          </div>
          <button @click="changeMonth(1)" class="p-1 hover:bg-gray-100 rounded-lg text-slate-600 z-10">
            <i class="fas fa-chevron-right"></i>
          </button>
        </div>
      </div>

      <div class="bg-white rounded-3xl p-6 border border-gray-100 shadow-lg shadow-gray-100 mb-8 order-1">
        <div class="flex flex-col gap-5 mb-6">
          <div class="flex items-start justify-between">
            <div>
              <h3 class="font-bold text-slate-900">{{ t('monthSummary') }}</h3>
              <p class="text-xs text-gray-400">{{ t('monthSummarySubtitle') }}</p>
            </div>
            <div class="text-right">
              <p class="text-xs text-gray-400">{{ t('net') }}</p>
              <p
                class="text-lg font-bold"
                :class="totalMonthNet >= 0 ? 'text-lime-600' : 'text-red-500'"
              >
                {{ formatRupiah(totalMonthNet) }}
              </p>
            </div>
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div class="rounded-2xl border border-lime-100 bg-lime-50 p-4">
              <p class="text-xs font-semibold text-lime-700">{{ t('income') }}</p>
              <p class="text-lg font-bold text-lime-700 mt-1">{{ formatRupiah(totalMonthIncome) }}</p>
            </div>
            <div class="rounded-2xl border border-slate-100 bg-slate-50 p-4">
              <p class="text-xs font-semibold text-slate-500">{{ t('expense') }}</p>
              <p class="text-lg font-bold text-slate-900 mt-1">{{ formatRupiah(totalMonthExpense) }}</p>
            </div>
          </div>
        </div>
      </div>

      <div class="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm mb-8 order-2">
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
              v-for="d in weeklyChartSafe.data"
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
                  :style="{
                    height: `${(d.income / weeklyChartSafe.maxVal) * 100}%`,
                    minHeight: d.income > 0 ? '4px' : '0',
                  }"
                ></div>
                <div
                  class="w-2 rounded-t-sm bg-slate-900 transition-all duration-500 hover:bg-slate-700 mm-expense-bar"
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
        <div v-else class="text-center py-8 text-gray-400 border border-dashed rounded-2xl border-gray-200">
          <p>{{ t('noTransactionsThisMonth') }}</p>
        </div>
      </div>

      <div class="flex gap-3 mb-6 order-5 md:order-3">
        <button
          @click="handleDownloadExcel"
          class="flex-1 flex items-center justify-center gap-2 py-3 bg-green-50 text-green-700 border border-green-200 rounded-xl text-sm font-bold hover:bg-green-100 transition-colors"
        >
          <i class="fas fa-table"></i>
          {{ t('downloadCsv') }}
        </button>
        <button
          @click="handlePrint"
          class="flex-1 flex items-center justify-center gap-2 py-3 bg-red-50 text-red-700 border border-red-200 rounded-xl text-sm font-bold hover:bg-red-100 transition-colors"
        >
          <i class="fas fa-file-lines"></i>
          {{ t('downloadPdf') }}
        </button>
      </div>

      <div class="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm order-3 md:hidden">
        <div class="flex items-center justify-between mb-4">
          <div>
            <h4 class="font-bold text-slate-900">{{ t('comparisonTitle') }}</h4>
            <p class="text-xs text-gray-400">{{ t('comparisonSubtitle') }}</p>
          </div>
          <span class="text-xs text-gray-400">{{ monthName }}</span>
        </div>
        <div class="flex items-center justify-center">
          <div class="relative w-44 h-44">
            <div class="w-full h-full rounded-full" :style="pieStyle"></div>
            <div
              class="absolute inset-5 rounded-full bg-white border border-gray-100 flex flex-col items-center justify-center"
            >
              <span class="text-[10px] text-gray-400">{{ t('totalLabel') }}</span>
              <span class="text-sm font-bold text-slate-900">{{ formatRupiah(totalFlow) }}</span>
            </div>
          </div>
        </div>
        <div class="mt-4 grid grid-cols-2 gap-3">
          <div class="rounded-xl border border-lime-100 bg-lime-50 p-3">
            <div class="flex items-center gap-2">
              <div class="w-2 h-2 rounded-full bg-lime-400"></div>
              <span class="text-xs font-semibold text-lime-700">{{ t('income') }}</span>
            </div>
            <p class="text-sm font-bold text-slate-900 mt-1">{{ formatRupiah(totalMonthIncome) }}</p>
            <p class="text-[10px] text-gray-400">{{ Math.round(incomePercent) }}%</p>
          </div>
          <div class="rounded-xl border border-slate-100 bg-slate-50 p-3">
            <div class="flex items-center gap-2">
              <div class="w-2 h-2 rounded-full bg-slate-900"></div>
              <span class="text-xs font-semibold text-slate-600">{{ t('expense') }}</span>
            </div>
            <p class="text-sm font-bold text-slate-900 mt-1">{{ formatRupiah(totalMonthExpense) }}</p>
            <p class="text-[10px] text-gray-400">{{ Math.round(expensePercent) }}%</p>
          </div>
        </div>
        <div v-if="totalFlow === 0" class="text-center text-xs text-gray-400 mt-4">
          {{ t('noTransactionsThisMonth') }}
        </div>
      </div>

      <div
        ref="detailRef"
        class="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm mb-6 order-4 md:order-4"
      >
        <div class="flex items-center justify-between mb-4">
          <div>
            <h3 class="font-bold text-slate-900">{{ t('transactionsDetailTitle') }}</h3>
            <p class="text-xs text-gray-400">{{ t('transactionsDetailSubtitle') }}</p>
          </div>
          <span class="text-xs text-gray-400">{{ t('transactionsCount', { count: analyticsTotal }) }}</span>
        </div>
        <div class="overflow-x-auto">
          <table class="min-w-full text-left">
            <thead>
              <tr class="text-[10px] uppercase tracking-widest text-gray-400 border-b border-gray-100">
                <th class="py-3 px-3">{{ t('tableDate') }}</th>
                <th class="py-3 px-3">{{ t('tableName') }}</th>
                <th class="py-3 px-3">{{ t('tableCategory') }}</th>
                <th class="py-3 px-3">{{ t('tableType') }}</th>
                <th class="py-3 px-3">{{ t('tableWallet') }}</th>
                <th class="py-3 px-3 text-right">{{ t('tableAmount') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="analyticsTableLoading">
                <td colspan="6" class="py-6 text-center text-sm text-gray-400">
                  <i class="fas fa-spinner fa-spin text-lime-500 mr-2"></i>
                  {{ t('loading') }}
                </td>
              </tr>
              <tr v-else-if="pagedTransactions.length === 0">
                <td colspan="6" class="py-6 text-center text-sm text-gray-400">
                  {{ t('noTransactionsTable') }}
                </td>
              </tr>
              <template v-else>
                <tr
                  v-for="t in pagedTransactions"
                  :key="t.id"
                  class="border-b border-gray-100 last:border-b-0 cursor-pointer hover:bg-gray-50"
                  @click="openTransactionDetail(t)"
                >
                  <td class="py-3 px-3 text-xs text-gray-500 whitespace-nowrap">{{ t.date }}</td>
                  <td class="py-3 px-3">
                    <div class="flex items-center gap-2">
                      <div
                        class="w-7 h-7 rounded-lg flex items-center justify-center"
                        :class="t.type === 'income' ? 'bg-lime-50 text-lime-600' : 'bg-slate-50 text-slate-900'"
                      >
                        <i class="fas text-[11px]" :class="t.icon"></i>
                      </div>
                      <span class="text-sm font-semibold text-slate-900 truncate">{{ t.title }}</span>
                    </div>
                  </td>
                  <td class="py-3 px-3 text-xs text-gray-500">{{ t.category }}</td>
                  <td class="py-3 px-3">
                      <span
                        class="text-[10px] font-bold px-2.5 py-1 rounded-full"
                        :class="t.type === 'income' ? 'bg-lime-50 text-lime-700' : 'bg-red-50 text-red-600'"
                      >
                        {{ t.type === 'income' ? t('incomeBadge') : t('expenseBadge') }}
                      </span>
                    </td>
                  <td class="py-3 px-3 text-xs text-gray-500">{{ t.wallet || '-' }}</td>
                  <td class="py-3 px-3 text-right font-bold" :class="t.type === 'income' ? 'text-lime-600' : 'text-slate-900'">
                    {{ t.type === 'income' ? '+' : '-' }}{{ formatRupiah(Math.abs(t.amount)) }}
                  </td>
                </tr>
              </template>
            </tbody>
          </table>
        </div>
        <div class="flex items-center justify-between mt-4 text-xs text-gray-400">
          <span>{{ t('showingRange', { start: pageStart, end: pageEnd, total: analyticsTotal }) }}</span>
          <div class="flex items-center gap-2">
            <button
              class="px-3 py-1 rounded-lg border border-gray-200 text-gray-500 hover:text-slate-900 hover:border-gray-300 disabled:opacity-50"
              :disabled="analyticsTableLoading || analyticsPage === 1"
              @click="goPrevPage"
            >
              {{ t('prev') }}
            </button>
            <span class="text-xs font-semibold text-slate-700">{{ t('pageLabel', { current: analyticsPage, total: totalPages }) }}</span>
            <button
              class="px-3 py-1 rounded-lg border border-gray-200 text-gray-500 hover:text-slate-900 hover:border-gray-300 disabled:opacity-50"
              :disabled="analyticsTableLoading || analyticsPage === totalPages"
              @click="goNextPage"
            >
              {{ t('next') }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="hidden md:block md:col-span-4">
      <div class="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm md:mt-2">
        <div class="flex items-center justify-between mb-4">
          <div>
            <h4 class="font-bold text-slate-900">{{ t('comparisonTitle') }}</h4>
            <p class="text-xs text-gray-400">{{ t('comparisonSubtitle') }}</p>
          </div>
          <span class="text-xs text-gray-400">{{ monthName }}</span>
        </div>
        <div class="flex items-center justify-center">
          <div class="relative w-44 h-44">
            <div class="w-full h-full rounded-full" :style="pieStyle"></div>
            <div
              class="absolute inset-5 rounded-full bg-white border border-gray-100 flex flex-col items-center justify-center"
            >
              <span class="text-[10px] text-gray-400">{{ t('totalLabel') }}</span>
              <span class="text-sm font-bold text-slate-900">{{ formatRupiah(totalFlow) }}</span>
            </div>
          </div>
        </div>
        <div class="mt-4 grid grid-cols-2 gap-3">
          <div class="rounded-xl border border-lime-100 bg-lime-50 p-3">
            <div class="flex items-center gap-2">
              <div class="w-2 h-2 rounded-full bg-lime-400"></div>
              <span class="text-xs font-semibold text-lime-700">{{ t('income') }}</span>
            </div>
            <p class="text-sm font-bold text-slate-900 mt-1">{{ formatRupiah(totalMonthIncome) }}</p>
            <p class="text-[10px] text-gray-400">{{ Math.round(incomePercent) }}%</p>
          </div>
          <div class="rounded-xl border border-slate-100 bg-slate-50 p-3">
            <div class="flex items-center gap-2">
              <div class="w-2 h-2 rounded-full bg-slate-900"></div>
              <span class="text-xs font-semibold text-slate-600">{{ t('expense') }}</span>
            </div>
            <p class="text-sm font-bold text-slate-900 mt-1">{{ formatRupiah(totalMonthExpense) }}</p>
            <p class="text-[10px] text-gray-400">{{ Math.round(expensePercent) }}%</p>
          </div>
        </div>
        <div v-if="totalFlow === 0" class="text-center text-xs text-gray-400 mt-4">
          {{ t('noTransactionsThisMonth') }}
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
              <div v-if="selectedTransaction.incomePeriod" class="flex justify-between items-center">
                <span class="text-xs text-gray-400">{{ t('incomePeriodLabel') }}</span>
                <span class="text-sm font-semibold text-slate-700">{{ selectedTransaction.incomePeriod }}</span>
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
