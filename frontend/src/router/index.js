import { createRouter, createWebHistory } from 'vue-router';

import HomeView from '../views/HomeView.vue';
import ParticipantView from '../views/ParticipantView.vue';
import CourseView from '../views/CourseView.vue';
import ModuleView from '../views/ModuleView.vue';
import BookingView from '../views/BookingView.vue';
import AboutView from '../views/AboutView.vue';

const routes = [
  { path: '/', name: 'home', component: HomeView },
  { path: '/participants', name: 'participants', component: ParticipantView },
  { path: '/courses', name: 'courses', component: CourseView },
  { path: '/modules', name: 'modules', component: ModuleView },
  { path: '/bookings', name: 'bookings', component: BookingView },
  { path: '/about', name: 'about', component: AboutView },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
