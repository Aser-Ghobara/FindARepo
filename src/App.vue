<template>
  <nav>
    <RouterLink to="/">Search</RouterLink>
    <span aria-hidden="true"> | </span>
    <RouterLink to="/favorites">Favorites</RouterLink>
  </nav>

  <RouterView />
</template>
