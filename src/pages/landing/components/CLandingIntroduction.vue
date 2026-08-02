<template>
    <section class="introduction">
        <p class="eyebrow">
            Opening practice
        </p>
        <h1>Learn chess openings</h1>
        <p>
            Chess Planet lets you practise openings repeatedly against randomized registered lines.
        </p>
    </section>
</template>

<style scoped>
.introduction {
    max-width: 660px;
    margin-bottom: var(--length-xxl);

    .eyebrow {
        color: var(--color-primary);
        font-size: var(--font-size-xs);
        font-weight: 700;
        letter-spacing: 0.12em;
        text-transform: uppercase;
    }

    h1 {
        margin: var(--length-xs) 0 var(--length-s);
        font-size: clamp(2rem, 5vw, 3.5rem);
        font-weight: 700;
        line-height: 1.05;
    }

    > p:last-child {
        color: var(--color-text-softer);
        font-size: var(--font-size-l);
    }
}
</style>
