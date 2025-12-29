<script setup lang="ts">
const route = useRoute();
const name = ref("");
const email = ref("");
const password = ref("");
const confirmPassword = ref("");
const showPassword = ref(false);
const showConfirmPassword = ref(false);
const agreeTerms = ref(false);
const loading = ref(false);
const message = ref<string | null>(null);
const errorMsg = ref<string | null>(null);

async function register() {
    if (!name.value.trim()) {
        errorMsg.value = "Nama wajib diisi";
        return;
    }

    // Validasi password match
    if (password.value !== confirmPassword.value) {
        errorMsg.value = "Password tidak cocok";
        return;
    }

    // Validasi terms
    if (!agreeTerms.value) {
        errorMsg.value = "Anda harus menyetujui syarat dan ketentuan";
        return;
    }

    loading.value = true;
    message.value = null;
    errorMsg.value = null;

    try {
        await $fetch('/api/auth/register', {
            method: 'POST',
            body: {
                name: name.value,
                email: email.value,
                password: password.value,
            },
        });

        message.value = "Registrasi berhasil. Mengalihkan ke aplikasi...";
        const redirect = typeof route.query.redirect === "string" ? route.query.redirect : "/";
        await navigateTo(redirect);
    } catch (error: any) {
        errorMsg.value =
            error?.data?.statusMessage ||
            error?.data?.message ||
            error?.message ||
            "Registrasi gagal.";
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
                <h1 class="text-3xl font-bold text-white mb-2">FinanceHub</h1>
                <p class="text-blue-200 text-sm">Mulai kelola keuangan Anda hari ini</p>
            </div>

            <!-- Register Card -->
            <div class="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-8">
                <h2 class="text-2xl font-bold text-slate-800 mb-2">Buat Akun Baru</h2>
                <p class="text-slate-500 text-sm mb-6">Daftar untuk memulai perjalanan finansial Anda</p>

                <form @submit.prevent="register">
                    <!-- Name Input -->
                    <div class="mb-4">
                        <label class="block text-slate-700 text-sm font-semibold mb-2" for="name">
                            Nama
                        </label>
                        <div class="relative">
                            <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <i class="fas fa-user text-slate-400"></i>
                            </div>
                            <input v-model="name" type="text" id="name" required
                                class="w-full pl-12 pr-4 py-3 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
                                placeholder="Nama lengkap" />
                        </div>
                    </div>

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
                    <div class="mb-4">
                        <label class="block text-slate-700 text-sm font-semibold mb-2" for="password">
                            Password
                        </label>
                        <div class="relative">
                            <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <i class="fas fa-lock text-slate-400"></i>
                            </div>
                            <input v-model="password" :type="showPassword ? 'text' : 'password'" id="password" required
                                minlength="6"
                                class="w-full pl-12 pr-12 py-3 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
                                placeholder="Minimal 6 karakter" />
                            <button type="button" @click="showPassword = !showPassword"
                                class="absolute inset-y-0 right-0 pr-4 flex items-center hover:text-slate-600">
                                <i :class="showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'" class="text-slate-400"></i>
                            </button>
                        </div>
                    </div>

                    <!-- Confirm Password Input -->
                    <div class="mb-4">
                        <label class="block text-slate-700 text-sm font-semibold mb-2" for="confirmPassword">
                            Konfirmasi Password
                        </label>
                        <div class="relative">
                            <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <i class="fas fa-lock text-slate-400"></i>
                            </div>
                            <input v-model="confirmPassword" :type="showConfirmPassword ? 'text' : 'password'"
                                id="confirmPassword" required
                                class="w-full pl-12 pr-12 py-3 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
                                placeholder="Ulangi password" />
                            <button type="button" @click="showConfirmPassword = !showConfirmPassword"
                                class="absolute inset-y-0 right-0 pr-4 flex items-center hover:text-slate-600">
                                <i :class="showConfirmPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"
                                    class="text-slate-400"></i>
                            </button>
                        </div>
                    </div>

                    <!-- Terms & Conditions -->
                    <div class="mb-6">
                        <label class="flex items-start cursor-pointer">
                            <input type="checkbox" v-model="agreeTerms"
                                class="w-4 h-4 mt-1 text-blue-600 border-slate-300 rounded focus:ring-blue-500">
                            <span class="ml-3 text-sm text-slate-600">
                                Saya menyetujui
                                <a href="#" class="text-blue-600 hover:text-blue-700 font-semibold">Syarat &
                                    Ketentuan</a>
                                dan
                                <a href="#" class="text-blue-600 hover:text-blue-700 font-semibold">Kebijakan
                                    Privasi</a>
                            </span>
                        </label>
                    </div>

                    <!-- Success Message -->
                    <div v-if="message" class="mb-4 p-3 bg-green-50 border border-green-200 rounded-xl">
                        <div class="flex items-center">
                            <i class="fas fa-check-circle text-green-600 mr-2"></i>
                            <p class="text-sm text-green-600">{{ message }}</p>
                        </div>
                    </div>

                    <!-- Error Message -->
                    <div v-if="errorMsg" class="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl">
                        <div class="flex items-center">
                            <i class="fas fa-exclamation-circle text-red-600 mr-2"></i>
                            <p class="text-sm text-red-600">{{ errorMsg }}</p>
                        </div>
                    </div>

                    <!-- Register Button -->
                    <button type="submit" :disabled="loading"
                        class="w-full bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold py-3.5 rounded-xl hover:from-blue-700 hover:to-cyan-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none">
                        <i :class="loading ? 'fas fa-spinner fa-spin' : 'fas fa-user-plus'" class="mr-2"></i>
                        {{ loading ? "Memproses..." : "Daftar Sekarang" }}
                    </button>
                </form>

                <!-- Login Link -->
                <div class="mt-6 text-center">
                    <p class="text-slate-600 text-sm">
                        Sudah punya akun?
                        <NuxtLink to="/auth/login" class="text-blue-600 hover:text-blue-700 font-semibold">
                            Masuk di sini
                        </NuxtLink>
                    </p>
                </div>
            </div>

            <!-- Footer -->
            <div class="mt-6 text-center">
                <p class="text-blue-200 text-xs">
                    <i class="fas fa-shield-alt mr-1"></i>
                    © 2024 FinanceHub. Data Anda aman dan terenkripsi
                </p>
            </div>
        </div>
    </div>
</template>
