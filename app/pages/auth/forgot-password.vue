<script setup lang="ts">
import { ref } from 'vue'

const email = ref('')

const handleSubmit = async () => {
  // Add your password reset logic here
  console.log('Reset link sent to:', email.value)
}
</script>
<template>
    <div class="forgot-password">
        <h1>Forgot Password</h1>
        <form @submit.prevent="handleSubmit">
            <label for="email">Email:</label>
            <input type="email" id="email" v-model="email" required />
            <button type="submit">Send Reset Link</button>
        </form>
    </div>
</template>