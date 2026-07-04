<template>
  <router-view />
</template>

<script setup>
import { onMounted } from 'vue'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()

onMounted(() => {
  userStore.checkToken()
})
</script>

<style>
#app {
  width: 100%;
  height: 100%;
}
</style>