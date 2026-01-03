<script setup lang="ts">
import { watch, computed, ref } from 'vue';

const {
  showAddModal,
  formData,
  expenseCategories,
  incomeCategories,
  wallets,
  formatRupiah,
  isOnline,
  ocrLoading,
  scanReceipt,
  handleSaveTransaction,
  resetTransactionForm,
  setFlash,
  t,
} = useMoneyManager();

resetTransactionForm();

const showCategoryPicker = ref(false);
const receiptInput = ref<HTMLInputElement | null>(null);

const ocrDisabled = computed(() => !isOnline.value || ocrLoading.value);

const triggerReceiptPicker = () => {
  if (!isOnline.value) {
    setFlash(t('scanReceiptDisabled'), 'info');
    return;
  }
  receiptInput.value?.click();
};

const handleReceiptChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (!file) return;
  void scanReceipt(file);
  target.value = '';
};

const categoryOptions = computed(() =>
  formData.value.type === 'expense' ? expenseCategories.value : incomeCategories.value
);

const selectedCategory = computed(() =>
  categoryOptions.value.find((cat) => cat.id === formData.value.category)
);

const selectedCategoryIcon = computed(() => {
  return selectedCategory.value?.icon || 'fa-tag';
});

const selectedCategoryLabel = computed(() => selectedCategory.value?.name || t('selectCategory'));

const selectCategory = (categoryId: string) => {
  formData.value.category = categoryId;
  showCategoryPicker.value = false;
};

const selectedWallet = computed(() =>
  wallets.value.find((wallet) => wallet.id === formData.value.sourceWallet)
);

const insufficientFunds = computed(() => {
  if (formData.value.type !== 'expense') return false;
  if (!selectedWallet.value) return false;
  if (formData.value.totalAmount <= 0) return false;
  return selectedWallet.value.balance < formData.value.totalAmount;
});

watch(
  () => formData.value.type,
  (newType) => {
    if (newType === 'expense') {
      formData.value.category = expenseCategories.value[0]?.id || '';
      formData.value.sourceWallet = wallets.value[0]?.id || '';
    } else {
      formData.value.category = incomeCategories.value[0]?.id || '';
      formData.value.destWallet = wallets.value[0]?.id || '';
    }
    showCategoryPicker.value = false;
  },
  { immediate: true }
);

watch(
  () => [
    formData.value.type,
    formData.value.quantity,
    formData.value.pricePerItem,
    formData.value.hasPromo,
    formData.value.promoType,
    formData.value.promoValue,
    formData.value.buyX,
    formData.value.getY,
    formData.value.incomeAmount,
  ],
  () => {
    if (formData.value.type === 'expense') {
      const qty = parseFloat(String(formData.value.quantity)) || 0;
      const price = parseFloat(String(formData.value.pricePerItem)) || 0;
      let baseTotal = qty * price;
      let finalTotal = baseTotal;

      if (formData.value.hasPromo) {
        const promoVal = parseFloat(String(formData.value.promoValue)) || 0;
        if (formData.value.promoType === 'percent') {
          finalTotal = baseTotal - baseTotal * (promoVal / 100);
        } else if (formData.value.promoType === 'nominal') {
          finalTotal = baseTotal - promoVal;
        } else if (formData.value.promoType === 'buyXgetY') {
          const buyX = Math.max(0, Math.floor(parseFloat(String(formData.value.buyX)) || 0));
          const getY = Math.max(0, Math.floor(parseFloat(String(formData.value.getY)) || 0));
          const group = buyX + getY;
          if (buyX > 0 && getY > 0 && group > 0) {
            const freeItems = Math.floor(qty / group) * getY;
            const paidQty = Math.max(0, qty - freeItems);
            finalTotal = paidQty * price;
          }
        }
      }

      formData.value.totalAmount = Math.max(0, finalTotal);
    } else {
      const amount = parseFloat(String(formData.value.incomeAmount)) || 0;
      formData.value.totalAmount = amount;
    }
  },
  { immediate: true }
);
</script>

<template>
  <div class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-end md:items-center justify-center">
    <div
      class="bg-white w-full sm:w-11/12 md:max-w-lg h-[85%] sm:h-auto sm:max-h-[90%] rounded-t-3xl sm:rounded-3xl p-0 animate-slide-up md:animate-fade-in flex flex-col shadow-2xl"
    >
      <div class="px-6 py-4 border-b border-gray-100 flex justify-between items-center shrink-0">
        <h3 class="text-xl font-bold text-slate-900">{{ t('addTransaction') }}</h3>
        <button @click="showAddModal = false" class="p-2 bg-gray-100 rounded-full text-gray-500 hover:bg-gray-200">
          <i class="fas fa-times"></i>
        </button>
      </div>
      <div class="px-6 pt-4 pb-2 shrink-0">
        <div class="flex bg-gray-100 p-1 rounded-xl">
          <button
            @click="formData.type = 'expense'"
            class="flex-1 py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2"
            :class="formData.type === 'expense' ? 'bg-slate-900 text-white shadow-md' : 'text-gray-500 hover:text-slate-700'"
          >
            <i class="fas fa-arrow-up text-sm"></i>
            {{ t('expense') }}
          </button>
          <button
            @click="formData.type = 'income'"
            class="flex-1 py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2"
            :class="formData.type === 'income' ? 'bg-lime-400 text-slate-900 shadow-md' : 'text-gray-500 hover:text-slate-700'"
          >
            <i class="fas fa-arrow-down text-sm"></i>
            {{ t('income') }}
          </button>
        </div>
      </div>
      <div class="flex-1 overflow-y-auto px-6 py-4 scrollbar-hide">
        <div v-if="formData.type === 'expense'" class="space-y-4 animate-fade-in">
          <div>
            <label class="block text-xs text-gray-400 mb-1 ml-1">{{ t('date') }}</label>
            <div class="relative">
              <i class="fas fa-calendar text-gray-400 absolute left-3 top-1/2 -translate-y-1/2"></i>
              <input
                v-model="formData.date"
                type="date"
                class="w-full bg-gray-50 border border-gray-100 rounded-xl py-3 pl-10 pr-4 text-slate-900 focus:outline-none focus:ring-2 focus:ring-lime-400"
              />
            </div>
          </div>
          <div>
            <div class="flex items-center justify-between mb-1 ml-1">
              <label class="block text-xs text-gray-400">{{ t('productName') }}</label>
              <button
                type="button"
                class="text-[10px] font-semibold flex items-center gap-1 px-2 py-1 rounded-lg border border-gray-200 text-slate-600 hover:border-lime-400 hover:text-lime-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                :disabled="ocrDisabled"
                @click="triggerReceiptPicker"
              >
                <i class="fas fa-receipt"></i>
                {{ ocrLoading ? t('scanReceiptLoading') : t('scanReceipt') }}
              </button>
            </div>
            <input
              v-model="formData.productName"
              type="text"
              :placeholder="t('productExample')"
              class="w-full bg-gray-50 border border-gray-100 rounded-xl p-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-lime-400"
            />
            <p class="text-[10px] text-gray-400 mt-1 ml-1">
              {{ isOnline ? t('scanReceiptHint') : t('scanReceiptDisabled') }}
            </p>
            <input
              ref="receiptInput"
              type="file"
              accept="image/*"
              class="hidden"
              @change="handleReceiptChange"
            />
          </div>
          <div>
            <label class="block text-xs text-gray-400 mb-1 ml-1">{{ t('categoryLabel') }}</label>
            <div class="relative">
              <button
                type="button"
                class="w-full bg-gray-50 border border-gray-100 rounded-xl py-3 pl-3 pr-10 text-slate-900 focus:outline-none focus:ring-2 focus:ring-lime-400 flex items-center justify-between gap-3"
                @click="showCategoryPicker = !showCategoryPicker"
              >
                <div class="flex items-center gap-3">
                  <div class="w-8 h-8 rounded-lg bg-white border border-gray-100 flex items-center justify-center text-slate-600">
                    <i class="fas text-sm" :class="selectedCategoryIcon"></i>
                  </div>
                  <span class="text-sm font-semibold text-slate-700">{{ selectedCategoryLabel }}</span>
                </div>
                <i class="fas fa-chevron-down text-gray-400"></i>
              </button>
              <div v-if="showCategoryPicker">
                <div class="fixed inset-0 z-40" @click="showCategoryPicker = false"></div>
                <div class="absolute z-50 mt-2 w-full bg-white border border-gray-100 rounded-2xl shadow-xl overflow-hidden">
                  <div class="max-h-64 overflow-y-auto scrollbar-hide">
                    <button
                      v-for="cat in categoryOptions"
                      :key="cat.id"
                      type="button"
                      class="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors"
                      @click="selectCategory(cat.id)"
                    >
                      <div class="w-8 h-8 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center text-slate-600">
                        <i class="fas text-sm" :class="cat.icon"></i>
                      </div>
                      <span class="text-sm font-semibold text-slate-700">{{ cat.name }}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="flex gap-3">
            <div class="flex-1">
              <label class="block text-xs text-gray-400 mb-1 ml-1">{{ t('quantity') }}</label>
              <input
                v-model="formData.quantity"
                type="number"
                min="1"
                class="w-full bg-gray-50 border border-gray-100 rounded-xl py-3 px-4 text-slate-900 focus:outline-none focus:ring-2 focus:ring-lime-400"
              />
            </div>
            <div class="flex-[2]">
              <label class="block text-xs text-gray-400 mb-1 ml-1">{{ t('price') }}</label>
              <input
                v-model="formData.pricePerItem"
                type="number"
                placeholder="0"
                class="w-full bg-gray-50 border border-gray-100 rounded-xl py-3 px-4 text-slate-900 focus:outline-none focus:ring-2 focus:ring-lime-400"
              />
            </div>
          </div>
          <div class="bg-white border border-dashed border-gray-200 rounded-2xl p-4 space-y-3">
            <label class="flex items-center gap-2 text-sm font-semibold text-slate-700">
              <input
                v-model="formData.hasPromo"
                type="checkbox"
                class="w-4 h-4 text-lime-500 border-gray-300 rounded focus:ring-lime-400"
              />
              {{ t('usePromo') }}
            </label>
            <div v-if="formData.hasPromo" class="space-y-3">
              <div>
                <label class="block text-xs text-gray-400 mb-1 ml-1">{{ t('promoTypeLabel') }}</label>
                <div class="relative">
                  <select
                    v-model="formData.promoType"
                    class="w-full bg-gray-50 border border-gray-100 rounded-xl py-3 pl-4 pr-10 text-slate-900 focus:outline-none focus:ring-2 focus:ring-lime-400 appearance-none"
                  >
                    <option value="percent">{{ t('promoPercent') }}</option>
                    <option value="nominal">{{ t('promoNominal') }}</option>
                    <option value="buyXgetY">{{ t('promoBuyXGetY') }}</option>
                  </select>
                  <i class="fas fa-chevron-down absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"></i>
                </div>
              </div>
              <div v-if="formData.promoType === 'percent'">
                <label class="block text-xs text-gray-400 mb-1 ml-1">{{ t('promoPercent') }}</label>
                <input
                  v-model="formData.promoValue"
                  type="number"
                  min="0"
                  max="100"
                  placeholder="0"
                  class="w-full bg-gray-50 border border-gray-100 rounded-xl p-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-lime-400"
                />
              </div>
              <div v-else-if="formData.promoType === 'nominal'">
                <label class="block text-xs text-gray-400 mb-1 ml-1">{{ t('discountNominalLabel') }}</label>
                <input
                  v-model="formData.promoValue"
                  type="number"
                  min="0"
                  placeholder="0"
                  class="w-full bg-gray-50 border border-gray-100 rounded-xl p-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-lime-400"
                />
              </div>
              <div v-else class="flex gap-3">
                <div class="flex-1">
                  <label class="block text-xs text-gray-400 mb-1 ml-1">{{ t('buyXLabel') }}</label>
                  <input
                    v-model="formData.buyX"
                    type="number"
                    min="1"
                    placeholder="1"
                    class="w-full bg-gray-50 border border-gray-100 rounded-xl p-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-lime-400"
                  />
                </div>
                <div class="flex-1">
                  <label class="block text-xs text-gray-400 mb-1 ml-1">{{ t('getYLabel') }}</label>
                  <input
                    v-model="formData.getY"
                    type="number"
                    min="1"
                    placeholder="1"
                    class="w-full bg-gray-50 border border-gray-100 rounded-xl p-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-lime-400"
                  />
                </div>
              </div>
            </div>
          </div>
          <div>
            <label class="block text-xs text-gray-400 mb-1 ml-1">{{ t('sourceWallet') }}</label>
            <div class="relative">
              <i class="fas fa-credit-card text-gray-400 absolute left-3 top-1/2 -translate-y-1/2"></i>
              <select
                v-model="formData.sourceWallet"
                class="w-full bg-gray-50 border border-gray-100 rounded-xl py-3 pl-10 pr-4 text-slate-900 focus:outline-none focus:ring-2 focus:ring-lime-400 appearance-none"
              >
                <option v-for="wallet in wallets" :key="wallet.id" :value="wallet.id">
                  {{ wallet.name }} ({{ formatRupiah(wallet.balance) }})
                </option>
              </select>
              <i class="fas fa-chevron-down absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"></i>
            </div>
            <div
              v-if="insufficientFunds"
              class="mt-2 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-600"
            >
              <i class="fas fa-circle-exclamation"></i>
              <span>{{ t('insufficientFunds') }}</span>
            </div>
          </div>
          <div class="bg-slate-900 rounded-xl p-4 flex justify-between items-center shadow-lg shadow-slate-200">
            <span class="text-slate-300 font-medium text-sm">{{ t('finalTotal') }}</span>
            <span class="text-lime-400 text-xl font-bold tracking-tight">{{ formatRupiah(formData.totalAmount) }}</span>
          </div>
        </div>

        <div v-else class="space-y-4 animate-fade-in">
          <div>
            <label class="block text-xs text-gray-400 mb-1 ml-1">{{ t('date') }}</label>
            <div class="relative">
              <i class="fas fa-calendar text-gray-400 absolute left-3 top-1/2 -translate-y-1/2"></i>
              <input
                v-model="formData.date"
                type="date"
                class="w-full bg-gray-50 border border-gray-100 rounded-xl py-3 pl-10 pr-4 text-slate-900 focus:outline-none focus:ring-2 focus:ring-lime-400"
              />
            </div>
          </div>
          <div>
            <label class="block text-xs text-gray-400 mb-1 ml-1">{{ t('incomeName') }}</label>
            <input
              v-model="formData.productName"
              type="text"
              :placeholder="t('incomeExample')"
              class="w-full bg-gray-50 border border-gray-100 rounded-xl p-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-lime-400"
            />
          </div>
          <div>
            <label class="block text-xs text-gray-400 mb-1 ml-1">{{ t('categoryLabel') }}</label>
            <div class="relative">
              <button
                type="button"
                class="w-full bg-gray-50 border border-gray-100 rounded-xl py-3 pl-3 pr-10 text-slate-900 focus:outline-none focus:ring-2 focus:ring-lime-400 flex items-center justify-between gap-3"
                @click="showCategoryPicker = !showCategoryPicker"
              >
                <div class="flex items-center gap-3">
                  <div class="w-8 h-8 rounded-lg bg-white border border-gray-100 flex items-center justify-center text-slate-600">
                    <i class="fas text-sm" :class="selectedCategoryIcon"></i>
                  </div>
                  <span class="text-sm font-semibold text-slate-700">{{ selectedCategoryLabel }}</span>
                </div>
                <i class="fas fa-chevron-down text-gray-400"></i>
              </button>
              <div v-if="showCategoryPicker">
                <div class="fixed inset-0 z-40" @click="showCategoryPicker = false"></div>
                <div class="absolute z-50 mt-2 w-full bg-white border border-gray-100 rounded-2xl shadow-xl overflow-hidden">
                  <div class="max-h-64 overflow-y-auto scrollbar-hide">
                    <button
                      v-for="cat in categoryOptions"
                      :key="cat.id"
                      type="button"
                      class="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors"
                      @click="selectCategory(cat.id)"
                    >
                      <div class="w-8 h-8 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center text-slate-600">
                        <i class="fas text-sm" :class="cat.icon"></i>
                      </div>
                      <span class="text-sm font-semibold text-slate-700">{{ cat.name }}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div>
            <label class="block text-xs text-gray-400 mb-1 ml-1">{{ t('walletIn') }}</label>
            <div class="relative">
              <i class="fas fa-wallet text-gray-400 absolute left-3 top-1/2 -translate-y-1/2"></i>
              <select
                v-model="formData.destWallet"
                class="w-full bg-gray-50 border border-gray-100 rounded-xl py-3 pl-10 pr-4 text-slate-900 focus:outline-none focus:ring-2 focus:ring-lime-400 appearance-none"
              >
                <option v-for="wallet in wallets" :key="wallet.id" :value="wallet.id">{{ wallet.name }}</option>
              </select>
              <i class="fas fa-chevron-down absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"></i>
            </div>
          </div>
          <div>
            <label class="block text-xs text-gray-400 mb-1 ml-1">{{ t('amountLabel') }}</label>
            <input
              v-model="formData.incomeAmount"
              type="number"
              placeholder="0"
              class="w-full bg-gray-50 border border-gray-100 rounded-xl p-4 text-lg font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-lime-400"
            />
          </div>
        </div>
      </div>
      <div class="p-6 border-t border-gray-100 bg-white shrink-0 pb-8 sm:pb-6 rounded-b-3xl">
        <button
          :disabled="insufficientFunds"
          @click="handleSaveTransaction"
          class="w-full py-4 rounded-xl font-bold text-lg transition-colors flex items-center justify-center gap-2 active:scale-[0.98] mm-primary-action"
          :class="insufficientFunds
            ? 'bg-gray-200 text-gray-400 cursor-not-allowed is-disabled'
            : 'bg-slate-900 text-white hover:bg-slate-800'"
        >
          {{ t('saveTransaction') }}
          <i class="fas fa-check"></i>
        </button>
      </div>
    </div>
  </div>
</template>
