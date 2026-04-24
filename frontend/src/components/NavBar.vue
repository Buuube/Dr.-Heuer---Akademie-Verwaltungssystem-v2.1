<template>
  <nav class="navbar">
    <div class="navbar-inner">
      <div class="brand">
        <div class="logo-wrapper">
          <img src="@/assets/logo.png" class="Logo" style="height: 75px" />
        </div>
      </div>

      <ul class="nav-links">
        <li v-for="link in links" :key="link.to">
          <router-link :to="link.to" class="nav-item">
            <span class="nav-label">{{ link.label }}</span>
            <span class="nav-underline"></span>
          </router-link>
        </li>
      </ul>

      <div class="nav-actions">
        <label class="theme-switch">
          <input
            type="checkbox"
            :checked="isDark"
            @change="emit('toggle')"
            :aria-label="isDark ? 'Lightmode' : 'Darkmode'"
          />
          <span class="slider"></span>
        </label>
      </div>
    </div>
  </nav>
</template>

<script setup>
const props = defineProps(['isDark']);
const emit = defineEmits(['toggle']);

const links = [
  { to: '/participants', label: 'Teilnehmer' },
  { to: '/courses', label: 'Kurse' },
  { to: '/modules', label: 'Module' },
  { to: '/bookings', label: 'Buchungen' },
];
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap');

.navbar {
  position: sticky;
  top: 0;
  z-index: 100;
  width: calc(100% - 48px);
  max-width: 1600px;
  margin: 0 auto;
  background: rgba(5, 8, 20, 0.85);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(120, 180, 255, 0.18);
  font-family: system-ui, sans-serif;
  border-radius: 0 0 10px 10px;
  box-sizing: border-box;
}

.navbar-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 0 2rem;
  height: 64px;
  box-sizing: border-box;
}

.brand {
  display: flex;
  align-items: center;
  gap: 12px;
  text-decoration: none;
}

.logo-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  flex-shrink: 0;
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 4px;
  list-style: none;
  margin: 0;
  padding: 0;
}

.nav-item {
  position: relative;
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  padding: 7px 14px;
  border-radius: 8px;
  text-decoration: none;
  color: #94a3b8;
  font-size: 14px;
  font-weight: 500;
  letter-spacing: -0.01em;
  transition:
    color 0.2s ease,
    background 0.2s ease;
}

.nav-item:hover {
  color: #e2e8f0;
  background: rgba(255, 255, 255, 0.06);
}

.nav-label {
  position: relative;
  z-index: 1;
  white-space: nowrap;
}

.nav-underline {
  position: absolute;
  bottom: 4px;
  left: 50%;
  transform: translateX(-50%) scaleX(0);
  width: calc(100% - 28px);
  height: 2px;
  border-radius: 2px;
  background: #ba2b2b;
  opacity: 0;
  transition:
    opacity 0.2s ease,
    transform 0.25s ease;
  transform-origin: center;
}

.nav-item.router-link-active {
  color: #f1f5f9;
  background: rgba(255, 255, 255, 0.07);
}

.nav-item.router-link-active .nav-underline {
  opacity: 1;
  transform: translateX(-50%) scaleX(1);
}

.nav-item:hover .nav-underline {
  opacity: 0.5;
  transform: translateX(-50%) scaleX(1);
}

@media (max-width: 600px) {
  .navbar-inner {
    padding: 0 1rem;
  }

  .nav-item {
    padding: 7px 10px;
  }

  .nav-label {
    display: none;
  }
}

.theme-switch {
  position: relative;
  display: inline-block;
  width: 50px;
  height: 28px;
}

.theme-switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  inset: 0;
  background-color: #ccc;
  border-radius: 999px;
  transition: background-color 0.3s;
}

.slider::before {
  content: '';
  position: absolute;
  height: 22px;
  width: 22px;
  left: 3px;
  top: 3px;
  background-color: white;
  border-radius: 50%;
  transition: transform 0.3s;
}

input:checked + .slider {
  background-color: #ba2b2b;
}

input:checked + .slider::before {
  transform: translateX(22px);
}
</style>
