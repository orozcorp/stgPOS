"use client";

import { useState } from "react";
import { AiOutlineDelete } from "react-icons/ai";
const SearchableSelect = ({ options = [], value, onChange, label }) => {
  const [search, setSearch] = useState(value?.label || "");
  const [isOpen, setIsOpen] = useState(false);
  const filteredOptions =
    options?.filter(
      (option) =>
        typeof option?.label === "string" &&
        option.label.toLowerCase().includes(search?.toLowerCase())
    ) || [];

  const handleOptionClick = (option) => {
    onChange(option);
    setSearch(option.label);
    setIsOpen(false);
  };

  return (
    <div className="flex-1">
      <div className="relative">
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
        <div className="flex flex-row flex-wrap justify-start items-center bg-gray-50 border-b-2">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onClick={() => {
              setIsOpen(true);
              setSearch("");
            }}
            onBlur={() => setTimeout(() => setIsOpen(false), 200)}
            className="my-2 flex-1 bg-gray-50  text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block  p-2.5"
          />
          <span>
            <AiOutlineDelete
              style={{
                width: "30px",
                height: "30px",
              }}
              className="my-icon"
              onClick={() => {
                setSearch("");
              }}
            />
          </span>
        </div>
      </div>
      {isOpen && (
        <div
          style={{
            maxHeight: "200px",
            overflowY: "scroll",
          }}
          py={1}
        >
          {filteredOptions?.map((option, index) => (
            <div
              key={index}
              className="m-2 p-2 border rounded hover:bg-sky-100 cursor-pointer flex flex-row flex-wrap gap-2 w-full"
              onClick={() => handleOptionClick(option)}
            >
              {option?.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchableSelect;
