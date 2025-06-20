import React from "react";
import "./styles/CategoriesSidebar.css";
import { categories } from "./CategoriesMenu";

interface Props {
  selectedCategory: string;
  onSelect: (category: string) => void;
}

export const CategoriesSidebar: React.FC<Props> = ({
  selectedCategory,
  onSelect,
}) => {
  return (
    <div className="category-sidebar">
      {categories.map((cat) => (
        <div
          key={cat.name}
          className={`category-item ${
            selectedCategory === cat.name ? "active" : ""
          }`}
          onClick={() => onSelect(cat.name)}
        >
          <span className="icon">{cat.icon}</span>
          <span>{cat.name}</span>
        </div>
      ))}
    </div>
  );
};
