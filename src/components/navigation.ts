import type { ArrayOrNested, NavigationMenuItem } from "@nuxt/ui";

export const navigationItems: ArrayOrNested<NavigationMenuItem> = [
    {
        icon: "lucide:calendars",
        label: "Chronologie",
        to: "/timeline"
    },
    {
        icon: "lucide:book",
        label: "Contribuer",
        to: "/contribute"
    },
    {
        icon: "lucide:info",
        label: "À propos",
        to: "/about"
    },
    {
        icon: "lucide:pencil-ruler",
        label: "Éditeur",
        to: "/editor"
    }
];
