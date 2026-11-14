export type DemoRestaurant = {
  id: string;
  name: string;
  address: string;
  tableCount: number;
};

export type DemoMenuItem = {
  id: string;
  category: string;
  name: string;
  description: string;
  price: number;
  imagePrompt: string;
  imageSrc: string;
};

export const demoRestaurants: DemoRestaurant[] = [
  { id: "green-table", name: "The Green Table", address: "14 Park Street", tableCount: 12 },
  { id: "coastal-kitchen", name: "Coastal Kitchen", address: "8 Marine Drive", tableCount: 8 },
];

export const demoMenu: DemoMenuItem[] = [
  { id: "paneer-tikka", category: "Starters", name: "Paneer Tikka", description: "Chargrilled cottage cheese with mint chutney", price: 249, imagePrompt: "Close-up editorial food photo of chargrilled paneer tikka with mint chutney, warm restaurant light, terracotta plate", imageSrc: "/menu/paneer-tikka.jpeg" },
  { id: "mushroom-toast", category: "Starters", name: "Garlic Mushroom Toast", description: "Buttery mushrooms on toasted sourdough", price: 199, imagePrompt: "Close-up editorial food photo of garlic mushrooms on toasted sourdough, warm restaurant light, cream plate", imageSrc: "/menu/garlic-mushroom-toast.jpeg" },
  { id: "butter-chicken", category: "Mains", name: "Butter Chicken", description: "Slow-cooked tomato gravy with tender chicken", price: 349, imagePrompt: "Close-up editorial food photo of butter chicken in a copper bowl, glossy tomato gravy, warm restaurant light", imageSrc: "/menu/butter-chicken.jpeg" },
  { id: "dal-makhani", category: "Mains", name: "Dal Makhani", description: "Black lentils simmered overnight", price: 229, imagePrompt: "Close-up editorial food photo of dal makhani with cream swirl, brass bowl, warm restaurant light", imageSrc: "/menu/dal-makhani.jpeg" },
  { id: "masala-lemonade", category: "Drinks", name: "Masala Lemonade", description: "Fresh lemon, mint, and a pinch of spice", price: 99, imagePrompt: "Editorial food photo of masala lemonade with mint and lemon, clear tumbler, warm restaurant light", imageSrc: "/menu/masala-lemonade.jpeg" },
  { id: "cold-coffee", category: "Drinks", name: "Cold Coffee", description: "Chilled coffee with a creamy finish", price: 149, imagePrompt: "Editorial food photo of iced cold coffee with foam, clear glass, warm restaurant light", imageSrc: "/menu/cold-coffee.jpeg" },
];

export function getDemoRestaurant(id: string) {
  return demoRestaurants.find((restaurant) => restaurant.id === id);
}

export function getDemoMenu(restaurantId: string) {
  return restaurantId === "green-table" ? demoMenu : [];
}
