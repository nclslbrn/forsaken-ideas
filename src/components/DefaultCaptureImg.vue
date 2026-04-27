<template>
    <div class="loading"></div>
</template>
<style>
.loading {
    float: left;
    margin: 0;
    padding: 0;
    background-image: linear-gradient(
        90deg,
        var(--color-bg),
        var(--color-solid) 50%,
        var(--color-bg)
    );
    background-size: 99% 100%;

    animation: loading 750ms linear infinite normal forwards;
}

@keyframes loading {
    0% {
        background-position: -5000% 0;
    }

    100% {
        background-position: 5000% 0;
    }
}
</style>
