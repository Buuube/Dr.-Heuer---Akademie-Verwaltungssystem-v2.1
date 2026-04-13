<script setup>
import { ref, onMounted } from 'vue';
import { getUsers, addUser } from '../services/userService.js';

const users = ref([]);
const name = ref('');
const email = ref('');

// Lade alle User beim Start
onMounted(async () => {
  users.value = await getUsers();
});

// Neuen User hinzufügen
async function addNewUser() {
  if (!name.value || !email.value) return;
  const newUser = await addUser({ name: name.value, email: email.value });
  users.value.push(newUser);
  name.value = '';
  email.value = '';
}
</script>

<template>
  <div>
    <h2>User Manager</h2>

    <ul>
      <li v-for="user in users" :key="user.id">
        {{ user.name }} ({{ user.email }})
      </li>
    </ul>

    <h3>Neuen User hinzufügen</h3>
    <input v-model="name" placeholder="Name" />
    <input v-model="email" placeholder="Email" />
    <button @click="addNewUser">Hinzufügen</button>
  </div>
</template>
