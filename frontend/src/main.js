import { createApp } from 'vue';
import { createWebHistory, createRouter } from 'vue-router';
import App from './App.vue';
import Events from './Events.vue';
import Home from './Home.vue';
import Register from './Register.vue';
import Login from './Login.vue';
import Event from './Event.vue';
import CreateEvent from './CreateEvent.vue';
import ModifyEvent from './modifyEvent.vue';
import Profile from './EditProfile.vue';
const routes = [
    {
        path: '/events',
        name: "events",
        component: Events
    },
    {
        path: '/profile',
        name: "profile",
        component: Profile
    },
    {
        path: '/addEvent',
        name: "createEvent",
        component: CreateEvent
    },
    {
        path: '/modifyevent/:id',
        name: "modifyEvent",
        component: ModifyEvent
    },
    {
        path: '/',
        name: "home",
        component: Home
    },
    {
        path: '/register',
        name: "register",
        component: Register
    },
    {
        path: '/login',
        name: "login",
        component: Login
    },
    {
        path: '/event/:id',
        name: 'event',
        component: Event
    }

];

const router = createRouter({
    routes,
    history: createWebHistory()
});
const app = createApp(App);
app.use(router);
app.mount('#app');
