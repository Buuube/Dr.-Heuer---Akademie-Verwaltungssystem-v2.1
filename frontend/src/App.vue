<template>
  <div :class="isDark ? 'dark' : 'light'">
    <NavBar :isDark="isDark" @toggle="toggleTheme" />
    <main class="content">
      <router-view />
    </main>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import NavBar from './components/NavBar.vue';

const isDark = ref(false);
document.body.classList.add('light');

function toggleTheme() {
  isDark.value = !isDark.value;
  document.body.classList.toggle('light', !isDark.value);
  document.body.classList.toggle('dark', isDark.value);
}
</script>

<style>
body {
  margin: 0;
  min-height: 100vh;
  transition: background 0.3s ease;
}

body.light {
  background: #f0f4f8 !important;
}

body.dark {
  background:
    radial-gradient(
      circle at 20% 20%,
      rgba(74, 163, 255, 0.15),
      transparent 40%
    ),
    radial-gradient(
      circle at 80% 10%,
      rgba(176, 124, 255, 0.12),
      transparent 45%
    ),
    radial-gradient(
      circle at 50% 90%,
      rgba(124, 247, 255, 0.08),
      transparent 50%
    ),
    #050814;
}
</style>
