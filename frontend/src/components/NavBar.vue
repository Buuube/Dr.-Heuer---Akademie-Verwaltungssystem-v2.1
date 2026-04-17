<template>
  <nav class="navbar">
    <div class="navbar-inner">
      <div class="brand">
        <div class="logo-wrapper">
          <img src="@/assets/logo.png" class="Logo" style="height: 75px" ; />
        </div>
        <div class="brand-text">
          <span class="brand-name">Verwaltungssystem</span>
        </div>
      </div>

      <ul class="nav-links">
        <li v-for="link in links" :key="link.to">
          <router-link :to="link.to" class="nav-item">
            <span class="nav-icon">{{ link.icon }}</span>
            <span class="nav-label">{{ link.label }}</span>
            <span class="nav-underline"></span>
          </router-link>
        </li>
      </ul>
      <div class="nav-actions">
        <button
          class="theme-toggle"
          @click="emit('toggle')"
          :aria-label="isDark ? 'Lightmode' : 'Darkmode'"
        >
          {{ isDark ? '☀️' : '🌙' }}
        </button>
      </div>
      <!-- <div class="nav-actions">
        <button class="avatar-btn" aria-label="Profil">
          <span>AD</span>
        </button>
      </div> -->
    </div>
  </nav>
</template>

<script setup>
const props = defineProps(['isDark']);
const emit = defineEmits(['toggle']);

const links = [
  { to: '/participants', label: 'Teilnehmer' },
  { to: '/courses', label: 'Kurse' },
  { to: '/bookings', label: 'Buchungen' },
];
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap');

.navbar {
  position: sticky;
  z-index: 100;
  width: 90vw;
  top: 0;
  left: 0;
  background: rgba(5, 8, 20, 0.85); /* passend zu --bg: #050814 */
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border-bottom: 1px solid rgba(120, 180, 255, 0.18); /* dein --border */
  font-family: 'DM Sans', sans-serif;
  border-radius: 10px;
}

.navbar-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 0 2rem;
  height: 64px;
  box-sizing: border-box; /* ← wichtig, verhindert Overflow */
}

/* ── Brand ── */
.brand {
  display: flex;
  align-items: center;
  gap: 12px;
  text-decoration: none;
}

.logo-wrapper {
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  flex-shrink: 0;
}

.logo {
  width: 28px;
  height: 28px;
  object-fit: contain;
  filter: brightness(0) invert(1);
}

.brand-text {
  display: flex;
  flex-direction: column;
  line-height: 1.1;
}

.brand-name {
  font-size: 15px;
  font-weight: 600;
  color: #f1f5f9;
  letter-spacing: -0.01em;
}

/* ── Nav Links ── */
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
  display: flex;
  align-items: center;
  gap: 7px;
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

.nav-icon {
  font-size: 13px;
  line-height: 1;
  opacity: 0.8;
}

.nav-label {
  position: relative;
  z-index: 1;
}

.nav-underline {
  position: absolute;
  bottom: 4px;
  left: 14px;
  right: 14px;
  height: 2px;
  border-radius: 2px;
  background: linear-gradient(90deg, #ba2b2b);
  opacity: 0;
  transform: scaleX(0);
  transition:
    opacity 0.2s ease,
    transform 0.25s ease;
  transform-origin: left;
}

.nav-item.router-link-active {
  color: #f1f5f9;
  background: rgba(255, 255, 255, 0.07);
}

.nav-item.router-link-active .nav-underline {
  opacity: 1;
  transform: scaleX(1);
}

.nav-item:hover .nav-underline {
  opacity: 0.5;
  transform: scaleX(1);
}

.theme-toggle {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 1.5px solid rgba(255, 255, 255, 0.12);
  background: transparent;
  cursor: pointer;
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: border-color 0.2s ease;
  margin-right: 8px;
}

.theme-toggle:hover {
  border-color: rgba(139, 92, 246, 0.6);
}

/* ── Avatar ──
.nav-actions {
  display: flex;
  align-items: center;
}

.avatar-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 1.5px solid rgba(255, 255, 255, 0.12);
  background: linear-gradient(135deg, #1e293b, #334155);
  color: #94a3b8;
  font-size: 11px;
  font-weight: 600;
  font-family: 'DM Mono', monospace;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: border-color 0.2s ease, color 0.2s ease;
  letter-spacing: 0.04em;
}

.avatar-btn:hover {
  border-color: rgba(139, 92, 246, 0.6);
  color: #c4b5fd;
} */

/* ── Responsive ── */
@media (max-width: 600px) {
  .navbar-inner {
    padding: 0 1rem;
  }

  .brand-text {
    display: none;
  }

  .nav-item {
    padding: 7px 10px;
    gap: 0;
  }

  .nav-label {
    display: none;
  }

  .nav-icon {
    font-size: 16px;
    opacity: 1;
  }
}
</style>

<!-- <template>
  <label class="theme-switch">
    <input
      type="checkbox"
      :checked="isDark"
      @change="emit('toggle')"
      :aria-label="isDark ? 'Lightmode' : 'Darkmode'"
    />
    <span class="slider"></span>
  </label>
</template>

<script setup>
defineProps({
  isDark: Boolean
})

const emit = defineEmits(['toggle'])
</script>

<style scoped>
.theme-switch {
  position: relative;
  display: inline-block;
  width: 50px;
  height: 28px;
}

/* Verstecke das echte Checkbox */
.theme-switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

/* Hintergrund */
.slider {
  position: absolute;
  cursor: pointer;
  inset: 0;
  background-color: #ccc;
  border-radius: 999px;
  transition: background-color 0.3s;
}

/* Kreis */
.slider::before {
  content: "";
  position: absolute;
  height: 22px;
  width: 22px;
  left: 3px;
  top: 3px;
  background-color: white;
  border-radius: 50%;
  transition: transform 0.3s;
}

/* Aktiv (Dark Mode) */
input:checked + .slider {
  background-color: #34c759; /* Apple green */
}

input:checked + .slider::before {
  transform: translateX(22px);
}
</style> -->
