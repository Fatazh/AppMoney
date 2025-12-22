<script setup lang="ts">
const {
  showDeleteWalletModal,
  walletToDelete,
  confirmDeleteWallet,
  cancelDeleteWallet,
} = useMoneyManager();
</script>

<template>
  <div
    v-if="showDeleteWalletModal"
    class="absolute inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center px-4"
    @click.self="cancelDeleteWallet"
  >
    <div class="bg-white w-full max-w-sm rounded-3xl p-6 animate-slide-up-content shadow-2xl md:animate-fade-in">
      <div class="flex justify-between items-center mb-4">
        <div>
          <h3 class="text-xl font-bold text-slate-900">Hapus Dompet</h3>
          <p class="text-xs text-gray-400">Tindakan ini tidak bisa dibatalkan.</p>
        </div>
        <button @click="cancelDeleteWallet" class="p-2 bg-gray-100 rounded-full text-gray-500 hover:bg-gray-200">
          <i class="fas fa-times"></i>
        </button>
      </div>
      <div class="bg-gray-50 border border-gray-100 rounded-2xl p-4 mb-5">
        <p class="text-xs text-gray-400">Dompet yang akan dihapus</p>
        <p class="text-sm font-bold text-slate-900 mt-1">{{ walletToDelete?.name || '-' }}</p>
        <p class="text-[10px] text-gray-400 mt-2">Transaksi terkait tetap tersimpan.</p>
      </div>
      <div class="flex gap-3">
        <button
          @click="cancelDeleteWallet"
          class="flex-1 bg-gray-100 text-slate-700 py-3 rounded-xl font-bold hover:bg-gray-200 transition-colors"
        >
          Batal
        </button>
        <button
          @click="confirmDeleteWallet"
          class="flex-1 bg-red-500 text-white py-3 rounded-xl font-bold hover:bg-red-600 transition-colors"
        >
          Hapus
        </button>
      </div>
    </div>
  </div>
</template>
