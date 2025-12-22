<script setup lang="ts">
const route = useRoute();

const isActive = (path: string) => {
    return route.path === path;
};
</script>

<template>
    <nav class="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-navy-900 to-navy-800 shadow-2xl z-50">
        <div class="max-w-6xl mx-auto px-4">
            <div class="flex items-center justify-around py-3 relative">
                <!-- Beranda -->
                <NuxtLink to="/"
                    class="flex flex-col items-center gap-1 py-2 px-4 rounded-xl transition-all duration-200"
                    :class="isActive('/') ? 'text-lime-400' : 'text-slate-400 hover:text-white'">
                    <i class="fas fa-home text-xl"></i>
                    <span class="text-xs font-semibold">Beranda</span>
                </NuxtLink>

                <!-- Analitik -->
                <NuxtLink to="/analytics"
                    class="flex flex-col items-center gap-1 py-2 px-4 rounded-xl transition-all duration-200"
                    :class="isActive('/analytics') ? 'text-lime-400' : 'text-slate-400 hover:text-white'">
                    <i class="fas fa-chart-line text-xl"></i>
                    <span class="text-xs font-semibold">Analitik</span>
                </NuxtLink>

                <!-- Add Button (Center) -->
                <div class="absolute left-1/2 -translate-x-1/2 -top-8">
                    <NuxtLink to="/transaction/add"
                        class="w-16 h-16 bg-gradient-to-br from-lime-400 to-lime-500 rounded-full shadow-xl flex items-center justify-center hover:scale-110 transition-transform duration-200 ring-4 ring-navy-900">
                        <i class="fas fa-plus text-navy-900 text-2xl"></i>
                    </NuxtLink>
                </div>

                <!-- Master -->
                <NuxtLink to="/master"
                    class="flex flex-col items-center gap-1 py-2 px-4 rounded-xl transition-all duration-200"
                    :class="isActive('/master') ? 'text-lime-400' : 'text-slate-400 hover:text-white'">
                    <i class="fas fa-database text-xl"></i>
                    <span class="text-xs font-semibold">Master</span>
                </NuxtLink>

                <!-- Profil -->
                <NuxtLink to="/profile"
                    class="flex flex-col items-center gap-1 py-2 px-4 rounded-xl transition-all duration-200"
                    :class="isActive('/profile') ? 'text-lime-400' : 'text-slate-400 hover:text-white'">
                    <i class="fas fa-user text-xl"></i>
                    <span class="text-xs font-semibold">Profil</span>
                </NuxtLink>
            </div>
        </div>
    </nav>
</template>

<style scoped>
.from-navy-900 {
    --tw-gradient-from: #0f172a;
}

.to-navy-800 {
    --tw-gradient-to: #1e293b;
}

.ring-navy-900 {
    --tw-ring-color: #0f172a;
}
</style>