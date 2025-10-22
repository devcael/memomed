import { createRouter, createWebHistory } from 'vue-router'
import LoginPage from '@/app/pages/LoginPage.vue'
import DashboardPage from '@/app/pages/DashboardPage.vue'
import QuizPage from '@/app/pages/QuizPage.vue'
import ReviewPage from '@/app/pages/ReviewPage.vue'
import { useAuthStore } from '@/app/stores/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/dashboard',
    },
    {
      path: '/login',
      name: 'login',
      component: LoginPage,
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: DashboardPage,
      meta: { requiresAuth: true },
    },
    {
      path: '/quiz',
      name: 'quiz',
      component: QuizPage,
      meta: { requiresAuth: true },
    },
    {
      path: '/review',
      name: 'review',
      component: ReviewPage,
      meta: { requiresAuth: true },
    },
  ],
})

// Guard de navegação para proteger rotas autenticadas
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()

  // Verifica se a rota requer autenticação
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next('/login')
  }
  // Se está autenticado e tentando acessar o login, redireciona para dashboard
  else if (to.path === '/login' && authStore.isAuthenticated) {
    next('/dashboard')
  } else {
    next()
  }
})

export default router
