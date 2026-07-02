<script setup>
import rocketLogo from './assets/rocket.png'
</script>

<template>
  <header class="app-header">
    <nav class="app-nav" aria-label="Primary navigation">
      <RouterLink class="brand" to="/" aria-label="FindARepo home">
        <img class="brand-logo" :src="rocketLogo" alt="" aria-hidden="true" />
        <span>FindA<span class="brand-accent">Repo</span></span>
      </RouterLink>

      <div class="nav-links">
        <RouterLink to="/">Search</RouterLink>
        <RouterLink to="/favorites">
          <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <path
              d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78Z"
            />
          </svg>
          Favorites
        </RouterLink>
      </div>
    </nav>
  </header>

  <RouterView />
</template>

<style scoped>
.app-header {
  position: sticky;
  top: 0;
  z-index: 20;
  color: var(--color-text-inverse);
  background: #061a3a;
  border-bottom: 1px solid rgb(147 197 253 / 18%);
  box-shadow: 0 4px 20px rgb(15 23 42 / 16%);
}

.app-nav {
  display: flex;
  width: min(100%, 75rem);
  min-height: 4.5rem;
  padding: 0 var(--space-4);
  margin: 0 auto;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-4);
}

.brand,
.nav-links,
.nav-links a {
  display: flex;
  align-items: center;
}

.brand {
  position: relative;
  gap: var(--space-2);
  min-height: 100%;
  padding-left: 5rem;
  color: var(--color-text-inverse);
  font-size: clamp(1.25rem, 4vw, 1.65rem);
  font-weight: 800;
  letter-spacing: -0.04em;
  text-decoration: none;
  white-space: nowrap;
}

.brand-logo {
  position: absolute;
  top: 50%;
  left: -1.25rem;
  z-index: 1;
  width: 7.5rem;
  height: 7.5rem;
  object-fit: contain;
  pointer-events: none;
  filter: drop-shadow(0 10px 12px rgb(2 12 27 / 32%));
  transform: translateY(-35%) rotate(-5deg);
}

.brand-accent {
  color: #4da3ff;
}

.nav-links {
  align-self: stretch;
  gap: var(--space-4);
}

.nav-links a {
  position: relative;
  gap: var(--space-2);
  padding: 0 var(--space-2);
  color: rgb(255 255 255 / 78%);
  font-weight: 600;
  text-decoration: none;
}

.nav-links svg {
  width: 1.2rem;
  height: 1.2rem;
  fill: none;
  stroke: currentColor;
  stroke-width: 1.8;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.nav-links a::after {
  position: absolute;
  right: var(--space-2);
  bottom: 0;
  left: var(--space-2);
  height: 3px;
  background: #38a3ff;
  border-radius: var(--radius-full) var(--radius-full) 0 0;
  content: '';
  opacity: 0;
  transform: scaleX(0.5);
  transition:
    opacity 160ms ease,
    transform 160ms ease;
}

.nav-links a:hover,
.nav-links a.router-link-exact-active {
  color: var(--color-text-inverse);
}

.nav-links a.router-link-exact-active::after {
  opacity: 1;
  transform: scaleX(1);
}

.brand:focus-visible,
.nav-links a:focus-visible {
  border-radius: var(--radius-sm);
  outline: 3px solid #93c5fd;
  outline-offset: 3px;
}

@media (max-width: 30rem) {
  .app-nav {
    min-height: 4rem;
    padding: 0 var(--space-3);
    gap: var(--space-2);
  }

  .brand {
    padding-left: 3.25rem;
    font-size: 1.1rem;
  }

  .brand-logo {
    left: -1rem;
    width: 5rem;
    height: 5rem;
    transform: translateY(-35%) rotate(-5deg);
  }

  .nav-links {
    gap: var(--space-1);
  }

  .nav-links a {
    padding: 0 var(--space-1);
    font-size: 0.875rem;
  }

  .nav-links a::after {
    right: var(--space-1);
    left: var(--space-1);
  }
}

@media (prefers-reduced-motion: reduce) {
  .nav-links a::after {
    transition: none;
  }
}
</style>
