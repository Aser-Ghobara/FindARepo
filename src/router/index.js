import { createRouter, createWebHistory } from 'vue-router'
import FavoritesView from '../views/FavoritesView.vue'
import RepoDetailsView from '../views/RepoDetailsView.vue'
import SearchView from '../views/SearchView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: SearchView,
    },
    {
      path: '/repo/:owner/:name',
      component: RepoDetailsView,
      props: true,
    },
    {
      path: '/favorites',
      component: FavoritesView,
    },
  ],
})

export default router
