export function getCropEmoji(name: string, type: string) {
  const value = name
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  const crops: Record<string, string> = {
    // Légumes
    "tomate": "🍅",
    "tomato": "🍅",
    "tomates": "🍅",

    "pomme de terre": "🥔",
    "pommes de terre": "🥔",
    "potato": "🥔",
    "potatoes": "🥔",
    "patate": "🥔",

    "oignon": "🧅",
    "oignons": "🧅",
    "onion": "🧅",

    "carotte": "🥕",
    "carottes": "🥕",
    "carrot": "🥕",

    "piment": "🌶️",
    "piments": "🌶️",
    "chili": "🌶️",

    "aubergine": "🍆",
    "aubergines": "🍆",
    "eggplant": "🍆",

    // Fruits
    "mangue": "🥭",
    "mangues": "🥭",
    "mango": "🥭",

    "citron": "🍋",
    "citrons": "🍋",
    "lemon": "🍋",

    "pasteque": "🍉",
    "pasteques": "🍉",
    "watermelon": "🍉",

    "banane": "🍌",
    "bananes": "🍌",
    "banana": "🍌",

    "orange": "🍊",
    "oranges": "🍊",

    "ananas": "🍍",
    "pineapple": "🍍",

    "avocat": "🥑",
    "avocats": "🥑",
    "avocado": "🥑",

    "madd": "🟡",
    "maad": "🟡",
    "made": "🟡",

    "papaye": "🥭",
    "papayes": "🥭",
    "papaya": "🥭",
    "papayas": "🥭",

    "pamplemousse": "🍊",
    // Céréales
    "mais": "🌽",
    "corn": "🌽",
    "maize": "🌽",

    "riz": "🌾",
    "rice": "🌾",

    "ble": "🌾",
    "wheat": "🌾",
    // autre
    "essence": "⛽",
    "poisson": "🐟",
  };

  if (crops[value]) {
    return crops[value];
  }

  if (type === "Fruit") return "🍎";
  if (type === "Légume") return "🥬";
  if (type === "Céréale") return "🌾";

  return "🌱";
}