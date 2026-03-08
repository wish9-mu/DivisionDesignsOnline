import React from "react";
import "./FilterSidebar.css";

const FilterGroup = ({ title, items, active, onChange }) => (
    <div className="filter-group">
        <h3 className="filter-group__title">{title}</h3>
        <ul className="filter-group__list">
            {items.map((item) => (
                <li
                    key={item}
                    className={`filter-group__item${active === item ? " filter-group__item--active" : ""}`}
                    onClick={() => onChange(item)}
                >
                    {item}
                </li>
            ))}
        </ul>
    </div>
);

const FilterSidebar = ({
    visible,
    categories,
    activeCategory,
    onCategoryChange,
    tags,
    activeTag,
    onTagChange,
    availability,
    activeAvailability,
    onAvailabilityChange,
}) => {
    return (
        <aside className={`shop-sidebar${visible ? "" : " shop-sidebar--hidden"}`}>
            <div className="sidebar-header">
                <span className="sidebar-header__dot" />
                <span className="sidebar-header__label">Filters</span>
            </div>

            <FilterGroup
                title="Category"
                items={categories}
                active={activeCategory}
                onChange={onCategoryChange}
            />

            <div className="filter-group__divider" />

            <FilterGroup
                title="Tag"
                items={tags}
                active={activeTag}
                onChange={onTagChange}
            />

            <div className="filter-group__divider" />

            <FilterGroup
                title="Availability"
                items={availability}
                active={activeAvailability}
                onChange={onAvailabilityChange}
            />
        </aside>
    );
};

export default FilterSidebar;
