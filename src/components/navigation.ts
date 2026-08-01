import type { ArrayOrNested, NavigationMenuItem } from "@nuxt/ui";

export const navigationItems: ArrayOrNested<NavigationMenuItem> = [
    {
        icon: "lucide:chess-king",
        label: "Landing",
        to: "/"
    },
    {
        icon: "bx:bxs-chess",
        label: "Board",
        to: "/board"
    }
];
