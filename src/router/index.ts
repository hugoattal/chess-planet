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
    },
    {
        component: () => import("@/pages/editor/CEditorLayout.vue"),
        meta: {
            title: "Editor · Chess Planet"
        },
        name: "editor",
        path: "/editor"
    },
    {
        component: () => import("@/pages/learn/CLearnLayout.vue"),
        meta: {
            title: "Learn · Chess Planet"
        },
        name: "learn",
        path: "/learn"
    },
    {
        component: () => import("@/pages/practice/CPracticeLayout.vue"),
        meta: {
            title: "Practice · Chess Planet"
        },
        name: "practice",
        path: "/practice"
    }
];

const router = createRouter({
    history: createWebHistory(),
    routes,
    scrollBehavior() {
        return { top: 0 };
    }
});

router.beforeEach(async (to, _from) => {
    document.title = to.meta.title as string || "Chess Planet";
});

export default router;
