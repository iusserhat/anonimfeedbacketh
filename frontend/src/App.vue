<template>
  <div class="min-h-screen bg-gray-100">
    <nav class="bg-white shadow-lg">
      <div class="max-w-7xl mx-auto px-4">
        <div class="flex justify-between h-16">
          <div class="flex items-center">
            <h1 class="text-xl font-bold text-gray-800">Anonim Feedback</h1>
          </div>
        </div>
      </div>
    </nav>

    <main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div class="px-4 py-6 sm:px-0">
        <div class="bg-white overflow-hidden shadow rounded-lg">
          <div class="p-6">
            <form @submit.prevent="sendFeedback" class="space-y-4">
              <div>
                <label for="feedback" class="block text-sm font-medium text-gray-700">Feedback</label>
                <textarea
                  id="feedback"
                  v-model="feedback"
                  rows="4"
                  class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  placeholder="Geri bildiriminizi buraya yazın..."
                ></textarea>
              </div>
              <button
                type="submit"
                :disabled="isLoading"
                class="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                {{ isLoading ? 'Gönderiliyor...' : 'Gönder' }}
              </button>
            </form>
          </div>
        </div>

        <div class="mt-8 bg-white overflow-hidden shadow rounded-lg">
          <div class="p-6">
            <h2 class="text-lg font-medium text-gray-900 mb-4">Geri Bildirimler</h2>
            <div v-if="messages.length === 0" class="text-gray-500">
              Henüz geri bildirim bulunmuyor.
            </div>
            <div v-else class="space-y-4">
              <div v-for="message in messages" :key="message.id" class="border-b pb-4">
                <p class="text-gray-700">{{ message.content }}</p>
                <p class="text-sm text-gray-500 mt-1">
                  {{ new Date(message.timestamp * 1000).toLocaleString() }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ethers } from 'ethers'
import { CONTRACT_ADDRESS, CONTRACT_ABI } from './constants'

const feedback = ref('')
const messages = ref<any[]>([])
const isLoading = ref(false)

const provider = new ethers.BrowserProvider(window.ethereum)
const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider)

const sendFeedback = async () => {
  if (!feedback.value.trim()) return
  
  try {
    isLoading.value = true
    const signer = await provider.getSigner()
    const contractWithSigner = contract.connect(signer)
    
    await contractWithSigner.sendMessage(feedback.value)
    feedback.value = ''
    await loadMessages()
  } catch (error) {
    console.error('Error sending feedback:', error)
  } finally {
    isLoading.value = false
  }
}

const loadMessages = async () => {
  try {
    const fetchedMessages = await contract.getMessages()
    messages.value = fetchedMessages
  } catch (error) {
    console.error('Error loading messages:', error)
  }
}

onMounted(() => {
  loadMessages()
})
</script> 