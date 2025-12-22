<script setup lang="ts">
const route = useRoute();

const email = ref("");
const password = ref("");
const showPassword = ref(false);
const rememberMe = ref(false);
const loading = ref(false);
const errorMsg = ref<string | null>(null);

async function login() {
    loading.value = true;
    errorMsg.value = null;

    try {
        await $fetch('/api/auth/login', {
            method: 'POST',
            body: {
                email: email.value,
                password: password.value,
            },
        });

        const redirect = typeof route.query.redirect === "string" ? route.query.redirect : "/";
        return navigateTo(redirect);
    } catch (error: any) {
        errorMsg.value =
            error?.data?.statusMessage ||
            error?.data?.message ||
            error?.message ||
            "Login gagal.";
    } finally {
        loading.value = false;
    }
}
</script>

<template>
    <div
        class="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4">
        <div class="w-full max-w-md">
            <!-- Logo & Header -->
            <div class="text-center mb-8">
                <div
                    class="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-2xl mb-4 shadow-lg">
                    <i class="fas fa-dollar-sign text-white text-3xl"></i>
                </div>
                <h1 class="text-3xl font-bold text-white mb-2">Money Manager App</h1>
                <p class="text-blue-200 text-sm">Kelola uang anda dengan mudah</p>
            </div>

            <!-- Login Card -->
            <div class="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-8">
                <h2 class="text-2xl font-bold text-slate-800 mb-2">Selamat Datang</h2>
                <p class="text-slate-500 text-sm mb-6">Masuk untuk mengelola uang anda</p>

                <form @submit.prevent="login">
                    <!-- Email Input -->
                    <div class="mb-4">
                        <label class="block text-slate-700 text-sm font-semibold mb-2" for="email">
                            Email
                        </label>
                        <div class="relative">
                            <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <i class="fas fa-envelope text-slate-400"></i>
                            </div>
                            <input v-model="email" type="email" id="email" required
                                class="w-full pl-12 pr-4 py-3 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
                                placeholder="email@example.com" />
                        </div>
                    </div>

                    <!-- Password Input -->
                    <div class="mb-2">
                        <label class="block text-slate-700 text-sm font-semibold mb-2" for="password">
                            Password
                        </label>
                        <div class="relative">
                            <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <i class="fas fa-lock text-slate-400"></i>
                            </div>
                            <input v-model="password" :type="showPassword ? 'text' : 'password'" id="password" required
                                class="w-full pl-12 pr-12 py-3 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
                                placeholder="••••••••" />
                            <button type="button" @click="showPassword = !showPassword"
                                class="absolute inset-y-0 right-0 pr-4 flex items-center hover:text-slate-600">
                                <i :class="showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'" class="text-slate-400"></i>
                            </button>
                        </div>
                    </div>

                    <!-- Remember & Forgot -->
                    <div class="flex items-center justify-between mb-6">
                        <label class="flex items-center cursor-pointer">
                            <input type="checkbox" v-model="rememberMe"
                                class="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500">
                            <span class="ml-2 text-sm text-slate-600">Ingat saya</span>
                        </label>
                        <NuxtLink to="/auth/forgot-password"
                            class="text-sm text-blue-600 hover:text-blue-700 font-semibold">
                            Lupa kata sandi?
                        </NuxtLink>
                    </div>

                    <!-- Error Message -->
                    <div v-if="errorMsg" class="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl">
                        <div class="flex items-center">
                            <i class="fas fa-exclamation-circle text-red-600 mr-2"></i>
                            <p class="text-sm text-red-600">{{ errorMsg }}</p>
                        </div>
                    </div>

                    <!-- Login Button -->
                    <button type="submit" :disabled="loading"
                        class="w-full bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold py-3.5 rounded-xl hover:from-blue-700 hover:to-cyan-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none">
                        <i :class="loading ? 'fas fa-spinner fa-spin' : 'fas fa-sign-in-alt'" class="mr-2"></i>
                        {{ loading ? "Memproses..." : "Masuk" }}
                    </button>
                </form>

                <!-- Sign Up Link -->
                <div class="mt-6 text-center">
                    <p class="text-slate-600 text-sm">
                        Belum punya akun?
                        <a href="/auth/register" class="text-blue-600 hover:text-blue-700 font-semibold cursor-pointer">
                            Daftar sekarang
                        </a>
                    </p>
                </div>
            </div>

            <!-- Footer -->
            <div class="mt-6 text-center">
                <p class="text-blue-200 text-xs">
                    <i class="fas fa-shield-alt mr-1"></i>
                    © {{ new Date().getFullYear() }} Money Manager App. All rights reserved.
                </p>
            </div>
        </div>
    </div>
</template>
