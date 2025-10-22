<template>
  <div class="dark">
    <router-view />
    <Toaster />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useAuthStore } from '@/app/stores/auth'
import { Toaster } from '@/components/ui/sonner'
import 'vue-sonner/style.css'

const authStore = useAuthStore()

// Verifica se há uma sessão salva ao carregar a aplicação
onMounted(() => {
  authStore.checkSession()
})
</script>

<style scoped>
/* Estilos personalizados podem ser adicionados aqui */
</style>
