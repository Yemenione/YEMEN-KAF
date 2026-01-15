
export interface Category {
    id: string;
    title: string;
    description: string;
    image: string;
    link: string;
}

export const INITIAL_CATEGORIES: Category[] = [
    {
        id: "honey",
        title: "Rare Honey",
        description: "Sidr, Sumar, & White Honey",
        image: "/images/honey-jar.jpg",
        link: "/shop?category=honey"
    },
    {
        id: "coffee",
        title: "Mocha Coffee",
        description: "Husks, Light, & Dark Roast",
        image: "/images/coffee-beans.jpg",
        link: "/shop?category=coffee"
    },
    {
        id: "gifts",
        title: "Gifts & Sets",
        description: "Curated Boxes for Loved Ones",
        image: "/images/honey-comb.jpg",
        link: "/shop?category=gifts"
    }
];
