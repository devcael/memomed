# 🏥 Memo Med - Sistema de Quiz Médico

Uma aplicação simples de estudos médicos desenvolvida com Vue 3, TypeScript, Firebase e Tailwind CSS.

## ✨ Funcionalidades

### 🔐 **Autenticação**

- Login automático com criação de usuário
- Persistência de sessão
- Logout seguro

### 📊 **Dashboard Inteligente**

- Estatísticas gerais do usuário
- Progresso por categoria de semiologia
- Cards com métricas de performance
- Taxa de acerto em tempo real

### 🎯 **Sistema de Quiz**

- **Dois modos de pergunta:**
  - Definição → Termo
  - Termo → Definição
- **Dois modos de resposta:**
  - Input livre (texto)
  - Múltipla escolha (4 opções)
- Feedback imediato com correções
- Salvamento automático de estatísticas

### 📚 **Revisão de Termos**

- Navegação por categorias
- Sistema de busca avançado
- Modo de estudo com/sem definições
- Marcação de termos estudados
- Paginação inteligente
- Progresso da sessão de estudo

### 📈 **Análise de Progresso**

- Estatísticas detalhadas por categoria
- Identificação de pontos fortes e fracos
- Métricas de acurácia
- Histórico de tentativas

## 🏗️ **Arquitetura Técnica**

### **Frontend**

- **Vue 3** com Composition API
- **TypeScript** para tipagem forte
- **Pinia** para gerenciamento de estado
- **Vue Router** para navegação
- **Tailwind CSS** para estilização
- **ShadCN-UI** para componentes

### **Backend**

- **Firebase Firestore** para banco de dados
- **Firebase Analytics** para métricas
- Regras de segurança configuradas

## 🎓 **Categorias de Estudo**

O sistema inclui **78 termos** organizados em **6 categorias** de semiologia médica:

1. **Semiologia da Febre** (10 termos)
2. **Semiologia da Dor** (16 termos)
3. **Semiologia do Aparelho Respiratório** (12 termos)
4. **Semiologia do Aparelho Cardiovascular** (9 termos)
5. **Semiologia do Aparelho Digestivo** (20 termos)
6. **Semiologia do Aparelho Urinário** (11 termos)

## 🚀 **Como Usar**

### **1. Primeiro Acesso**

1. Acesse `/login`
2. Digite usuário e senha (conta será criada automaticamente)
3. Será redirecionado para o dashboard

### **2. Estudando**

- **Dashboard**: Visualize seu progresso geral
- **Quiz**: Teste conhecimentos com perguntas aleatórias
- **Revisão**: Estude termos por categoria

---

**Desenvolvido para estudantes de medicina e minha namorada** 🩺
