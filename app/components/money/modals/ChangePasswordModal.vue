<script setup lang="ts">
import { ref } from 'vue';

const {
  showPasswordModal,
  passwordForm,
  handleChangePassword,
  closePasswordModal,
  t,
} = useMoneyManager();

const showCurrent = ref(false);
const showNew = ref(false);
const showConfirm = ref(false);
</script>

<template>
  <div class="absolute inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center px-4">
    <div class="bg-white w-full max-w-sm rounded-3xl p-6 animate-slide-up-content shadow-2xl md:animate-fade-in">
      <div class="flex justify-between items-center mb-6">
        <h3 class="text-xl font-bold text-slate-900">{{ t('changePassword') }}</h3>
        <button @click="closePasswordModal" class="p-2 bg-gray-100 rounded-full text-gray-500 hover:bg-gray-200">
          <i class="fas fa-times"></i>
        </button>
      </div>
      <div class="space-y-4 mb-8">
        <div>
          <label class="block text-xs text-gray-400 mb-1 ml-1">{{ t('currentPassword') }}</label>
          <div class="relative">
            <input
              v-model="passwordForm.currentPassword"
              :type="showCurrent ? 'text' : 'password'"
              class="w-full bg-gray-50 border border-gray-100 rounded-xl p-3 pr-10 text-slate-900 focus:outline-none focus:ring-2 focus:ring-lime-400"
              :placeholder="t('currentPassword')"
            />
            <button
              type="button"
              class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              @click="showCurrent = !showCurrent"
            >
              <i :class="showCurrent ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
            </button>
          </div>
        </div>
        <div>
          <label class="block text-xs text-gray-400 mb-1 ml-1">{{ t('newPassword') }}</label>
          <div class="relative">
            <input
              v-model="passwordForm.newPassword"
              :type="showNew ? 'text' : 'password'"
              class="w-full bg-gray-50 border border-gray-100 rounded-xl p-3 pr-10 text-slate-900 focus:outline-none focus:ring-2 focus:ring-lime-400"
              :placeholder="t('newPassword')"
            />
            <button
              type="button"
              class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              @click="showNew = !showNew"
            >
              <i :class="showNew ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
            </button>
          </div>
        </div>
        <div>
          <label class="block text-xs text-gray-400 mb-1 ml-1">{{ t('confirmPassword') }}</label>
          <div class="relative">
            <input
              v-model="passwordForm.confirmPassword"
              :type="showConfirm ? 'text' : 'password'"
              class="w-full bg-gray-50 border border-gray-100 rounded-xl p-3 pr-10 text-slate-900 focus:outline-none focus:ring-2 focus:ring-lime-400"
              :placeholder="t('confirmPassword')"
            />
            <button
              type="button"
              class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              @click="showConfirm = !showConfirm"
            >
              <i :class="showConfirm ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
            </button>
          </div>
        </div>
      </div>
      <button
        @click="handleChangePassword"
        class="w-full bg-lime-400 text-slate-900 py-3 rounded-xl font-bold hover:bg-lime-500 transition-colors"
      >
        {{ t('savePassword') }}
      </button>
    </div>
  </div>
</template>
