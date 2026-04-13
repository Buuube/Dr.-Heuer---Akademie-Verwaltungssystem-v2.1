import { createRouter, createWebHistory } from 'vue-router';
import ParticipantView from '../views/ParticipantView.vue';

const routes = [{ path: '/', component: ParticipantView }];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
