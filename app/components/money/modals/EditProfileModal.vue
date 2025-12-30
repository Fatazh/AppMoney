<script setup lang="ts">
const {
  showProfileModal,
  profileForm,
  displayEmail,
  handleSaveProfile,
  closeProfileModal,
  t,
} = useMoneyManager();
</script>

<template>
  <div class="absolute inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center px-4">
    <div class="bg-white w-full max-w-sm rounded-3xl p-6 animate-slide-up-content shadow-2xl md:animate-fade-in">
      <div class="flex justify-between items-center mb-6">
        <h3 class="text-xl font-bold text-slate-900">{{ t('editProfile') }}</h3>
        <button @click="closeProfileModal" class="p-2 bg-gray-100 rounded-full text-gray-500 hover:bg-gray-200">
          <i class="fas fa-times"></i>
        </button>
      </div>
      <div class="space-y-4 mb-8">
        <div>
          <label class="block text-xs text-gray-400 mb-1 ml-1">{{ t('name') }}</label>
          <input
            v-model="profileForm.name"
            type="text"
            placeholder="Nama lengkap"
            class="w-full bg-gray-50 border border-gray-100 rounded-xl p-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-lime-400"
          />
        </div>
        <div>
          <label class="block text-xs text-gray-400 mb-1 ml-1">{{ t('emailLabel') }}</label>
          <div class="w-full bg-gray-50 border border-gray-100 rounded-xl p-3 text-slate-500 text-sm">
            {{ displayEmail }}
          </div>
        </div>
      </div>
      <button
        @click="handleSaveProfile"
        class="w-full bg-lime-400 text-slate-900 py-3 rounded-xl font-bold hover:bg-lime-500 transition-colors"
      >
        {{ t('saveChanges') }}
      </button>
    </div>
  </div>
</template>
