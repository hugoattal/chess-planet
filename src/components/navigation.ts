import type { ArrayOrNested, NavigationMenuItem } from "@nuxt/ui";

export const navigationItems: ArrayOrNested<NavigationMenuItem> = [
    {
        icon: "lucide:folders",
        label: "Home",
        to: "/"
    },
    {
        icon: "lucide:grid-3x3",
        label: "Editor",
        to: "/editor"
    },
    {
        icon: "lucide:gamepad-2",
        label: "Practice",
        to: "/practice"
    }
];
