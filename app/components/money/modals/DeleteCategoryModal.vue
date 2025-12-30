<script setup lang="ts">
const {
  showDeleteCategoryModal,
  categoryToDelete,
  confirmDeleteCategory,
  cancelDeleteCategory,
  t,
} = useMoneyManager();
</script>

<template>
  <div
    v-if="showDeleteCategoryModal"
    class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center px-4"
    @click.self="cancelDeleteCategory"
  >
    <div class="bg-white w-full max-w-sm rounded-3xl p-6 animate-slide-up-content shadow-2xl md:animate-fade-in">
      <div class="flex justify-between items-center mb-4">
        <div>
          <h3 class="text-xl font-bold text-slate-900">{{ t('deleteCategory') }}</h3>
          <p class="text-xs text-gray-400">{{ t('deleteWarning') }}</p>
        </div>
        <button @click="cancelDeleteCategory" class="p-2 bg-gray-100 rounded-full text-gray-500 hover:bg-gray-200">
          <i class="fas fa-times"></i>
        </button>
      </div>
      <div class="bg-gray-50 border border-gray-100 rounded-2xl p-4 mb-5">
        <p class="text-xs text-gray-400">{{ t('deleteCategoryItemLabel') }}</p>
        <p class="text-sm font-bold text-slate-900 mt-1">{{ categoryToDelete?.name || '-' }}</p>
        <p class="text-[10px] text-gray-400 mt-2">{{ t('deleteNote') }}</p>
      </div>
      <div class="flex gap-3">
        <button
          @click="cancelDeleteCategory"
          class="flex-1 bg-gray-100 text-slate-700 py-3 rounded-xl font-bold hover:bg-gray-200 transition-colors"
        >
          {{ t('cancel') }}
        </button>
        <button
          @click="confirmDeleteCategory"
          class="flex-1 bg-red-500 text-white py-3 rounded-xl font-bold hover:bg-red-600 transition-colors"
        >
          {{ t('deleteAction') }}
        </button>
      </div>
    </div>
  </div>
</template>
