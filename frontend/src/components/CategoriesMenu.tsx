import React from "react";
import "./styles/CategoriesMenu.css";

export const categories = [
  { name: "Ноутбуки та комп’ютери", icon: "💻" },
  { name: "Смартфони, ТВ і електроніка", icon: "📱" },
  { name: "Товари для геймерів", icon: "🎮" },
  { name: "Побутова техніка", icon: "🏠" },
  { name: "Товари для дому", icon: "🛋️" },
  { name: "Інструменти та автотовари", icon: "🔧" },
  { name: "Сантехніка та ремонт", icon: "🚿" },
  { name: "Дача, сад і город", icon: "🌳" },
  { name: "Спорт і захоплення", icon: "⚽" },
  { name: "Одяг, взуття та прикраси", icon: "👗" },
  { name: "Краса та здоров’я", icon: "💄" },
  { name: "Дитячі товари", icon: "🧸" },
  { name: "Зоотовари", icon: "🐾" },
  { name: "Офіс, школа, книги", icon: "📚" },
  { name: "Алкогольні напої та продукти", icon: "🍷" },
  { name: "Побутова хімія", icon: "🧼" },
  { name: "Репетиція Чорної п’ятниці", icon: "🛍️" },
];

const CategoriesMenu: React.FC = () => {
  return (
    <div className="categories-menu">
      <ul>
        {categories.map((category, index) => (
          <li key={index} className="category-item">
            <span className="category-icon">{category.icon}</span>
            <span className="category-name">{category.name}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CategoriesMenu;
