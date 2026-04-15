<template>
  <nav class="navbar">
    <h2>MyApp</h2>
    <ul>
      <li><router-link to="/">Home</router-link></li>
      <li><router-link to="/participants">Participants</router-link></li>
      <li><router-link to="/courses">Courses</router-link></li>
      <li><router-link to="/bookings">Bookings</router-link></li>
      <li><router-link to="/about">About</router-link></li>
    </ul>
  </nav>
</template>

<style scoped>
.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #2c3e50;
  padding: 15px;
  color: white;
}

ul {
  display: flex;
  gap: 20px;
  list-style: none;
}

a {
  color: white;
  text-decoration: none;
}

a.router-link-active {
  border-bottom: 2px solid #42b983;
}
</style>
