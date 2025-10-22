<template>
  <div class="min-h-screen bg-neutral-950 flex items-center justify-center p-4">
    <div class="w-full max-w-md">
      <div class="bg-neutral-900 border border-neutral-800 rounded-xl shadow-2xl p-8">
        <div class="text-center mb-8">
          <h1 class="text-3xl font-bold text-neutral-100">Memo Med</h1>
          <p class="text-neutral-400 mt-2">Entre para começar seus estudos</p>
        </div>

        <form @submit.prevent="handleSubmit" class="space-y-6">
          <div class="space-y-2">
            <label for="username" class="text-sm font-medium text-neutral-200">
              Nome de usuário
            </label>
            <Input
              id="username"
              v-model="username"
              type="text"
              placeholder="Digite seu nome de usuário"
              required
              :disabled="authStore.isLoading"
              class="bg-neutral-800 border-neutral-700 text-neutral-100 placeholder:text-neutral-500 focus:border-neutral-600 focus:ring-neutral-600"
            />
          </div>

          <div class="space-y-2">
            <label for="password" class="text-sm font-medium text-neutral-200"> Senha </label>
            <Input
              id="password"
              v-model="password"
              type="password"
              placeholder="Digite sua senha"
              required
              :disabled="authStore.isLoading"
              class="bg-neutral-800 border-neutral-700 text-neutral-100 placeholder:text-neutral-500 focus:border-neutral-600 focus:ring-neutral-600"
            />
          </div>

          <Button
            type="submit"
            class="w-full bg-neutral-100 hover:bg-neutral-200 text-neutral-900 font-medium"
            :disabled="authStore.isLoading"
          >
            <span v-if="!authStore.isLoading">Entrar</span>
            <span v-else class="flex items-center gap-2">
              <div
                class="w-4 h-4 border-2 border-neutral-700 border-t-transparent rounded-full animate-spin"
              ></div>
              Entrando...
            </span>
          </Button>
        </form>

        <div class="mt-6 text-center">
          <p class="text-sm text-neutral-500">Não tem conta? Ela será criada automaticamente!</p>
        </div>
      </div>
      <div class="mt-6 text-center">
        <p class="text-md text-neutral-500">Feito com 💖 pra Lalai</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { toast } from 'vue-sonner'
import { useAuthStore } from '@/app/stores/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

const router = useRouter()
const authStore = useAuthStore()

const username = ref('')
const password = ref('')

const handleSubmit = async () => {
  if (!username.value.trim() || !password.value.trim()) {
    toast.error('Por favor, preencha todos os campos')
    return
  }

  await authStore.login(username.value.trim(), password.value)
}

// Observa mudanças no estado de autenticação
watch(
  () => authStore.isAuthenticated,
  (isAuthenticated) => {
    if (isAuthenticated) {
      toast.success('Login realizado com sucesso!')
      router.push('/dashboard')
    }
  },
)

// Observa mudanças no erro de autenticação
watch(
  () => authStore.error,
  (error) => {
    if (error) {
      toast.error(error)
    }
  },
)
</script>
