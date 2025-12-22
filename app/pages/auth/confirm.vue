<script setup lang="ts">
const route = useRoute();

onMounted(async () => {
    const response = await $fetch('/api/auth/me').catch(() => ({ user: null }));
    if (response?.user) {
        const redirect =
            typeof route.query.redirect === "string"
                ? route.query.redirect
                : "/";
        return navigateTo(redirect);
    }
});
</script>

<template>
    <div class="min-h-screen flex items-center justify-center">
        <div class="rounded-2xl border p-6">Waiting for login...</div>
    </div>
</template>
