<script setup lang="ts">
import { ref, computed, watch } from 'vue';

const activeMasterTab = ref<'wallet' | 'category'>('wallet');

  const {
  wallets,
  expenseCategories,
  incomeCategories,
  totalBalance,
  formatRupiah,
  formatShortRupiah,
  getWalletIncome,
  getWalletExpense,
  handleOpenAddWallet,
  handleOpenEditWallet,
  requestDeleteWallet,
  openCategoryModal,
  requestDeleteCategory,
  handleOpenEditCategory,
} = useMoneyManager();

const allCategories = computed(() => {
  const merged = [...expenseCategories.value, ...incomeCategories.value];
  return merged.sort((a, b) => a.name.localeCompare(b.name));
});

const itemsPerPage = 7;
const currentPage = ref(1);
const totalPages = computed(() => Math.max(1, Math.ceil(allCategories.value.length / itemsPerPage)));
const pagedCategories = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  return allCategories.value.slice(start, start + itemsPerPage);
});
const pageStart = computed(() =>
  allCategories.value.length === 0 ? 0 : (currentPage.value - 1) * itemsPerPage + 1
);
const pageEnd = computed(() => Math.min(currentPage.value * itemsPerPage, allCategories.value.length));

watch(allCategories, () => {
  if (currentPage.value > totalPages.value) currentPage.value = totalPages.value;
});
</script>

<template>
  <div class="h-full flex flex-col pt-6">
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-2xl font-bold text-slate-900">Master Data</h2>
    </div>
    <div class="flex p-1 bg-gray-100 rounded-xl w-full md:w-fit mb-6">
      <button
        @click="activeMasterTab = 'wallet'"
        class="flex-1 md:flex-none px-6 py-2 rounded-lg text-sm font-bold transition-all"
        :class="
          activeMasterTab === 'wallet'
            ? 'bg-white text-slate-900 shadow-sm'
            : 'text-gray-500 hover:text-slate-700'
        "
      >
        Dompet
      </button>
      <button
        @click="activeMasterTab = 'category'"
        class="flex-1 md:flex-none px-6 py-2 rounded-lg text-sm font-bold transition-all"
        :class="
          activeMasterTab === 'category'
            ? 'bg-white text-slate-900 shadow-sm'
            : 'text-gray-500 hover:text-slate-700'
        "
      >
        Kategori
      </button>
    </div>

    <div v-if="activeMasterTab === 'wallet'" class="animate-fade-in pb-32 md:pb-32 pt-6">
      <div class="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-6 text-white shadow-xl shadow-slate-200 mb-8">
        <p class="text-slate-400 text-sm font-medium mb-1">Total Aset</p>
        <h1 class="text-3xl font-bold text-white tracking-tight">{{ formatRupiah(totalBalance) }}</h1>
      </div>
      <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <div
          v-for="wallet in wallets"
          :key="wallet.id"
          class="group relative bg-white border border-gray-100 rounded-3xl p-4 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col justify-between overflow-hidden cursor-pointer"
          @click="handleOpenEditWallet(wallet)"
        >
          <div class="flex items-start justify-between mb-4 z-10">
            <div
              class="w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-md transition-all duration-500 relative overflow-hidden group-hover:scale-110"
              :class="wallet.color"
            >
              <div class="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div class="relative z-10">
                <i class="fas" :class="wallet.icon"></i>
              </div>
            </div>
            <div class="flex items-center gap-2">
              <div class="bg-gray-50 px-2 py-1 rounded-lg">
                <p class="text-[10px] font-bold text-gray-400 uppercase tracking-wide">{{ wallet.type }}</p>
              </div>
              <button
                title="Hapus Dompet"
                class="w-8 h-8 rounded-lg border border-red-100 text-red-500 hover:text-red-600 hover:border-red-200 transition-colors bg-white"
                @click.stop="requestDeleteWallet(wallet.id)"
              >
                <i class="fas fa-trash text-[11px]"></i>
              </button>
            </div>
          </div>
          <div class="mb-4 z-10">
            <h3 class="text-sm font-medium text-gray-500 mb-1 line-clamp-1">{{ wallet.name }}</h3>
            <p class="text-lg font-bold text-slate-900 tracking-tight">{{ formatShortRupiah(wallet.balance) }}</p>
          </div>
          <div class="grid grid-cols-2 gap-2 pt-3 border-t border-gray-100 z-10">
            <div class="flex flex-col">
              <div class="flex items-center gap-1 text-slate-400 mb-0.5">
                <i class="fas fa-arrow-down text-red-500 text-[10px]"></i>
                <span class="text-[10px] font-semibold">Keluar</span>
              </div>
              <span class="text-xs font-bold text-slate-700">{{ formatShortRupiah(getWalletExpense(wallet.id)) }}</span>
            </div>
            <div class="flex flex-col items-end">
              <div class="flex items-center gap-1 text-slate-400 mb-0.5">
                <span class="text-[10px] font-semibold">Masuk</span>
                <i class="fas fa-arrow-up text-lime-500 text-[10px]"></i>
              </div>
              <span class="text-xs font-bold text-slate-700">{{ formatShortRupiah(getWalletIncome(wallet.id)) }}</span>
            </div>
          </div>
          <div
            class="absolute -right-6 -bottom-6 w-24 h-24 rounded-full opacity-0 group-hover:opacity-10 transition-opacity duration-500 blur-2xl"
            :class="wallet.color"
          ></div>
        </div>

        <button
          @click="handleOpenAddWallet"
          class="bg-gray-50 border-2 border-dashed border-gray-200 rounded-3xl flex flex-col items-center justify-center gap-2 min-h-[160px] text-gray-400 hover:bg-gray-100 hover:border-gray-300 transition-all"
        >
          <div class="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm">
            <i class="fas fa-plus"></i>
          </div>
          <span class="text-xs font-bold">Tambah Dompet</span>
        </button>
      </div>
    </div>

    <div v-else class="animate-fade-in pb-32 md:pb-32 pt-6">
      <div class="bg-white rounded-3xl p-4 md:p-6 border border-gray-100 shadow-sm">
        <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
          <div>
            <h3 class="font-bold text-slate-900 text-lg">Daftar Kategori</h3>
            <p class="text-xs text-gray-400">Icon dan tipe kategori untuk transaksi.</p>
          </div>
          <div class="flex gap-2">
            <button
              @click="openCategoryModal()"
              class="px-3 py-2 bg-slate-900 text-white rounded-lg text-xs font-bold hover:bg-slate-800 transition-colors"
            >
              <i class="fas fa-plus mr-1"></i>
              Tambah Kategori
            </button>
          </div>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead class="text-xs text-gray-400 uppercase">
              <tr class="border-b border-gray-100">
                <th class="text-left py-3 px-2">Icon</th>
                <th class="text-left py-3 px-2">Nama</th>
                <th class="text-left py-3 px-2">Tipe</th>
                <th class="text-right py-3 px-2">Aksi</th>
              </tr>
            </thead>
            <tbody v-if="pagedCategories.length > 0">
              <tr
                v-for="cat in pagedCategories"
                :key="cat.id"
                class="border-b border-gray-50 hover:bg-gray-50/60 transition-colors"
              >
                <td class="py-3 px-2">
                  <div class="w-9 h-9 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center text-slate-600">
                    <i class="fas" :class="cat.icon"></i>
                  </div>
                </td>
                <td class="py-3 px-2">
                  <p class="font-semibold text-slate-800">{{ cat.name }}</p>
                </td>
                <td class="py-3 px-2">
                  <span
                    class="px-2.5 py-1 rounded-full text-[11px] font-bold border"
                    :class="cat.type === 'expense' ? 'bg-red-50 text-red-600 border-red-100' : 'bg-lime-50 text-lime-700 border-lime-100'"
                  >
                    {{ cat.type === 'expense' ? 'Pengeluaran' : 'Pemasukan' }}
                  </span>
                </td>
                <td class="py-3 px-2 text-right">
                  <div class="flex items-center justify-end gap-2">
                    <button
                      title="Edit"
                      @click="handleOpenEditCategory(cat)"
                      class="w-8 h-8 rounded-lg border border-gray-200 text-slate-500 hover:text-slate-700 hover:border-gray-300 transition-colors"
                    >
                      <i class="fas fa-pen text-xs"></i>
                    </button>
                    <button
                      title="Hapus"
                      @click="requestDeleteCategory(cat.id)"
                      class="w-8 h-8 rounded-lg border border-red-100 text-red-500 hover:text-red-600 hover:border-red-200 transition-colors"
                    >
                      <i class="fas fa-trash text-xs"></i>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
          <div v-if="allCategories.length === 0" class="text-center py-8 text-gray-400">
            <p>Belum ada kategori.</p>
          </div>
          <div v-else class="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mt-4">
            <p class="text-xs text-gray-400">
              Menampilkan {{ pageStart }}-{{ pageEnd }} dari {{ allCategories.length }} kategori
            </p>
            <div class="flex items-center gap-2">
              <button
                class="px-3 py-2 rounded-lg text-xs font-bold border transition-colors"
                :class="currentPage === 1 ? 'border-gray-200 text-gray-300' : 'border-gray-200 text-slate-600 hover:border-gray-300'"
                :disabled="currentPage === 1"
                @click="currentPage = Math.max(1, currentPage - 1)"
              >
                <i class="fas fa-chevron-left mr-1"></i>
                Sebelumnya
              </button>
              <span class="text-xs font-semibold text-slate-600">Hal {{ currentPage }} / {{ totalPages }}</span>
              <button
                class="px-3 py-2 rounded-lg text-xs font-bold border transition-colors"
                :class="currentPage === totalPages ? 'border-gray-200 text-gray-300' : 'border-gray-200 text-slate-600 hover:border-gray-300'"
                :disabled="currentPage === totalPages"
                @click="currentPage = Math.min(totalPages, currentPage + 1)"
              >
                Berikutnya
                <i class="fas fa-chevron-right ml-1"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
