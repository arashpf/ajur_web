import React, { useState, useRef, useEffect, useContext } from "react";
import axios from "axios";
import { CityContext } from "./CityContext";
import CitySelector from "./CitySelector";
import SearchIcon from "@mui/icons-material/Search";
import { useRouter } from "next/router";
import SmallCard from "../cards/SmallCard";

const RealEstateCard = ({ realstate, circle_size }) => (
  <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200">
    نمایش کارت املاک
  </div>
);

const suggestionsMap = {
  buySell: [
    "مثلا : خرید خانه ",
    "مثلا : ویلایی ",
    "مثلا تجاری ",
    "مثلا : اجاره آپارتمان",
  ],
  agents: [
    "جستجو مشاور : مثلا محمد دهقان",
    "جستجو مشاور املاک...",
    "مشاور املاک متخصص...",
  ],
  jobs: [
    "مثلا : نقاش ساختمان",
    "دکوراسیون داخلی",
    "مثلا : بنا",
    "مثلا : گچ کار",
  ],
};

const estateHints = [
  "آپارتمان",
  "خانه ویلایی",
  "زمین مسکونی",
  "مغازه",
  "اجاره آپارتمان",
  "اجاره خانه ویلایی",
  "باغ و باغچه",
  "زمین صنعتی",
];

const SEARCH_TIMEOUT = 15000;
const TYPING_DELAY = 600;

const categoriesData = [
  {
    id: 3,
    name: "خرید صنعتی",
    description: null,
    status: "1",
    has_parent: "0",
    has_child: "0",
    parent_id: "0",
    sort_order: "1",
    avatar: "industry",
    created_at: "2021-01-03T21:56:25.000000Z",
    updated_at: "2021-01-03T21:56:25.000000Z",
    type: "sell",
  },
  {
    id: 6,
    name: "اجاره صنعتی",
    description: "اجاره انواع واحد های صنعتی",
    status: "1",
    has_parent: "0",
    has_child: "0",
    parent_id: "0",
    sort_order: "27",
    avatar: "rent_industrial",
    created_at: "2024-04-06T16:01:02.000000Z",
    updated_at: "2024-04-06T16:01:02.000000Z",
    type: "rent",
  },
  {
    id: 16,
    name: "خرید آپارتمان",
    description: null,
    status: "1",
    has_parent: "1",
    has_child: "0",
    parent_id: "1",
    sort_order: "16",
    avatar: "sell_apartment",
    created_at: null,
    updated_at: null,
    type: "sell",
  },
  {
    id: 17,
    name: "خرید خانه ویلایی",
    description: "فروش انواع خانه های ویلایی",
    status: "1",
    has_parent: "1",
    has_child: "0",
    parent_id: "1",
    sort_order: "17",
    avatar: "sell_industrial_land",
    created_at: "2024-04-06T15:18:54.000000Z",
    updated_at: "2024-04-06T15:18:54.000000Z",
    type: "sell",
  },
  {
    id: 18,
    name: "خرید زمین مسکونی",
    description: null,
    status: "1",
    has_parent: "1",
    has_child: "0",
    parent_id: "2",
    sort_order: "18",
    avatar: "sell_residental_land",
    created_at: "2021-01-03T21:56:25.000000Z",
    updated_at: "2021-01-03T21:56:25.000000Z",
    type: "sell",
  },
  {
    id: 19,
    name: "خرید زمین تجاری و اداری",
    description: "دسته بندی زمین های تجاری و اداری",
    status: "1",
    has_parent: "1",
    has_child: "0",
    parent_id: "2",
    sort_order: "19",
    avatar: "sell_office_land",
    created_at: "2024-04-06T15:11:50.000000Z",
    updated_at: "2024-04-06T15:11:50.000000Z",
    type: "sell",
  },
  {
    id: 20,
    name: "خرید زمین صنعتی ",
    description: null,
    status: "1",
    has_parent: "1",
    has_child: "0",
    parent_id: "2",
    sort_order: "20",
    avatar: "sell_industrial_land",
    created_at: "2024-04-06T15:13:10.000000Z",
    updated_at: "2024-04-06T15:13:10.000000Z",
    type: "sell",
  },
  {
    id: 21,
    name: "خرید باغ و باغچه",
    description: "فروش انواع باغ و باغچه",
    status: "1",
    has_parent: "1",
    has_child: "0",
    parent_id: "2",
    sort_order: "21",
    avatar: "sell_industrial",
    created_at: "2024-04-06T15:54:38.000000Z",
    updated_at: "2024-04-06T15:54:38.000000Z",
    type: "sell",
  },
  {
    id: 22,
    name: "خرید زمین زراعی\n",
    description: null,
    status: "1",
    has_parent: "1",
    has_child: "0",
    parent_id: "2",
    sort_order: "22",
    avatar: "sell_farm_land",
    created_at: "2024-04-06T15:15:48.000000Z",
    updated_at: "2024-04-06T15:15:48.000000Z",
    type: "sell",
  },
  {
    id: 23,
    name: "خرید مغازه\n",
    description: null,
    status: "1",
    has_parent: "1",
    has_child: "0",
    parent_id: "4",
    sort_order: "23",
    avatar: "sell_store",
    created_at: "2024-04-06T15:48:19.000000Z",
    updated_at: "2024-04-06T15:48:19.000000Z",
    type: "sell",
  },
  {
    id: 24,
    name: "خرید دفتر کار و اداری",
    description: "انواع دفتر کار ، سالن و اداری",
    status: "1",
    has_parent: "1",
    has_child: "0",
    parent_id: "4",
    sort_order: "24",
    avatar: "sell_office",
    created_at: "2024-04-06T15:50:53.000000Z",
    updated_at: "2024-04-06T15:50:53.000000Z",
    type: "sell",
  },
  {
    id: 25,
    name: "اجاره آپارتمان",
    description: "اجاره انواع آپارتمان",
    status: "1",
    has_parent: "1",
    has_child: "0",
    parent_id: "5",
    sort_order: "25",
    avatar: "rent_apartment",
    created_at: "2024-04-06T15:59:02.000000Z",
    updated_at: "2024-04-06T15:59:02.000000Z",
    type: "rent",
  },
  {
    id: 26,
    name: "اجاره خانه ویلایی",
    description: "اجاره انواع خانه های ویلایی",
    status: "1",
    has_parent: "1",
    has_child: "0",
    parent_id: "5",
    sort_order: "26",
    avatar: "rent_villa",
    created_at: "2024-04-06T15:56:47.000000Z",
    updated_at: "2024-04-06T15:56:47.000000Z",
    type: "rent",
  },
  {
    id: 27,
    name: "اجاره مغازه",
    description: "اجاره انواع مغازه",
    status: "1",
    has_parent: "1",
    has_child: "0",
    parent_id: "7",
    sort_order: "27",
    avatar: "sell_store",
    created_at: "2024-04-06T16:08:35.000000Z",
    updated_at: "2024-04-06T16:08:35.000000Z",
    type: "rent",
  },
  {
    id: 28,
    name: "اجاره دفتر کار و اداری",
    description: "اجاره انواع دفتر کار، مطب و واحد اداری",
    status: "1",
    has_parent: "1",
    has_child: "0",
    parent_id: "7",
    sort_order: "28",
    avatar: "rent_office",
    created_at: "2024-04-06T16:09:35.000000Z",
    updated_at: "2024-04-06T16:09:35.000000Z",
    type: "rent",
  },
  {
    id: 65,
    name: "زمین هکتاری",
    description: "زمین هکتاری",
    status: "1",
    has_parent: "1",
    has_child: "0",
    parent_id: "2",
    sort_order: "1",
    avatar: "hectare_land",
    created_at: "2025-02-12T18:19:41.000000Z",
    updated_at: "2025-02-12T18:19:41.000000Z",
    type: "sell",
  },
];

const SearchBars = ({ realstates }) => {
  const router = useRouter();
  const { currentCity, isLoading } = useContext(CityContext);

  // State management
  const [activeTab, setActiveTab] = useState("buySell");
  const [searchQuery, setSearchQuery] = useState("");
  const [properties, setProperties] = useState([]);
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingAgents, setLoadingAgents] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [currentSuggestionIndex, setCurrentSuggestionIndex] = useState(0);
  const [isInputReady, setIsInputReady] = useState(false);
  const [searchStatus, setSearchStatus] = useState("جستجو...");
  const [networkStatus, setNetworkStatus] = useState({
    isConnected: true,
    isInternetReachable: true,
  });
  const [selectedCityName, setSelectedCityName] = useState();
  const [selectedCityId, setSelectedCityId] = useState();
  const [showCityModal, setShowCityModal] = useState(false);
  const [search_category, set_search_category] = useState([]);
  const [search_neighborhoods, set_search_neighborhoods] = useState([]);
  const [searchHistory, setSearchHistory] = useState([]);
  const [showAllNeighborhoods, setShowAllNeighborhoods] = useState(false);
  const [lastHintPressed, setLastHintPressed] = useState(null);
  const [suggestionDirection, setSuggestionDirection] = useState("down");

  // Refs
  const inputRef = useRef(null);
  const suggestionIntervalRef = useRef(null);
  const loadingTimeoutRef = useRef(null);
  const progressIntervalRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Effects
  useEffect(() => {
    if (currentCity && !isLoading) {
      // fetchData(currentCity.id);
    }
  }, [currentCity, isLoading]);

  useEffect(() => {
    if (lastHintPressed) {
      handleSearch(true);
    }
  }, [lastHintPressed]);

  useEffect(() => {
    const loadSearchHistory = async () => {
      try {
        const history = localStorage.getItem("realEstateSearchHistory");
        if (history) {
          setSearchHistory(JSON.parse(history));
        }
      } catch (error) {
        console.error("Failed to load search history", error);
      }
    };
    loadSearchHistory();
  }, []);

  useEffect(() => {
    if (activeTab && !searchQuery && !showModal) {
      suggestionIntervalRef.current = setInterval(() => {
        setSuggestionDirection("up");
        
        setTimeout(() => {
          setCurrentSuggestionIndex((prev) =>
            prev >= suggestionsMap[activeTab].length - 1 ? 0 : prev + 1
          );
          
          setTimeout(() => {
            setSuggestionDirection("down");
          }, 100);
        }, 500);
      }, 3000);
    } else {
      clearInterval(suggestionIntervalRef.current);
      setCurrentSuggestionIndex(0);
      setSuggestionDirection("down");
    }
    return () => clearInterval(suggestionIntervalRef.current);
  }, [activeTab, searchQuery, showModal]);

  useEffect(() => {
    if (showModal) {
      const timer = setTimeout(() => {
        setIsInputReady(true);
        inputRef.current?.focus();
      }, 300);
      return () => clearTimeout(timer);
    } else {
      setIsInputReady(false);
    }
  }, [showModal]);

  // Helper functions
  const getCurrentSuggestion = () => {
    if (searchQuery) return searchQuery;
    if (!activeTab) return "جستجو...";
    return suggestionsMap[activeTab][currentSuggestionIndex] || "جستجو...";
  };

  const getNextSuggestion = () => {
    if (!activeTab) return "جستجو...";
    const nextIndex = currentSuggestionIndex >= suggestionsMap[activeTab].length - 1 
      ? 0 
      : currentSuggestionIndex + 1;
    return suggestionsMap[activeTab][nextIndex] || "جستجو...";
  };

  const saveToHistory = async (query) => {
    if (!query.trim()) return;
    try {
      const updatedHistory = [
        query,
        ...searchHistory.filter(
          (item) => item.toLowerCase() !== query.toLowerCase()
        ),
      ].slice(0, 10);
      setSearchHistory(updatedHistory);
      localStorage.setItem(
        "realEstateSearchHistory",
        JSON.stringify(updatedHistory)
      );
    } catch (error) {
      console.error("Failed to save search history", error);
    }
  };

  const handleTabPress = (tabId) => {
    if (tabId === "agents") {
      if (!currentCity || isLoading) {
        setSearchStatus("لطفاً ابتدا یک شهر را انتخاب کنید");
        return;
      }
      getAgentsCall("all", currentCity.id);
    }
    setActiveTab(tabId);
    setSearchQuery("");
    setSearchStatus("جستجو...");
  };

  const handleCloseModal = () => {
    setActiveTab("buySell");
    setShowModal(false);
    clearTimeout(loadingTimeoutRef.current);
    clearInterval(progressIntervalRef.current);
  };

  const handleHintPress = (hint) => {
    setSearchQuery(hint);
    setLastHintPressed(hint);
  };

  const handleTextChange = (text) => {
    setSearchQuery(text);
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    if (text.trim().length > 0) {
      typingTimeoutRef.current = setTimeout(() => {
        handleSearch(false);
      }, TYPING_DELAY);
    }
  };

  const getAgentsCall = async (searchTerm) => {
    try {
      setLoadingAgents(true);
      setSearchStatus("در حال جستجوی مشاورین...");
      const response = await axios.get(
        "https://api.ajur.app/api/agents-search",
        {
          params: { title: searchTerm, limit: 20, city: currentCity.id },
          timeout: SEARCH_TIMEOUT,
        }
      );
      setAgents(response.data.agents || []);
      setSearchStatus(`${response.data.agents.length} مشاور یافت شد`);
    } catch (error) {
      console.error("Agent search failed:", error);
      setSearchStatus("خطا در جستجوی مشاورین");
    } finally {
      setLoadingAgents(false);
    }
  };

  const findCategoryById = (categoryId) => {
    return categoriesData.find((cat) => cat.id === categoryId);
  };

  const findCategoryByName = (categoryName) => {
    return categoriesData.find((cat) => {
      const normalizedInput = categoryName.replace(/\s+/g, " ").trim();
      const normalizedCatName = cat.name.replace(/\s+/g, " ").trim();
      return (
        normalizedCatName === normalizedInput ||
        normalizedCatName.includes(normalizedInput) ||
        normalizedInput.includes(normalizedCatName)
      );
    });
  };

  const sendToCat = (item, neighborhoodName = null) => {
    console.log("Item data:", item);

    let categoryId;
    let categoryName;

    if (item.category_array && typeof item.category_array === "object") {
      categoryId = item.category_array.id;
      categoryName = item.category_array.name || item.category;
    } else if (
      Array.isArray(item.category_array) &&
      item.category_array.length > 0
    ) {
      const firstCategory = item.category_array[0];
      if (typeof firstCategory === "object") {
        categoryId = firstCategory.id;
        categoryName = firstCategory.name || item.category;
      } else {
        categoryId = firstCategory;
        categoryName = item.category;
      }
    } else {
      categoryName = item.category;
      const foundCategory = findCategoryByName(categoryName);
      if (foundCategory) {
        categoryId = foundCategory.id;
      } else {
        console.error("No category found for item:", item);
        return;
      }
    }

    const queryParams = {
      name: categoryName,
      id: categoryId,
      categories: categoryId,
    };

    if (neighborhoodName) {
      queryParams.neighbor = neighborhoodName;
    }

    if (currentCity) {
      queryParams.city = currentCity.title;
    }

    console.log("Navigating to category page with params:", queryParams);

    const dynamicPathname = `/${currentCity.title}/${encodeURIComponent(
      categoryName
    )}`;

    router.push({
      pathname: dynamicPathname,
      query: queryParams,
    });
  };

  const handleSearch = async (isManualSearch = true) => {
    if (!currentCity || isLoading) {
      setSearchStatus("لطفاً ابتدا یک شهر را انتخاب کنید");
      return;
    }
    if (!searchQuery.trim()) {
      return;
    }

    console.log(`Searching for "${searchQuery}" in ${activeTab} tab`);

    try {
      setLoading(true);
      setSearchStatus("در حال جستجو...");

      if (isManualSearch) {
        await saveToHistory(searchQuery);
      }

      progressIntervalRef.current = setInterval(() => {
        setSearchStatus((prev) =>
          prev.includes("...") ? "در حال جستجو" : prev + "."
        );
      }, 500);

      switch (activeTab) {
        case "buySell":
          try {
            const response = await axios.post(
              "https://api.ajur.app/api/search-intent",
              {
                query: searchQuery,
                cityid: currentCity.id,
              },
              { timeout: 10000 }
            );

            clearTimeout(loadingTimeoutRef.current);
            clearInterval(progressIntervalRef.current);

            if (!response.data || !Array.isArray(response.data)) {
              throw new Error("پاسخ نامعتبر از سرور دریافت شد");
            }

            const categoriesWithNeighborhoods = response.data;
            const allNeighborhoods =
              categoriesWithNeighborhoods.length > 0
                ? [
                    ...new Set(
                      categoriesWithNeighborhoods.flatMap((c) =>
                        c.neighborhoods.map((n) => n.name)
                      )
                    ),
                  ]
                : [];

            set_search_neighborhoods(allNeighborhoods);

            const displayItems = categoriesWithNeighborhoods.map(
              (categoryData, index) => {
                const categoryName = categoryData.category_name;
                const category_array = categoryData.category;
                const neighborhoods = categoryData.neighborhoods;

                return {
                  id: `category-${index}-${Date.now()}`,
                  category: categoryName,
                  category_array: category_array,
                  neighborhoods: neighborhoods,
                  propertyCounts: neighborhoods.reduce((acc, curr) => {
                    acc[curr.name] = curr.property_count;
                    return acc;
                  }, {}),
                  filters: { category_name: categoryName },
                  chips: neighborhoods
                    .filter((n) => n.property_count > 0)
                    .slice(0, 5)
                    .map((n) => ({
                      label: `${n.name} (${n.property_count})`,
                      value: n.name,
                    })),
                  isEmpty: neighborhoods.every((n) => n.property_count === 0),
                  isPrimary: index === 0,
                };
              }
            );

            if (displayItems.length === 0) {
              displayItems.push({
                id: "default-category",
                category: "",
                neighborhoods: [],
                propertyCounts: {},
                filters: {},
                chips: [],
                isEmpty: true,
                isPrimary: true,
              });
            }

            setProperties(displayItems);

            const statusText =
              categoriesWithNeighborhoods.length > 0
                ? `دسته‌بندی‌ها: ${categoriesWithNeighborhoods
                    .map((c) => c.category_name)
                    .join("، ")} در ${currentCity.title}`
                : `جستجوی عمومی در ${currentCity.title}`;

            setSearchStatus(statusText);
          } catch (error) {
            console.error("Search error:", error);
            setSearchStatus("خطایی در دریافت اطلاعات رخ داده است");
          }
          break;

        case "agents":
          await getAgentsCall(searchQuery);
          break;

        case "jobs":
          setSearchStatus("جستجوی مشاغل انجام شد");
          break;

        default:
          setSearchStatus("لطفاً یک تب معتبر را انتخاب کنید");
          return;
      }
    } catch (error) {
      console.error("Search error:", error);
      clearTimeout(loadingTimeoutRef.current);
      clearInterval(progressIntervalRef.current);
      setSearchStatus("خطا در جستجو");
    } finally {
      setLoading(false);
    }
  };

  const set_modal_active = (status) => {
    setShowAllNeighborhoods(false);
    setProperties([]);
    setSearchQuery("");
    setShowModal(true);

    const timer = setTimeout(() => {
      setIsInputReady(true);
      inputRef.current?.focus();
    }, 500);
    return () => clearTimeout(timer);
  };

  const handleHomeClick = () => {
    router.push("/");
  };

  const renderSpinner = () => (
    <div className="flex justify-center items-center py-5">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case "buySell":
        return (
          <div className="flex-1 py-2">
            {loading ? (
              renderSpinner()
            ) : (
              <div className="space-y-4">
                {properties.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white rounded-lg p-4 shadow-sm border border-gray-200"
                  >
                    <div className="flex flex-row-reverse items-center justify-between pb-3 border-b border-gray-100">
                      <div className="text-blue-800 font-bold text-sm">
                        {item.category} در {currentCity.title}
                        <span className="text-gray-500 text-sm">
                          {` (${Object.values(item.propertyCounts).reduce(
                            (sum, count) => sum + count,
                            0
                          )} مورد)`}
                        </span>
                      </div>
                      <button
                        className="flex flex-row-reverse items-center text-blue-600 hover:text-blue-800"
                        onClick={() => sendToCat(item)}
                      >
                        <span className="text-sm ml-1">همه موارد</span>
                        <span>‹</span>
                      </button>
                    </div>

                    <div className="flex flex-row-reverse flex-wrap gap-2 mt-3">
                      {(showAllNeighborhoods
                        ? item.neighborhoods
                        : item.neighborhoods.slice(0, 10)
                      ).map((neighborhood, index) => {
                        const propertyCount = neighborhood.property_count || 0;
                        return (
                          <button
                            key={`${item.id}-${neighborhood.name}-${index}`}
                            className={`px-3 py-1 rounded-full text-sm border ${
                              propertyCount === 0
                                ? "bg-gray-100 text-gray-400 border-gray-300 cursor-not-allowed"
                                : "bg-green-50 text-gray-700 border-green-200 hover:bg-green-100"
                            }`}
                            onClick={() =>
                              propertyCount > 0 &&
                              sendToCat(item, neighborhood.name)
                            }
                            disabled={propertyCount === 0}
                          >
                            {neighborhood.name}
                            {propertyCount > 0 && (
                              <span className="text-gray-500 text-xs mr-1">
                                {` (${propertyCount} ملک)`}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {item.neighborhoods.length > 10 &&
                      !showAllNeighborhoods && (
                        <button
                          className="w-full py-2 text-center text-blue-600 hover:text-blue-800 text-sm mt-2"
                          onClick={() => setShowAllNeighborhoods(true)}
                        >
                          نمایش همه محلات ({item.neighborhoods.length - 10} مورد
                          دیگر)
                        </button>
                      )}
                  </div>
                ))}

                {properties.length === 0 && !loading && (
                  <div className="text-center space-y-4">
                    {searchHistory.length > 0 && (
                      <>
                        <div className="text-right">
                          <h3 className="text-gray-500 text-sm mb-2">
                            جستجوهای اخیر:
                          </h3>
                          <div className="flex flex-row-reverse flex-wrap gap-2 justify-end">
                            {searchHistory.map((historyItem, index) => (
                              <div
                                key={`history-${index}`}
                                className="flex flex-row-reverse items-center bg-gray-200 px-3 py-1 rounded-full cursor-pointer hover:bg-gray-300"
                                onClick={() => handleHintPress(historyItem)}
                              >
                                <span className="text-gray-700 text-sm ml-2">
                                  {historyItem}
                                </span>
                                <button
                                  className="text-gray-500 hover:text-gray-700 text-xs"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    const updatedHistory = searchHistory.filter(
                                      (_, i) => i !== index
                                    );
                                    setSearchHistory(updatedHistory);
                                    localStorage.setItem(
                                      "realEstateSearchHistory",
                                      JSON.stringify(updatedHistory)
                                    );
                                  }}
                                >
                                  ×
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      </>
                    )}

                    <div className="text-right">
                      <h3 className="text-gray-500 text-sm mb-2">
                        پیشنهادهایی برای جستجو:
                      </h3>
                      <div className="flex flex-row-reverse flex-wrap gap-2">
                        {estateHints.map((hint, index) => (
                          <button
                            key={`hint-${index}`}
                            className="bg-gray-600 text-white px-3 py-1 rounded-full text-sm hover:bg-gray-700"
                            onClick={() => handleHintPress(hint)}
                          >
                            {hint}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        );

      case "agents":
        return (
          <div className="flex-1">
            {loadingAgents ? (
              renderSpinner()
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 m-4">
                {agents.map((agent, index) => (
                  <SmallCard
                    key={index}
                    realEstate={agent}
                    profileImageKey="profile_url"
                    compact={true}
                  />
                ))}
              </div>
            )}
            {agents.length === 0 && !loadingAgents && (
              <div className="text-center text-gray-500 py-5 col-span-full">
                مشاوری یافت نشد
              </div>
            )}
          </div>
        );

      case "jobs":
        return (
          <div className="flex-1 py-2">
            <div className="text-center text-gray-500 mb-3">{searchStatus}</div>
            <div className="text-right p-3 text-lg leading-8">
              اگر شما فعال در زمینه‌های مختلف مشاغل مرتبط با ساخت و ساز هستید،
              با شماره زیر تماس بگیرید تا از شرایط ثبت پروفایل خود در آجر آگاه
              شوید
            </div>
            <div className="text-center p-3 text-lg text-red-500 font-sans">
              09382740488
            </div>
          </div>
        );

      default:
        return (
          <div className="flex-1 py-2">
            <div className="text-center text-gray-500 py-5">
              لطفاً یک تب را انتخاب کنید
            </div>
          </div>
        );
    }
  };

  return (
    <div className="w-full py-2 px-3 bg-white">
      {/* Header with Logo and Search Bar */}
      <div className="flex items-center gap-4">
        {/* Search Bar taking remaining space */}
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <CitySelector
              handleCitySelect={(city) => {
                setShowAllNeighborhoods(false);
              }}
            />

            <div
              className="flex-1 flex flex-row-reverse items-center bg-gray-50 rounded-2xl border border-gray-300 h-14 px-4 cursor-pointer shadow-sm hover:shadow-md transition-shadow relative overflow-hidden"
              onClick={() => set_modal_active(true)}
            >
              {/* Animated Suggestion Container */}
              <div className="flex-1 text-right overflow-hidden relative h-6">
                {/* Current Suggestion */}
                <div
                  className={`absolute inset-0 flex items-center transition-all duration-500 ease-in-out ${
                    suggestionDirection === "up"
                      ? "transform -translate-y-full opacity-0"
                      : "transform translate-y-0 opacity-100"
                  }`}
                >
                  <span className="text-gray-600 text-base overflow-hidden whitespace-nowrap overflow-ellipsis w-full">
                    {getCurrentSuggestion()}
                  </span>
                </div>
                
                {/* Next Suggestion */}
                <div
                  className={`absolute inset-0 flex items-center transition-all duration-500 ease-in-out ${
                    suggestionDirection === "up"
                      ? "transform translate-y-0 opacity-100"
                      : "transform translate-y-full opacity-0"
                  }`}
                >
                  <span className="text-gray-600 text-base overflow-hidden whitespace-nowrap overflow-ellipsis w-full">
                    {getNextSuggestion()}
                  </span>
                </div>
              </div>

              <button
                className="w-10 h-10 rounded-xl flex items-center justify-center mr-2 hover:bg-gray-200 transition-colors"
                onClick={() => set_modal_active(true)}
                aria-label="جستجو"
              >
                <SearchIcon style={{ fontSize: 22 }} />
              </button>
            </div>

            <button
              onClick={handleHomeClick}
              className="flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
              aria-label="رفتن به صفحه اصلی"
            >
              <img
                src="/logo/web-logo-text.png"
                alt="آجر"
                className="h-8 w-auto"
              />
            </button>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={handleCloseModal}
          />
          {/* Top-down panel: appears from above and replaces the searchbar */}
          <div
            className={`absolute top-0 left-0 right-0 bg-white rounded-b-3xl p-6 max-h-[90vh] overflow-auto flex flex-col animate__animated animate__slideInDown`}
          >
            {/* Floating close button in the corner */}
            <button
              onClick={handleCloseModal}
              aria-label="بستن"
              style={{
                position: "absolute",
                top: 16,
                right: 16,
                zIndex: 80,
                background: "transparent",
                border: "none",
                fontSize: "1.35rem",
                cursor: "pointer",
                padding: 6,
                lineHeight: 1,
              }}
            >
              ✕
            </button>
            {/* Tab Header */}
            <div className="flex flex-row-reverse items-center mb-4">
              <div className="flex-1 flex justify-between gap-3">
                {Object.entries(suggestionsMap).map(([tabId]) => (
                  <button
                    key={tabId}
                    className={`flex-1 py-3 px-3 rounded-xl text-sm font-medium transition-colors ${
                      activeTab === tabId
                        ? "bg-red-500 text-white"
                        : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                    }`}
                    onClick={() => handleTabPress(tabId)}
                  >
                    {tabId === "buySell"
                      ? "املاک"
                      : tabId === "agents"
                      ? "مشاورین"
                      : "مشاغل"}
                  </button>
                ))}
              </div>
            </div>

            {/* Search Input */}
            <div className="flex flex-row-reverse items-center bg-white border-2 border-red-500 rounded-2xl h-14 mb-6 px-4">
              <input
                ref={inputRef}
                type="text"
                className="flex-1 h-full text-right text-gray-800 text-base outline-none px-3 bg-white"
                style={{ backgroundColor: "white" }}
                placeholder={getCurrentSuggestion()}
                value={searchQuery}
                onChange={(e) => handleTextChange(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSearch(true)}
                autoFocus={isInputReady}
              />
              <div className="ml-3">
                <CitySelector
                  handleCitySelect={(city) => {
                    set_modal_active();
                    setShowAllNeighborhoods(false);
                  }}
                />
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">{renderTabContent()}</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchBars;