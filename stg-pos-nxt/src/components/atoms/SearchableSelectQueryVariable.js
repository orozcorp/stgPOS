"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { AiOutlineDelete } from "react-icons/ai";
import { getData } from "@/lib/helpers/getData";
import debounce from "lodash/debounce";
import { useOnlineStatus } from "../Contexts/OnlineContext";

const SearchableSelectQueryVariable = ({
  value,
  onChange,
  title,
  query,
  queryName,
  variable,
  labelOptions,
  otherOptions = [],
}) => {
  const [search, setSearch] = useState(value?.label || "");
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState([]);
  const { isOnline } = useOnlineStatus();
  // Fetch options logic
  const fetchOptions = async (searchValue) => {
    const data = await getData({
      query,
      variables: { online: isOnline, [variable]: searchValue },
    });
    setOptions(
      data?.[queryName].map((val) => ({
        value: val._id,
        label: labelOptions
          .split(" ")
          .map((opt) => opt.split(".").reduce((o, k) => (o || {})[k], val))
          .join(" "),
        ...otherOptions.reduce((acc, option) => {
          acc[option] = val[option];
          return acc;
        }, {}),
      })) || []
    );
  };

  // Debounce the fetchOptions
  const debouncedFetchOptions = useCallback(
    debounce((newSearch) => {
      fetchOptions(newSearch);
    }, 300),
    [] // Removed unnecessary dependencies
  );

  // Effect for calling debounced fetchOptions
  useEffect(() => {
    if (search) {
      debouncedFetchOptions(search);
    }

    return () => {
      debouncedFetchOptions.cancel();
    };
  }, [search, debouncedFetchOptions]);

  // useMemo for filteredOptions
  const filteredOptions = useMemo(() => {
    return (
      options?.filter(
        (option) =>
          typeof option?.label === "string" &&
          option.label.toLowerCase().includes(search?.toLowerCase())
      ) || []
    );
  }, [options, search]);

  // handleOptionClick
  const handleOptionClick = useCallback(
    (option) => {
      onChange(option);
      setSearch(option.label);
      setIsOpen(false);
    },
    [onChange]
  );

  // onChange handler for input
  const handleInputChange = (e) => {
    const newSearch = e.target.value;
    setSearch(newSearch);
    if (!newSearch) {
      setOptions([]); // Clear options if search is empty
    }
  };

  return (
    <div className="flex-1">
      <div className="relative rounded-lg">
        <label className="block text-sm font-medium text-gray-700">
          {title}
        </label>
        <div className="flex flex-row flex-wrap justify-start items-center bg-gray-50 border-1 rounded-lg ">
          <input
            value={search}
            onChange={handleInputChange}
            onClick={() => setIsOpen(true)}
            className="my-2 flex-1 bg-gray-50  text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block  p-2.5"
          />
          <span>
            <AiOutlineDelete
              style={{ width: "30px", height: "30px" }}
              className="my-icon"
              onClick={() => setSearch("")}
            />
          </span>
        </div>
      </div>
      {isOpen && (
        <div style={{ maxHeight: "200px", overflowY: "scroll" }} py={1}>
          {filteredOptions.map((option, index) => (
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

export default SearchableSelectQueryVariable;
