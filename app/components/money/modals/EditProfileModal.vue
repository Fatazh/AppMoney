<script setup lang="ts">
import { ref } from 'vue';

const {
  showProfileModal,
  profileForm,
  displayEmail,
  initials,
  handleSaveProfile,
  closeProfileModal,
  setFlash,
  t,
} = useMoneyManager();

const avatarInput = ref<HTMLInputElement | null>(null);

const triggerAvatarPicker = () => {
  avatarInput.value?.click();
};

const handleAvatarChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (!file) return;

  if (!file.type.startsWith('image/')) {
    setFlash('Avatar harus berupa gambar.', 'error');
    target.value = '';
    return;
  }

  const maxSize = 512 * 1024;
  if (file.size > maxSize) {
    setFlash('Ukuran avatar maksimal 512KB.', 'error');
    target.value = '';
    return;
  }

  const reader = new FileReader();
  reader.onload = () => {
    const result = typeof reader.result === 'string' ? reader.result : '';
    profileForm.value.avatarUrl = result || null;
  };
  reader.onerror = () => {
    setFlash('Gagal memuat avatar.', 'error');
  };
  reader.readAsDataURL(file);
  target.value = '';
};

const clearAvatar = () => {
  profileForm.value.avatarUrl = null;
};
</script>

<template>
  <div class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center px-4">
    <div class="bg-white w-full max-w-sm rounded-3xl p-6 animate-slide-up-content shadow-2xl md:animate-fade-in">
      <div class="flex justify-between items-center mb-6">
        <h3 class="text-xl font-bold text-slate-900">{{ t('editProfile') }}</h3>
        <button @click="closeProfileModal" class="p-2 bg-gray-100 rounded-full text-gray-500 hover:bg-gray-200">
          <i class="fas fa-times"></i>
        </button>
      </div>
      <div class="space-y-4 mb-8">
        <div>
          <label class="block text-xs text-gray-400 mb-2 ml-1">{{ t('avatar') }}</label>
          <div class="flex items-center gap-4">
            <div class="w-16 h-16 rounded-full bg-gray-100 border border-gray-200 overflow-hidden shrink-0">
              <img
                v-if="profileForm.avatarUrl"
                :src="profileForm.avatarUrl"
                alt="Avatar"
                class="w-full h-full object-cover"
              />
              <div
                v-else
                class="w-full h-full flex items-center justify-center bg-gradient-to-br from-lime-400 to-green-500 text-slate-900 font-bold text-lg"
              >
                {{ initials }}
              </div>
            </div>
            <div class="flex flex-col gap-2">
              <button
                type="button"
                class="px-3 py-2 rounded-xl bg-gray-100 text-slate-700 text-xs font-bold hover:bg-gray-200 transition-colors"
                @click="triggerAvatarPicker"
              >
                {{ t('changeAvatar') }}
              </button>
              <button
                v-if="profileForm.avatarUrl"
                type="button"
                class="text-xs font-semibold text-red-500 hover:text-red-600"
                @click="clearAvatar"
              >
                {{ t('removeAvatar') }}
              </button>
              <p class="text-[10px] text-gray-400">{{ t('avatarHint') }}</p>
            </div>
            <input
              ref="avatarInput"
              type="file"
              accept="image/*"
              class="hidden"
              @change="handleAvatarChange"
            />
          </div>
        </div>
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
