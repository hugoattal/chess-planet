<template>
    <section class="empty-practice">
        <UIcon
            aria-hidden="true"
            class="empty-icon"
            :name="icon"
        />
        <h2>{{ title }}</h2>
        <p>{{ description }}</p>
        <slot />
    </section>
</template>

<script setup lang="ts">
defineProps<{
    description: string;
    icon: string;
    title: string;
}>();
</script>

<style scoped>
.empty-practice {
    background: var(--color-background-soft);
    border: var(--length-xxxxs) dashed var(--ui-border);
    border-radius: var(--radius-m);
    display: grid;
    gap: var(--length-xs);
    justify-items: center;
    padding: var(--length-xxl);
    text-align: center;

    .empty-icon {
        color: var(--color-primary);
        font-size: var(--font-icon-xl);
    }

    h2 {
        font-size: var(--font-size-xl);
        font-weight: 700;
    }

    p {
        color: var(--color-text-softer);
        margin-bottom: var(--length-xs);
    }
}
</style>
