<script setup lang="ts">
const {
  displayName,
  displayEmail,
  initials,
  avatarUrl,
  notificationsEnabled,
  darkModeEnabled,
  preferredCurrency,
  preferredLanguage,
  reportingStartDay,
  currencyOptions,
  languageOptions,
  reportingStartDayOptions,
  toggleNotificationsPreference,
  toggleDarkModePreference,
  setCurrencyPreference,
  setLanguagePreference,
  setReportingStartDay,
  t,
  handleLogout,
  openProfileModal,
  openPasswordModal,
} = useMoneyManager();
</script>

<template>
  <div class="animate-fade-in pb-32 pt-6">
    <div class="bg-slate-900 rounded-3xl p-6 text-white shadow-xl shadow-slate-200 mb-6 text-center relative overflow-hidden">
      <div class="absolute -right-4 -top-4 w-32 h-32 bg-lime-400 opacity-10 rounded-full blur-2xl"></div>
      <div class="absolute -left-4 -bottom-4 w-24 h-24 bg-blue-500 opacity-20 rounded-full blur-xl"></div>
      <div class="w-24 h-24 bg-gray-200 rounded-full mx-auto mb-4 border-4 border-slate-800 relative shadow-lg overflow-hidden">
        <img
          v-if="avatarUrl"
          :src="avatarUrl"
          alt="Avatar"
          class="w-full h-full object-cover rounded-full"
        />
        <div
          v-else
          class="w-full h-full flex items-center justify-center bg-gradient-to-br from-lime-400 to-green-500 rounded-full text-slate-900 font-bold text-3xl"
        >
          {{ initials }}
        </div>
        <button
          class="absolute bottom-0 right-0 bg-white p-2 rounded-full text-slate-900 shadow-md border border-gray-100 hover:bg-gray-50 transition-colors"
          @click="openProfileModal"
        >
          <i class="fas fa-pencil text-xs"></i>
        </button>
      </div>
      <h2 class="text-xl font-bold tracking-tight">{{ displayName }}</h2>
      <p class="text-slate-400 text-sm">{{ displayEmail }}</p>
    </div>

    <div class="space-y-6">
      <div>
        <h3 class="text-xs font-bold text-gray-400 uppercase mb-2 ml-4">{{ t('account') }}</h3>
        <div class="bg-white rounded-2xl p-2 shadow-sm border border-gray-100">
          <div
            class="flex items-center justify-between p-3 rounded-xl cursor-pointer transition-colors hover:bg-gray-50"
            @click="openProfileModal"
          >
            <div class="flex items-center gap-3">
              <div class="p-2 rounded-lg bg-gray-100 text-slate-700">
                <i class="fas fa-user"></i>
              </div>
              <span class="font-medium text-slate-700">{{ t('editProfile') }}</span>
            </div>
            <i class="fas fa-chevron-right text-gray-400"></i>
          </div>
          <div
            class="flex items-center justify-between p-3 rounded-xl cursor-pointer transition-colors hover:bg-gray-50"
            @click="openPasswordModal"
          >
            <div class="flex items-center gap-3">
              <div class="p-2 rounded-lg bg-gray-100 text-slate-700">
                <i class="fas fa-lock"></i>
              </div>
              <span class="font-medium text-slate-700">{{ t('changePassword') }}</span>
            </div>
            <i class="fas fa-chevron-right text-gray-400"></i>
          </div>
        </div>
      </div>

      <div>
        <h3 class="text-xs font-bold text-gray-400 uppercase mb-2 ml-4">{{ t('preferences') }}</h3>
        <div class="bg-white rounded-2xl p-2 shadow-sm border border-gray-100">
          <div class="flex items-center justify-between p-3 rounded-xl transition-colors hover:bg-gray-50">
            <div class="flex items-center gap-3">
              <div class="p-2 rounded-lg bg-gray-100 text-slate-700">
                <i class="fas fa-bell"></i>
              </div>
              <span class="font-medium text-slate-700">{{ t('notifications') }}</span>
            </div>
            <button
              type="button"
              class="w-10 h-6 rounded-full p-1 transition-colors"
              :class="notificationsEnabled ? 'bg-lime-400' : 'bg-gray-200'"
              @click="toggleNotificationsPreference"
            >
              <span
                class="block w-4 h-4 bg-white rounded-full shadow-sm transition-transform"
                :class="notificationsEnabled ? 'translate-x-4' : 'translate-x-0'"
              ></span>
            </button>
          </div>
          <div class="flex items-center justify-between p-3 rounded-xl transition-colors hover:bg-gray-50">
            <div class="flex items-center gap-3">
              <div class="p-2 rounded-lg bg-gray-100 text-slate-700">
                <i class="fas fa-moon"></i>
              </div>
              <span class="font-medium text-slate-700">{{ t('darkMode') }}</span>
            </div>
            <button
              type="button"
              class="w-10 h-6 rounded-full p-1 transition-colors"
              :class="darkModeEnabled ? 'bg-lime-400' : 'bg-gray-200'"
              @click="toggleDarkModePreference"
            >
              <span
                class="block w-4 h-4 bg-white rounded-full shadow-sm transition-transform"
                :class="darkModeEnabled ? 'translate-x-4' : 'translate-x-0'"
              ></span>
            </button>
          </div>
          <div class="flex items-center justify-between p-3 rounded-xl transition-colors hover:bg-gray-50">
            <div class="flex items-center gap-3">
              <div class="p-2 rounded-lg bg-gray-100 text-slate-700">
                <i class="fas fa-landmark"></i>
              </div>
              <span class="font-medium text-slate-700">{{ t('currency') }}</span>
            </div>
            <div class="relative">
              <select
                class="appearance-none bg-gray-50 border border-gray-200 rounded-lg text-xs font-semibold text-slate-600 px-2.5 py-1.5 pr-7"
                :value="preferredCurrency"
                @change="setCurrencyPreference(($event.target as HTMLSelectElement).value as any)"
              >
                <option v-for="option in currencyOptions" :key="option.value" :value="option.value">
                  {{ option.label }}
                </option>
              </select>
              <i class="fas fa-chevron-down text-gray-400 text-xs absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none"></i>
            </div>
          </div>
          <div class="flex items-center justify-between p-3 rounded-xl transition-colors hover:bg-gray-50">
            <div class="flex items-center gap-3">
              <div class="p-2 rounded-lg bg-gray-100 text-slate-700">
                <i class="fas fa-language"></i>
              </div>
              <span class="font-medium text-slate-700">{{ t('language') }}</span>
            </div>
            <div class="relative">
              <select
                class="appearance-none bg-gray-50 border border-gray-200 rounded-lg text-xs font-semibold text-slate-600 px-2.5 py-1.5 pr-7"
                :value="preferredLanguage"
                @change="setLanguagePreference(($event.target as HTMLSelectElement).value as any)"
              >
                <option v-for="option in languageOptions" :key="option.value" :value="option.value">
                  {{ option.label }}
                </option>
              </select>
              <i class="fas fa-chevron-down text-gray-400 text-xs absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none"></i>
            </div>
          </div>
          <div class="flex items-center justify-between p-3 rounded-xl transition-colors hover:bg-gray-50">
            <div class="flex items-center gap-3">
              <div class="p-2 rounded-lg bg-gray-100 text-slate-700">
                <i class="fas fa-calendar-day"></i>
              </div>
              <span class="font-medium text-slate-700">{{ t('reportingPeriod') }}</span>
            </div>
            <div class="relative">
              <select
                class="appearance-none bg-gray-50 border border-gray-200 rounded-lg text-xs font-semibold text-slate-600 px-2.5 py-1.5 pr-7"
                :value="reportingStartDay"
                @change="setReportingStartDay(Number(($event.target as HTMLSelectElement).value))"
              >
                <option v-for="day in reportingStartDayOptions" :key="day" :value="day">
                  {{ t('reportingStartDayLabel') }} {{ day }}
                </option>
              </select>
              <i class="fas fa-chevron-down text-gray-400 text-xs absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none"></i>
            </div>
          </div>
          <p class="px-3 pb-3 text-[10px] text-gray-400">{{ t('reportingStartDayHint') }}</p>
        </div>
      </div>

      <div>
        <h3 class="text-xs font-bold text-gray-400 uppercase mb-2 ml-4">{{ t('dataSecurity') }}</h3>
        <div class="bg-white rounded-2xl p-2 shadow-sm border border-gray-100">
          <div class="flex items-center justify-between p-3 rounded-xl cursor-pointer transition-colors hover:bg-gray-50">
            <div class="flex items-center gap-3">
              <div class="p-2 rounded-lg bg-gray-100 text-slate-700">
                <i class="fas fa-shield-alt"></i>
              </div>
              <span class="font-medium text-slate-700">{{ t('privacyPolicy') }}</span>
            </div>
            <i class="fas fa-chevron-right text-gray-400"></i>
          </div>
          <div class="flex items-center justify-between p-3 rounded-xl cursor-pointer transition-colors hover:bg-gray-50">
            <div class="flex items-center gap-3">
              <div class="p-2 rounded-lg bg-gray-100 text-slate-700">
                <i class="fas fa-circle-question"></i>
              </div>
              <span class="font-medium text-slate-700">{{ t('helpCenter') }}</span>
            </div>
            <i class="fas fa-chevron-right text-gray-400"></i>
          </div>
          <div class="h-[1px] bg-gray-100 my-1"></div>
          <div class="flex items-center justify-between p-3 rounded-xl cursor-pointer transition-colors hover:bg-red-50">
            <div class="flex items-center gap-3">
              <div class="p-2 rounded-lg bg-red-100 text-red-500">
                <i class="fas fa-trash"></i>
              </div>
              <span class="font-medium text-red-600">{{ t('deleteAccount') }}</span>
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
        {{ t('logout') }}
      </button>
      <p class="text-center text-[10px] text-gray-400 mt-2">
        {{ t('appVersion', { version: '1.0.0' }) }}
      </p>
    </div>
  </div>
</template>
