import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useSettingsStore = defineStore('settings', () => {
  // Configuração para habilitar modo de input
  const enableInputMode = ref(false)

  // Salva as configurações no localStorage
  const saveSettings = () => {
    localStorage.setItem(
      'quiz-settings',
      JSON.stringify({
        enableInputMode: enableInputMode.value,
      }),
    )
  }

  // Carrega as configurações do localStorage
  const loadSettings = () => {
    try {
      const saved = localStorage.getItem('quiz-settings')
      if (saved) {
        const settings = JSON.parse(saved)
        enableInputMode.value = settings.enableInputMode || false
      }
    } catch (error) {
      console.error('Erro ao carregar configurações:', error)
    }
  }

  // Alterna o modo de input
  const toggleInputMode = () => {
    enableInputMode.value = !enableInputMode.value
    saveSettings()
  }

  return {
    enableInputMode,
    saveSettings,
    loadSettings,
    toggleInputMode,
  }
})
