<script setup lang="ts">
const { displayName, displayEmail, initials, handleDownloadExcel, handleLogout } = useMoneyManager();
</script>

<template>
  <div class="animate-fade-in pb-32 pt-6">
    <div class="bg-slate-900 rounded-3xl p-6 text-white shadow-xl shadow-slate-200 mb-6 text-center relative overflow-hidden">
      <div class="absolute -right-4 -top-4 w-32 h-32 bg-lime-400 opacity-10 rounded-full blur-2xl"></div>
      <div class="absolute -left-4 -bottom-4 w-24 h-24 bg-blue-500 opacity-20 rounded-full blur-xl"></div>
      <div class="w-24 h-24 bg-gray-200 rounded-full mx-auto mb-4 border-4 border-slate-800 relative shadow-lg">
        <div class="w-full h-full flex items-center justify-center bg-gradient-to-br from-lime-400 to-green-500 rounded-full text-slate-900 font-bold text-3xl">
          {{ initials }}
        </div>
        <button class="absolute bottom-0 right-0 bg-white p-2 rounded-full text-slate-900 shadow-md border border-gray-100 hover:bg-gray-50 transition-colors">
          <i class="fas fa-pencil text-xs"></i>
        </button>
      </div>
      <h2 class="text-xl font-bold tracking-tight">{{ displayName }}</h2>
      <p class="text-slate-400 text-sm">{{ displayEmail }}</p>
    </div>

    <div class="space-y-6">
      <div>
        <h3 class="text-xs font-bold text-gray-400 uppercase mb-2 ml-4">Akun</h3>
        <div class="bg-white rounded-2xl p-2 shadow-sm border border-gray-100">
          <div class="flex items-center justify-between p-3 rounded-xl cursor-pointer transition-colors hover:bg-gray-50">
            <div class="flex items-center gap-3">
              <div class="p-2 rounded-lg bg-gray-100 text-slate-700">
                <i class="fas fa-user"></i>
              </div>
              <span class="font-medium text-slate-700">Edit Profil</span>
            </div>
            <i class="fas fa-chevron-right text-gray-400"></i>
          </div>
          <div class="flex items-center justify-between p-3 rounded-xl cursor-pointer transition-colors hover:bg-gray-50">
            <div class="flex items-center gap-3">
              <div class="p-2 rounded-lg bg-gray-100 text-slate-700">
                <i class="fas fa-lock"></i>
              </div>
              <span class="font-medium text-slate-700">Ganti Password</span>
            </div>
            <i class="fas fa-chevron-right text-gray-400"></i>
          </div>
        </div>
      </div>

      <div>
        <h3 class="text-xs font-bold text-gray-400 uppercase mb-2 ml-4">Preferensi</h3>
        <div class="bg-white rounded-2xl p-2 shadow-sm border border-gray-100">
          <div class="flex items-center justify-between p-3 rounded-xl cursor-pointer transition-colors hover:bg-gray-50">
            <div class="flex items-center gap-3">
              <div class="p-2 rounded-lg bg-gray-100 text-slate-700">
                <i class="fas fa-bell"></i>
              </div>
              <span class="font-medium text-slate-700">Notifikasi</span>
            </div>
            <div class="w-10 h-6 bg-gray-200 rounded-full p-1 relative cursor-pointer">
              <div class="w-4 h-4 bg-white rounded-full shadow-sm"></div>
            </div>
          </div>
          <div class="flex items-center justify-between p-3 rounded-xl cursor-pointer transition-colors hover:bg-gray-50">
            <div class="flex items-center gap-3">
              <div class="p-2 rounded-lg bg-gray-100 text-slate-700">
                <i class="fas fa-moon"></i>
              </div>
              <span class="font-medium text-slate-700">Mode Gelap</span>
            </div>
            <div class="w-10 h-6 bg-gray-200 rounded-full p-1 relative cursor-pointer">
              <div class="w-4 h-4 bg-white rounded-full shadow-sm"></div>
            </div>
          </div>
          <div class="flex items-center justify-between p-3 rounded-xl cursor-pointer transition-colors hover:bg-gray-50">
            <div class="flex items-center gap-3">
              <div class="p-2 rounded-lg bg-gray-100 text-slate-700">
                <i class="fas fa-landmark"></i>
              </div>
              <span class="font-medium text-slate-700">Mata Uang (IDR)</span>
            </div>
            <i class="fas fa-chevron-right text-gray-400"></i>
          </div>
        </div>
      </div>

      <div>
        <h3 class="text-xs font-bold text-gray-400 uppercase mb-2 ml-4">Data & Keamanan</h3>
        <div class="bg-white rounded-2xl p-2 shadow-sm border border-gray-100">
          <div
            class="flex items-center justify-between p-3 rounded-xl cursor-pointer transition-colors hover:bg-gray-50"
            @click="handleDownloadExcel"
          >
            <div class="flex items-center gap-3">
              <div class="p-2 rounded-lg bg-gray-100 text-slate-700">
                <i class="fas fa-download"></i>
              </div>
              <span class="font-medium text-slate-700">Ekspor Data (CSV)</span>
            </div>
            <i class="fas fa-chevron-right text-gray-400"></i>
          </div>
          <div class="flex items-center justify-between p-3 rounded-xl cursor-pointer transition-colors hover:bg-gray-50">
            <div class="flex items-center gap-3">
              <div class="p-2 rounded-lg bg-gray-100 text-slate-700">
                <i class="fas fa-shield-alt"></i>
              </div>
              <span class="font-medium text-slate-700">Kebijakan Privasi</span>
            </div>
            <i class="fas fa-chevron-right text-gray-400"></i>
          </div>
          <div class="flex items-center justify-between p-3 rounded-xl cursor-pointer transition-colors hover:bg-gray-50">
            <div class="flex items-center gap-3">
              <div class="p-2 rounded-lg bg-gray-100 text-slate-700">
                <i class="fas fa-circle-question"></i>
              </div>
              <span class="font-medium text-slate-700">Pusat Bantuan</span>
            </div>
            <i class="fas fa-chevron-right text-gray-400"></i>
          </div>
          <div class="h-[1px] bg-gray-100 my-1"></div>
          <div class="flex items-center justify-between p-3 rounded-xl cursor-pointer transition-colors hover:bg-red-50">
            <div class="flex items-center gap-3">
              <div class="p-2 rounded-lg bg-red-100 text-red-500">
                <i class="fas fa-trash"></i>
              </div>
              <span class="font-medium text-red-600">Hapus Akun</span>
            </div>
            <i class="fas fa-chevron-right text-gray-400"></i>
          </div>
        </div>
      </div>

      <button
        @click="handleLogout"
        class="w-full bg-red-50 text-red-600 font-bold py-4 rounded-2xl hover:bg-red-100 active:scale-[0.98] transition-all flex items-center justify-center gap-2 border border-red-100"
      >
        <i class="fas fa-right-from-bracket"></i>
        Keluar
      </button>
      <p class="text-center text-[10px] text-gray-400 mt-2">Versi Aplikasi 1.0.0 - MoneyKu Inc.</p>
    </div>
  </div>
</template>
