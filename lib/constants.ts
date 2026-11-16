// key menu = id section di halaman (#home, #clippers, #creators, #contact)
export const MENU_KEYS = ["home", "clippers", "creators", "contact"] as const;

export type MenuKey = (typeof MENU_KEYS)[number];
