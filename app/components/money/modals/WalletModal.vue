<script setup lang="ts">
const {
  showWalletModal,
  editingWallet,
  walletFormData,
  handleSaveWallet,
  requestDeleteWallet,
  formatRupiah,
} = useMoneyManager();

const walletTypes = ['Cash', 'Bank', 'E-Wallet'] as const;
</script>

<template>
  <div class="absolute inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center px-4">
    <div class="bg-white w-full max-w-sm rounded-3xl p-6 animate-slide-up-content shadow-2xl md:animate-fade-in">
      <div class="flex justify-between items-center mb-6">
        <h3 class="text-xl font-bold text-slate-900">{{ editingWallet ? 'Edit Dompet' : 'Tambah Dompet' }}</h3>
        <button @click="showWalletModal = false" class="p-2 bg-gray-100 rounded-full text-gray-500 hover:bg-gray-200">
          <i class="fas fa-times"></i>
        </button>
      </div>
      <div class="space-y-4 mb-8">
        <div>
          <label class="block text-xs text-gray-400 mb-1 ml-1">Nama Dompet</label>
          <input
            v-model="walletFormData.name"
            type="text"
            placeholder="Contoh: Tabungan Liburan"
            class="w-full bg-gray-50 border border-gray-100 rounded-xl p-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-lime-400"
          />
        </div>
        <div>
          <label class="block text-xs text-gray-400 mb-1 ml-1">Tipe</label>
          <div class="flex gap-2">
            <button
              v-for="type in walletTypes"
              :key="type"
              @click="walletFormData.type = type"
              class="flex-1 py-2 rounded-xl text-xs font-bold border transition-colors"
              :class="walletFormData.type === type ? 'bg-slate-900 text-white border-slate-900' : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'"
            >
              {{ type }}
            </button>
          </div>
        </div>
        <div v-if="editingWallet" class="rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3">
          <div class="flex items-center justify-between">
            <span class="text-xs text-gray-400">Saldo Saat Ini</span>
            <span class="text-sm font-bold text-slate-900">
              {{ formatRupiah(editingWallet.balance) }}
            </span>
          </div>
        </div>
        <div>
          <label class="block text-xs text-gray-400 mb-1 ml-1">
            {{ editingWallet ? 'Tambah Saldo (Rp)' : 'Saldo Awal (Opsional) (Rp)' }}
          </label>
          <input
            v-model="walletFormData.balance"
            type="number"
            placeholder="0"
            class="w-full bg-gray-50 border border-gray-100 rounded-xl p-3 text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-lime-400"
          />
          <p class="text-[10px] text-gray-400 mt-1 ml-1">
            {{ editingWallet ? 'Kosongkan jika tidak menambah saldo.' : 'Kosongkan jika 0.' }}
          </p>
        </div>
      </div>
      <div class="space-y-3">
        <button
          @click="handleSaveWallet"
          class="w-full bg-lime-400 text-slate-900 py-3 rounded-xl font-bold hover:bg-lime-500 transition-colors"
        >
          {{ editingWallet ? 'Simpan Perubahan' : 'Buat Dompet' }}
        </button>
        <button
          v-if="editingWallet"
          @click="requestDeleteWallet()"
          class="w-full bg-red-50 text-red-600 py-3 rounded-xl font-bold hover:bg-red-100 transition-colors border border-red-100"
        >
          Hapus Dompet
        </button>
      </div>
    </div>
  </div>
</template>
