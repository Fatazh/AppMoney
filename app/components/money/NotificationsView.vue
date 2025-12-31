<script setup lang="ts">
import { onMounted, ref } from 'vue';

const {
  notifications,
  notificationStyles,
  notificationsEnabled,
  markAllNotificationsRead,
  markNotificationRead,
  refreshNotifications,
  t,
} = useMoneyManager();

const isLoading = ref(false);

const loadNotifications = async () => {
  if (!notificationsEnabled.value) return;
  isLoading.value = true;
  try {
    await refreshNotifications(50);
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  void loadNotifications();
});
</script>

<template>
  <div class="animate-fade-in pb-32 pt-6">
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-lg font-bold text-slate-900">{{ t('notifications') }}</h2>
      <button
        class="text-xs font-bold text-lime-600 hover:text-lime-700"
        :class="!notificationsEnabled || notifications.length === 0 ? 'opacity-60 cursor-not-allowed' : ''"
        :disabled="!notificationsEnabled || notifications.length === 0"
        @click="markAllNotificationsRead"
      >
        {{ t('markAllRead') }}
      </button>
    </div>

    <div
      v-if="!notificationsEnabled"
      class="rounded-2xl border border-gray-100 bg-gray-50 p-4 text-sm text-gray-400"
    >
      {{ t('notificationsOff') }}
    </div>
    <div
      v-else-if="isLoading"
      class="rounded-2xl border border-gray-100 bg-white p-4 text-sm text-gray-400 flex items-center gap-2"
    >
      <i class="fas fa-spinner fa-spin text-lime-500"></i>
      <span>{{ t('loading') }}</span>
    </div>
    <div
      v-else-if="notifications.length === 0"
      class="rounded-2xl border border-dashed border-gray-200 bg-white p-6 text-center text-sm text-gray-400"
    >
      {{ t('noNotifications') }}
    </div>
    <div v-else class="space-y-3">
      <div
        v-for="notif in notifications"
        :key="notif.id"
        class="p-4 bg-white border border-gray-100 rounded-2xl shadow-sm flex gap-3 cursor-pointer transition-colors hover:bg-gray-50"
        :class="!notif.read ? 'bg-lime-50/30 border-lime-200/50' : ''"
        @click="markNotificationRead(notif.id)"
      >
        <div
          class="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
          :class="[notificationStyles[notif.type].bg, notificationStyles[notif.type].color]"
        >
          <i class="fas" :class="notificationStyles[notif.type].icon"></i>
        </div>
        <div class="flex-1 min-w-0">
          <div class="flex items-start justify-between gap-3">
            <h4
              class="text-sm font-bold"
              :class="!notif.read ? 'text-slate-900' : 'text-slate-600'"
            >
              {{ notif.title }}
            </h4>
            <span class="text-[10px] text-gray-400 shrink-0">{{ notif.time }}</span>
          </div>
          <p class="text-xs text-gray-500 mt-1 leading-snug">{{ notif.message }}</p>
        </div>
      </div>
    </div>
  </div>
</template>
