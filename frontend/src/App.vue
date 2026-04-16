<template>
  <div :class="isDark ? 'dark' : 'light'">
    <NavBar :isDark="isDark" @toggle="isDark = !isDark" />
    <main class="content">
      <router-view />
    </main>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import NavBar from './components/NavBar.vue';

const isDark = ref(true);
</script>
