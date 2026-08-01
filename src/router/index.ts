import type { RouteRecordRaw } from "vue-router";
import { createRouter, createWebHistory } from "vue-router";

const routes: Array<RouteRecordRaw> = [
    {
        component: () => import("@/pages/landing/CLandingLayout.vue"),
        meta: {
            title: "Chess Planet"
        },
        name: "landing",
        path: "/"
    }
];

const router = createRouter({
    history: createWebHistory(),
    routes,
    scrollBehavior() {
        return { top: 0 };
    }
});

router.beforeEach(async (to, _from, next) => {
    document.title = to.meta.title as string || "Chess Planet";

    next();
});

export default router;
