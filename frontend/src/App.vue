<template>

  <nav class="navbar navbar-expand-lg navbar-light bg-dark">
    <a class="navbar-brand" href="/" style="text-shadow: 0 0 10px orchid; color: #b9b3bb; font-weight: bold">Meetup</a>
    <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
      <span class="navbar-toggler-icon"></span>
    </button>
    <div class="collapse navbar-collapse" id="navbarNav">
      <ul class="navbar-nav">
        <li class="nav-item">
          <a class="nav-link" href="/events" style="text-shadow: 0 0 10px orchid; color: #b9b3bb;">Events</a>
        </li>
        <li class="nav-item">
          <a class="nav-link" href="/login" style="text-shadow: 0 0 10px orchid; color: #b9b3bb;" v-if="session === undefined">Login</a>
        </li>
        <li class="nav-item">
          <a class="nav-link" href="/register" style="text-shadow: 0 0 10px orchid; color: #b9b3bb;" v-if="session === undefined">Register</a>
        </li>
        <li class="nav-item">
          <a class="nav-link" href="/addevent" style="text-shadow: 0 0 10px orchid; color: #b9b3bb;" v-if="session !== undefined">Create a new event</a>
        </li>
        <li class="nav-item">
          <a class="nav-link" href="/profile" style="text-shadow: 0 0 10px orchid; color: #b9b3bb;" v-if="session !== undefined">Edit profile</a>
        </li>
        <li class="nav-item">
          <a class="nav-link" href="/" style="text-shadow: 0 0 10px orchid; color: #b9b3bb;" v-if="session !== undefined" @click="logout">Logout</a>
        </li>
      </ul>
    </div>
  </nav>
  <div id="app">
    <router-view></router-view>
  </div>
</template>

<script>
import 'bootstrap/dist/js/bootstrap.bundle';
import axios from "axios";
export default {
  name: 'App',
  data() {
    return {
      session: undefined
    }
  },
  mounted() {
    if (localStorage.token) {
      this.session = localStorage.token;
    }
  },
  methods: {
    update() {
      if (localStorage.token) {
        this.session = localStorage.token;
      }
    },
    logout() {
      this.session = undefined;
      axios.post('http://localhost:4941/api/v1/users/logout', null,{headers: {'X-Authorization': localStorage.token}})
          .then((response) => {
            console.log(response)
          })
      localStorage.clear();
    }
  },
  components: {
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 0px;
}
@import'~bootstrap/dist/css/bootstrap.css';

</style>
