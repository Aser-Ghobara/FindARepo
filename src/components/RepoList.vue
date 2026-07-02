<script setup>
import { ref } from 'vue'
import RepoCard from './RepoCard.vue'

defineProps({
  results: {
    type: Array,
    required: true,
  },
  loading: {
    type: Boolean,
    required: true,
  },
  error: {
    type: Object,
    default: null,
  },
  hasMore: {
    type: Boolean,
    required: true,
  },
  query: {
    type: String,
    default: '',
  },
  totalCount: {
    type: Number,
    default: 0,
  },
  source: {
    type: String,
    default: 'search',
  },
})

const emit = defineEmits(['load-more', 'sort-change'])
const selectedSort = ref('best-match')
const numberFormatter = new Intl.NumberFormat('en-US')

function handleSortChange() {
  emit('sort-change', selectedSort.value)
}
</script>

<template>
  <header v-if="query && results.length > 0" class="results-header">
    <p class="results-count">
      About {{ numberFormatter.format(totalCount) }} results for
      <strong>“{{ query }}”</strong>
    </p>

    <div class="sort-control">
      <label for="repo-sort">Sort by</label>
      <select id="repo-sort" v-model="selectedSort" @change="handleSortChange">
        <option value="best-match">Best match</option>
        <option value="stars">Most stars</option>
        <option value="updated">Recently updated</option>
      </select>
    </div>
  </header>

  <div v-if="results.length > 0" class="repo-grid">
    <RepoCard v-for="repo in results" :key="repo.id" :repo="repo" :source="source" />
  </div>

  <div v-if="(loading && results.length > 0) || (hasMore && !loading)" class="repo-list-actions">
    <span v-if="loading" class="loading-more" role="status">Loading more...</span>
    <button v-else type="button" @click="$emit('load-more')">Load More</button>
  </div>
</template>

<style scoped>
.results-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-4);
  margin-bottom: var(--space-4);
}

.results-count {
  min-width: 0;
  margin: 0;
  color: var(--color-text-muted);
  overflow-wrap: anywhere;
}

.results-count strong {
  color: var(--color-text);
}

.sort-control {
  display: flex;
  flex: 0 0 auto;
  align-items: center;
  gap: var(--space-2);
}

.sort-control label {
  color: var(--color-text-muted);
  font-size: 0.875rem;
  font-weight: 600;
  white-space: nowrap;
}

.sort-control select {
  min-height: 2.5rem;
  padding: var(--space-2) var(--space-8) var(--space-2) var(--space-3);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  color: var(--color-text);
  font: inherit;
  cursor: pointer;
  background: var(--color-surface);
}

.sort-control select:focus-visible,
.repo-list-actions button:focus-visible {
  outline: 3px solid var(--color-focus-ring);
  outline-offset: 2px;
}

.repo-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 19rem), 1fr));
  gap: var(--space-6);
}

.repo-list-actions {
  margin-top: var(--space-8);
  text-align: center;
}

.repo-list-actions button {
  min-height: 2.75rem;
  padding: var(--space-2) var(--space-6);
  border: 1px solid var(--color-accent-500);
  border-radius: var(--radius-full);
  color: var(--color-accent-600);
  font: inherit;
  font-weight: 600;
  cursor: pointer;
  background: var(--color-surface);
  transition:
    color 150ms ease,
    background-color 150ms ease;
}

.repo-list-actions button:hover {
  color: var(--color-accent-700);
  background: var(--color-accent-50);
}

.loading-more {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  color: var(--color-text-muted);
  font-weight: 600;
}

.loading-more::before {
  width: 1rem;
  height: 1rem;
  border: 2px solid var(--color-accent-100);
  border-top-color: var(--color-accent-500);
  border-radius: var(--radius-full);
  animation: spin 700ms linear infinite;
  content: '';
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 36rem) {
  .results-header {
    flex-direction: column;
    align-items: stretch;
  }

  .sort-control {
    width: 100%;
  }

  .sort-control select {
    min-width: 0;
    flex: 1;
  }

  .repo-grid {
    grid-template-columns: minmax(0, 1fr);
    gap: var(--space-4);
  }
}

@media (prefers-reduced-motion: reduce) {
  .repo-list-actions button {
    transition: none;
  }

  .loading-more::before {
    animation: none;
  }
}
</style>
