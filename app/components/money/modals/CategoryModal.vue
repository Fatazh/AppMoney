<script setup lang="ts">
const {
  showCategoryModal,
  categoryForm,
  editingCategory,
  handleSaveCategory,
  requestDeleteCategory,
  t,
} = useMoneyManager();

const iconOptions = [
  { id: 'fa-mug-hot', label: 'Makanan' },
  { id: 'fa-shopping-bag', label: 'Belanja' },
  { id: 'fa-car', label: 'Transport' },
  { id: 'fa-bolt', label: 'Tagihan' },
  { id: 'fa-film', label: 'Hiburan' },
  { id: 'fa-heart', label: 'Kesehatan' },
  { id: 'fa-briefcase', label: 'Gaji' },
  { id: 'fa-gift', label: 'Bonus' },
  { id: 'fa-chart-line', label: 'Investasi' },
  { id: 'fa-box-open', label: 'Penjualan' },
  { id: 'fa-coins', label: 'Lainnya' },
  { id: 'fa-tag', label: 'Label' },
];
</script>

<template>
  <div class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center px-4">
    <div class="bg-white w-full max-w-sm rounded-3xl p-6 animate-slide-up-content shadow-2xl md:animate-fade-in">
      <div class="flex justify-between items-center mb-6">
        <h3 class="text-xl font-bold text-slate-900">
          {{ editingCategory ? t('editCategory') : t('addCategory') }}
        </h3>
        <button @click="showCategoryModal = false" class="p-2 bg-gray-100 rounded-full text-gray-500 hover:bg-gray-200">
          <i class="fas fa-times"></i>
        </button>
      </div>
      <div class="space-y-4 mb-8">
        <div>
          <label class="block text-xs text-gray-400 mb-1 ml-1">{{ t('categoryNameLabel') }}</label>
          <input
            v-model="categoryForm.name"
            type="text"
            :placeholder="t('categoryExample')"
            class="w-full bg-gray-50 border border-gray-100 rounded-xl p-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-lime-400"
          />
        </div>
        <div>
          <label class="block text-xs text-gray-400 mb-1 ml-1">{{ t('typeLabel') }}</label>
          <div class="flex gap-2">
            <button
              type="button"
              class="flex-1 py-2 rounded-xl text-xs font-bold border transition-colors"
              :class="categoryForm.type === 'expense' ? 'bg-red-50 text-red-600 border-red-200' : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'"
              @click="categoryForm.type = 'expense'"
            >
              {{ t('expenseBadge') }}
            </button>
            <button
              type="button"
              class="flex-1 py-2 rounded-xl text-xs font-bold border transition-colors"
              :class="categoryForm.type === 'income' ? 'bg-lime-50 text-lime-700 border-lime-200' : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'"
              @click="categoryForm.type = 'income'"
            >
              {{ t('incomeBadge') }}
            </button>
          </div>
        </div>
        <div>
          <label class="block text-xs text-gray-400 mb-2 ml-1">{{ t('icon') }}</label>
          <div class="grid grid-cols-4 gap-2">
            <button
              v-for="icon in iconOptions"
              :key="icon.id"
              type="button"
              class="flex flex-col items-center justify-center gap-1 p-2 rounded-xl border transition-colors"
              :class="categoryForm.icon === icon.id ? 'border-lime-400 bg-lime-50 text-lime-600' : 'border-gray-200 text-slate-500 hover:border-lime-300'"
              @click="categoryForm.icon = icon.id"
            >
              <i class="fas text-sm" :class="icon.id"></i>
              <span class="text-[10px] font-semibold">{{ icon.label }}</span>
            </button>
          </div>
        </div>
      </div>
      <div class="space-y-3">
        <button
          @click="handleSaveCategory"
          class="w-full bg-lime-400 text-slate-900 py-3 rounded-xl font-bold hover:bg-lime-500 transition-colors"
        >
          {{ editingCategory ? t('saveChanges') : t('saveCategory') }}
        </button>
        <button
          v-if="editingCategory"
          @click="requestDeleteCategory()"
          class="w-full bg-red-50 text-red-600 py-3 rounded-xl font-bold hover:bg-red-100 transition-colors border border-red-100"
        >
          {{ t('deleteCategory') }}
        </button>
      </div>
    </div>
  </div>
</template>
