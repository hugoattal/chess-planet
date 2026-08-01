<template>
    <div class="logo">
        <UIcon
            class="icon"
            name="lucide:chess-king"
        />
        <div class="text">
            Chess Planet

            <div class="version">
                alpha
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">

</script>

<style scoped>
.logo {
    display: flex;
    gap: var(--length-xs);
    align-items: center;

    .icon {
        color: var(--color-primary);
        font-size: var(--font-icon-xl);
    }

    .text {
        font-size: var(--font-size-xl);
        font-weight: bold;
        display: flex;
        position: relative;

        .version {
            color: var(--color-primary);
            font-size: var(--font-size-xs);
            position: absolute;
            right: 0;
            bottom: -10px;
        }
    }
}
</style>
