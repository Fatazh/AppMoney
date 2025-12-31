<script setup lang="ts">
import { onBeforeUnmount, watch } from 'vue';
import AddTransactionModal from '~/components/money/modals/AddTransactionModal.vue';
import WalletModal from '~/components/money/modals/WalletModal.vue';
import CategoryModal from '~/components/money/modals/CategoryModal.vue';
import DeleteWalletModal from '~/components/money/modals/DeleteWalletModal.vue';
import DeleteCategoryModal from '~/components/money/modals/DeleteCategoryModal.vue';
import EditProfileModal from '~/components/money/modals/EditProfileModal.vue';
import ChangePasswordModal from '~/components/money/modals/ChangePasswordModal.vue';

const route = useRoute();
const router = useRouter();

const {
  displayName,
  notifications,
  notificationStyles,
  showNotifications,
  hasUnread,
  toggleNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  showAddModal,
  showWalletModal,
  showCategoryModal,
  showDeleteWalletModal,
  showDeleteCategoryModal,
  showProfileModal,
  showPasswordModal,
  notificationsEnabled,
  darkModeEnabled,
  t,
  flashMessage,
  clearFlash,
  bootstrapping,
} = useMoneyManager();

const isActive = (path: string) => route.path === path;

const goToNotifications = () => {
  showNotifications.value = false;
  router.push('/notifications');
};

let flashTimer: ReturnType<typeof setTimeout> | null = null;

watch(
  () => darkModeEnabled.value,
  (enabled) => {
    if (typeof document === 'undefined') return;
    document.documentElement.classList.toggle('theme-dark', enabled);
  },
  { immediate: true }
);

watch(
  () => flashMessage.value?.id,
  (id) => {
    if (!id) return;
    if (flashTimer) clearTimeout(flashTimer);
    flashTimer = setTimeout(() => clearFlash(), 2600);
  },
  { immediate: true }
);

onBeforeUnmount(() => {
  if (typeof document !== 'undefined') {
    document.documentElement.classList.remove('theme-dark');
  }
  if (flashTimer) clearTimeout(flashTimer);
});
</script>

<template>
  <div
    class="flex justify-center items-center min-h-[100dvh] bg-gray-100 font-sans md:items-stretch md:bg-gray-50 md:p-0"
    :class="{ 'theme-dark': darkModeEnabled }"
  >
    <div class="w-full min-h-[100dvh] flex flex-col overflow-hidden">
      <div
        class="flex-1 flex flex-col relative h-full overflow-hidden w-full max-w-md mx-auto md:max-w-4xl md:mx-auto bg-white md:bg-gray-50 shadow-2xl md:shadow-none"
      >
        <div v-if="bootstrapping" class="fixed top-0 left-0 right-0 z-40">
          <div class="mx-auto max-w-md md:max-w-4xl px-4 md:px-8 pt-3">
            <div class="bg-white/95 border border-gray-200 rounded-2xl px-4 py-2 shadow-lg flex items-center gap-2 text-xs text-slate-600">
              <i class="fas fa-spinner fa-spin text-lime-500"></i>
              <span>{{ t('loading') }}</span>
            </div>
          </div>
        </div>

        <div
          v-if="flashMessage"
          class="fixed top-4 left-1/2 -translate-x-1/2 z-[90] w-[calc(100%-2rem)] max-w-md md:max-w-4xl"
        >
          <div
            class="rounded-2xl px-4 py-3 border shadow-xl flex items-center gap-3"
            :class="flashMessage.type === 'success'
              ? 'bg-green-50 border-green-200 text-green-700'
              : flashMessage.type === 'error'
                ? 'bg-red-50 border-red-200 text-red-700'
                : 'bg-blue-50 border-blue-200 text-blue-700'"
          >
            <i
              class="fas"
              :class="flashMessage.type === 'success'
                ? 'fa-check-circle'
                : flashMessage.type === 'error'
                  ? 'fa-exclamation-circle'
                  : 'fa-info-circle'"
            ></i>
            <span class="text-sm font-semibold">{{ flashMessage.message }}</span>
          </div>
        </div>
        <div class="px-6 pt-10 pb-4 bg-white md:bg-gray-50 flex justify-between items-center z-10 relative md:pt-8 md:px-8">
          <div>
            <p class="text-gray-500 text-sm">{{ t('greeting') }}</p>
            <h2 class="text-xl font-bold text-slate-900">{{ displayName }}</h2>
          </div>

          <div class="relative">
            <button
              @click="toggleNotifications"
              class="p-2 bg-gray-50 md:bg-white rounded-full border border-gray-100 relative hover:bg-gray-100 transition-colors shadow-sm"
              :class="!notificationsEnabled ? 'opacity-60 cursor-not-allowed' : ''"
            >
              <i class="fas fa-bell text-slate-900"></i>
              <div
                v-if="hasUnread && notificationsEnabled"
                class="absolute top-2 right-2 w-2 h-2 bg-lime-500 rounded-full border-2 border-white"
              ></div>
            </button>

            <div v-if="showNotifications">
              <div class="fixed inset-0 z-40" @click="showNotifications = false"></div>
              <div
                class="absolute top-12 right-0 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 overflow-hidden animate-fade-in origin-top-right"
              >
                <div class="p-4 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
                  <h3 class="font-bold text-slate-900">{{ t('notifications') }}</h3>
                  <button
                    class="text-xs text-lime-600 font-bold hover:text-lime-700"
                    @click="markAllNotificationsRead"
                  >
                    {{ t('markAllRead') }}
                  </button>
                </div>
                <div class="max-h-[350px] overflow-y-auto scrollbar-hide">
                  <div
                    v-for="notif in notifications"
                    :key="notif.id"
                    class="p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors flex gap-3 cursor-pointer"
                    :class="!notif.read ? 'bg-lime-50/30' : ''"
                    @click="markNotificationRead(notif.id)"
                  >
                    <div
                      class="w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-1"
                      :class="[notificationStyles[notif.type].bg, notificationStyles[notif.type].color]"
                    >
                      <i class="fas" :class="notificationStyles[notif.type].icon"></i>
                    </div>
                    <div>
                      <h4
                        class="text-sm font-bold"
                        :class="!notif.read ? 'text-slate-900' : 'text-slate-600'"
                      >
                        {{ notif.title }}
                      </h4>
                      <p class="text-xs text-gray-500 mt-0.5 leading-snug">{{ notif.message }}</p>
                      <p class="text-[10px] text-gray-400 mt-2">{{ notif.time }}</p>
                    </div>
                  </div>
                </div>
                <div class="p-3 bg-gray-50 text-center">
                  <button
                    class="text-xs font-bold text-slate-500 hover:text-slate-900"
                    @click="goToNotifications"
                  >
                    {{ t('viewAll') }}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="flex-1 overflow-y-auto px-6 md:px-8 scrollbar-hide pb-[calc(8rem+env(safe-area-inset-bottom))]">
          <slot />
        </div>

        <div class="fixed bottom-[calc(2.5rem+env(safe-area-inset-bottom))] left-1/2 transform -translate-x-1/2 z-30">
          <button
            @click="showAddModal = true"
            class="w-16 h-16 bg-lime-400 rounded-full flex items-center justify-center shadow-lg shadow-lime-300/50 text-slate-900 border-4 border-gray-50 md:border-gray-50 hover:scale-105 transition-transform"
          >
            <i class="fas fa-plus text-2xl"></i>
          </button>
        </div>

        <div class="fixed bottom-[calc(1.5rem+env(safe-area-inset-bottom))] left-0 right-0 z-20">
          <div
            class="mx-auto max-w-md md:max-w-4xl px-4 md:px-8"
          >
            <div class="bg-slate-900 rounded-2xl px-2 py-3 flex justify-between items-center shadow-2xl mm-navbar">
              <div class="flex-1 flex justify-around">
                <NuxtLink
                  to="/"
                  class="flex flex-col items-center gap-1 transition-colors"
                  :class="isActive('/') ? 'text-lime-400' : 'text-gray-400 hover:text-white'"
                >
                  <i class="fas fa-home text-lg"></i>
                  <span class="text-[10px] font-bold">{{ t('home') }}</span>
                </NuxtLink>
                <NuxtLink
                  to="/analytics"
                  class="flex flex-col items-center gap-1 transition-colors"
                  :class="isActive('/analytics') ? 'text-lime-400' : 'text-gray-400 hover:text-white'"
                >
                  <i class="fas fa-chart-pie text-lg"></i>
                  <span class="text-[10px] font-bold">{{ t('analytics') }}</span>
                </NuxtLink>
              </div>

              <div class="w-16"></div>

              <div class="flex-1 flex justify-around">
                <NuxtLink
                  to="/master"
                  class="flex flex-col items-center gap-1 transition-colors"
                  :class="isActive('/master') ? 'text-lime-400' : 'text-gray-400 hover:text-white'"
                >
                  <i class="fas fa-database text-lg"></i>
                  <span class="text-[10px] font-bold">{{ t('master') }}</span>
                </NuxtLink>
                <NuxtLink
                  to="/profile"
                  class="flex flex-col items-center gap-1 transition-colors"
                  :class="isActive('/profile') ? 'text-lime-400' : 'text-gray-400 hover:text-white'"
                >
                  <i class="fas fa-user text-lg"></i>
                  <span class="text-[10px] font-bold">{{ t('profile') }}</span>
                </NuxtLink>
              </div>
            </div>
          </div>
        </div>

        <AddTransactionModal v-if="showAddModal" />
        <WalletModal v-if="showWalletModal" />
        <CategoryModal v-if="showCategoryModal" />
        <DeleteWalletModal v-if="showDeleteWalletModal" />
        <DeleteCategoryModal v-if="showDeleteCategoryModal" />
        <EditProfileModal v-if="showProfileModal" />
        <ChangePasswordModal v-if="showPasswordModal" />
      </div>
    </div>
  </div>
</template>
