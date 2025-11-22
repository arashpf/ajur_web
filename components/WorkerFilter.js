import React, { useState, useEffect } from "react";
import axios from "axios";
import { useFilter } from "./contexts/FilterContext";
import {
  Box,
  Button,
  Grid,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Slider,
  CircularProgress,
  Divider,
  Typography,
  Chip,
  Stack,
  Menu,
  MenuItem,
  useMediaQuery,
  Skeleton,
  useTheme,
  TextField,
  Paper,
} from "@mui/material";
import {
  ExpandMore,
  Delete,
  CheckBoxOutlineBlank,
  CheckBox,
  RadioButtonChecked,
  RadioButtonUnchecked,
  Close,
  Tune,
  ArrowBack,
  Sort,
} from "@mui/icons-material";

// Utility functions
const convertToPersianDigits = (str) => {
  if (!str) return "";
  return str.toString().replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[d]);
};

const formatNumber = (num) => {
  if (num === "" || num === null || num === undefined) return "";
  const number = parseFloat(num);
  if (isNaN(number)) return "";

  return convertToPersianDigits(
    number.toLocaleString("en-US", { maximumFractionDigits: 0 })
  );
};

const formatNumberWithWords = (num) => {
  if (num === "" || num === null || num === undefined) return "";
  const number = parseFloat(num);
  if (isNaN(number)) return "";

  // For numbers >= 1 billion
  if (number >= 1000000000) {
    const billions = Math.floor(number / 1000000000);
    const remainder = number % 1000000000;
    let result = `${convertToPersianDigits(billions.toString())} میلیارد`;
    if (remainder > 0) {
      const millions = Math.floor(remainder / 1000000);
      result += ` و ${convertToPersianDigits(millions.toString())} میلیون`;
    }
    return result;
  }

  // For numbers >= 1 million
  if (number >= 1000000) {
    const millions = Math.floor(number / 1000000);
    const remainder = number % 1000000;
    let result = `${convertToPersianDigits(millions.toString())} میلیون`;
    if (remainder > 0) {
      const thousands = Math.floor(remainder / 1000);
      result += ` و ${convertToPersianDigits(thousands.toString())} هزار`;
    }
    return result;
  }

  // For numbers >= 1000
  if (number >= 1000) {
    const thousands = Math.floor(number / 1000);
    const remainder = number % 1000;
    let result = `${convertToPersianDigits(thousands.toString())} هزار`;
    if (remainder > 0) {
      result += ` و ${convertToPersianDigits(remainder.toString())}`;
    }
    return result;
  }

  return convertToPersianDigits(number.toString());
};

const WorkerFilter = ({
  workers = [],
  onFilteredWorkersChange,
  initialCategory = null,
  onCategoryChange = null,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const { isFilterOpen, openFilter, closeFilter } = useFilter();

  // State
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedNeighborhoods, setSelectedNeighborhoods] = useState([]);
  const [selectedFeatures, setSelectedFeatures] = useState([]);
  const [rangeFilters, setRangeFilters] = useState([]);
  const [filterLevel, setFilterLevel] = useState("base");
  const [sortAnchorEl, setSortAnchorEl] = useState(null);
  const [sortBy, setSortBy] = useState("newest");
  const [loading, setLoading] = useState(true);
  const [focusedField, setFocusedField] = useState(null); // Track which field is focused
  const [filterTimeout, setFilterTimeout] = useState(null); // Timeout for debouncing
  const [moreFiltersExpanded, setMoreFiltersExpanded] = useState(false); // State for collapsible filters

  // Data
  const [categories, setCategories] = useState([]);
  const [neighborhoods, setNeighborhoods] = useState([]);

  // Define all possible features
  const allFeatures = [
    { id: 1, name: "پارکینگ", value: "پارکینگ" },
    { id: 2, name: "آسانسور", value: "آسانسور" },
    { id: 3, name: "انباری", value: "انباری" },
  ];

  // Define range filter fields
  const rangeFilterFields = [
    { id: 1, name: "متراژ", value: "متراژ", unit: "متر", min: 0, max: 10000 },
    {
      id: 2,
      name: "قیمت",
      value: "قیمت",
      unit: "تومان",
      min: 0,
      max: 1000000000000,
    },
    {
      id: 3,
      name: "تعداد اتاق",
      value: "تعداد اتاق",
      unit: "اتاق",
      min: 0,
      max: 20,
    },
  ];

  // Category type mappings
  const categoryTypeMappings = {
    residential: [16, 17, 25, 26],
    commercial: [23, 24, 27, 28],
    land: [18, 19, 20, 21, 22, 65],
    industrial: [3, 6],
  };

  // Feature availability by category type
  const featureAvailability = {
    residential: ["پارکینگ", "آسانسور", "انباری"],
    commercial: ["پارکینگ", "آسانسور", "انباری"],
    land: [],
    industrial: ["پارکینگ", "انباری"],
  };

  // Common price suggestions
  const priceSuggestions = [
    { value: 500000000, label: "۵۰۰ میلیون" },
    { value: 1000000000, label: "۱ میلیارد" },
    { value: 1500000000, label: "۱/۵ میلیارد" },
    { value: 2000000000, label: "۲ میلیارد" },
    { value: 2500000000, label: "۲/۵ میلیارد" },
    { value: 3000000000, label: "۳ میلیارد" },
    { value: 5000000000, label: "۵ میلیارد" },
    { value: 10000000000, label: "۱۰ میلیارد" },
  ];

  // Common area suggestions
  const areaSuggestions = [
    { value: 50, label: "۵۰ متر" },
    { value: 70, label: "۷۰ متر" },
    { value: 100, label: "۱۰۰ متر" },
    { value: 120, label: "۱۲۰ متر" },
    { value: 150, label: "۱۵۰ متر" },
    { value: 200, label: "۲۰۰ متر" },
    { value: 250, label: "۲۵۰ متر" },
    { value: 300, label: "۳۰۰ متر" },
  ];

  // Convert number to Persian words
  const numberToPersianWords = (num) => {
    if (num === "" || num === null || num === undefined) return "";

    const number = parseFloat(num);
    if (isNaN(number)) return "";

    // For small numbers (under 1000), just return the number
    if (number < 1000) {
      return convertToPersianDigits(number.toString());
    }

    // For thousands
    if (number < 1000000) {
      const thousands = Math.floor(number / 1000);
      const remainder = number % 1000;
      let result = `${convertToPersianDigits(thousands.toString())} هزار`;
      if (remainder > 0) {
        result += ` و ${convertToPersianDigits(remainder.toString())}`;
      }
      return result;
    }

    // For millions
    if (number < 1000000000) {
      const millions = Math.floor(number / 1000000);
      const remainder = number % 1000000;
      let result = `${convertToPersianDigits(millions.toString())} میلیون`;
      if (remainder > 0) {
        result += ` و ${numberToPersianWords(remainder)}`;
      }
      return result;
    }

    // For billions
    const billions = Math.floor(number / 1000000000);
    const remainder = number % 1000000000;
    let result = `${convertToPersianDigits(billions.toString())} میلیارد`;
    if (remainder > 0) {
      result += ` و ${numberToPersianWords(remainder)}`;
    }
    return result;
  };

  // Get suggestions based on field type
  const getSuggestions = (fieldId) => {
    if (fieldId === 2) {
      // Price field
      return priceSuggestions;
    } else if (fieldId === 1) {
      // Area field
      return areaSuggestions;
    }
    return [];
  };

  // Handle suggestion click
  const handleSuggestionClick = (fieldId, type, value) => {
    setRangeFilters((prev) =>
      prev.map((f) =>
        f.id === fieldId
          ? {
              ...f,
              [type]: value,
            }
          : f
      )
    );
    setFocusedField(null); // Close suggestions
  };

  // Initialize range filters with empty values (showing all)
  useEffect(() => {
    const initialRangeFilters = rangeFilterFields.map((field) => ({
      ...field,
      low: "", // Empty means no lower limit
      high: "", // Empty means no upper limit
    }));
    setRangeFilters(initialRangeFilters);
  }, []);

  // Sync selectedCategory with initialCategory prop when it changes
  useEffect(() => {
    setSelectedCategory(initialCategory);
  }, [initialCategory]);

  // Get available features based on selected category
  const getAvailableFeatures = () => {
    if (!selectedCategory) {
      return allFeatures;
    }

    let categoryType = null;
    for (const [type, categoryIds] of Object.entries(categoryTypeMappings)) {
      if (categoryIds.includes(selectedCategory.id)) {
        categoryType = type;
        break;
      }
    }

    if (!categoryType) {
      return allFeatures;
    }

    const availableFeatureValues = featureAvailability[categoryType] || [];
    return allFeatures.filter((feature) =>
      availableFeatureValues.includes(feature.value)
    );
  };

  // Fetch categories and neighborhoods
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get("https://api.ajur.app/api/base");
        setCategories(response.data.cats);
        setNeighborhoods(response.data.the_neighborhoods);
      } catch (error) {
        console.error("Error loading filters:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Debounced filter application
  const applyFiltersWithDebounce = () => {
    // Clear existing timeout
    if (filterTimeout) {
      clearTimeout(filterTimeout);
    }

    // Set new timeout
    const timeout = setTimeout(() => {
      const filtered = applyFilters();
      const sorted = sortWorkers(filtered);
      onFilteredWorkersChange(sorted);
    }, 300); // 300ms delay

    setFilterTimeout(timeout);
  };

  // Apply filters when dependencies change with debounce
  useEffect(() => {
    applyFiltersWithDebounce();

    // Cleanup timeout on unmount
    return () => {
      if (filterTimeout) {
        clearTimeout(filterTimeout);
      }
    };
  }, [
    workers,
    selectedCategory,
    selectedNeighborhoods,
    selectedFeatures,
    rangeFilters,
    sortBy,
  ]);

  const handleCategoryChange = () => {
    openFilter();
    setFilterLevel("category");
  };

  const applyFilters = () => {
    return workers.filter((worker) => {
      // Category filter
      if (
        selectedCategory &&
        parseInt(worker.category_id) !== selectedCategory.id
      ) {
        return false;
      }

      // Neighborhood filter
      if (selectedNeighborhoods.length > 0) {
        const workerNeighborhoodId = parseInt(worker.neighborhood_id);
        if (
          !selectedNeighborhoods.some((nb) => nb.id === workerNeighborhoodId)
        ) {
          return false;
        }
      }

      // Features filter
      if (selectedFeatures.length > 0) {
        try {
          const workerProperties = JSON.parse(worker.json_properties || "[]");
          const hasAllFeatures = selectedFeatures.every((feature) =>
            workerProperties.some(
              (prop) => prop.name === feature.value && prop.kind === 2
            )
          );
          if (!hasAllFeatures) {
            return false;
          }
        } catch (e) {
          return false;
        }
      }

      // Range filters
      if (!passesRangeFilters(worker)) {
        return false;
      }

      return true;
    });
  };

  const passesRangeFilters = (worker) => {
    try {
      const workerProperties = JSON.parse(worker.json_properties || "[]");

      // If no range filters are set (all are empty), return true
      const hasActiveRangeFilters = rangeFilters.some(
        (filter) => filter.low !== "" || filter.high !== ""
      );

      if (!hasActiveRangeFilters) {
        return true;
      }

      return rangeFilters.every((filter) => {
        // If both low and high are empty, this filter is inactive
        if (filter.low === "" && filter.high === "") {
          return true;
        }

        // Try to find the property by name - look in both special and regular properties
        const workerProp = workerProperties.find(
          (prop) =>
            prop.name === filter.value || prop.name.includes(filter.value)
        );

        // If property doesn't exist and we have active filters, exclude
        if (!workerProp) {
          return false;
        }

        // Parse the worker value - handle different formats
        let workerValue;
        try {
          workerValue = parseFloat(workerProp.value);
          if (isNaN(workerValue)) {
            // Try to extract numbers from string if it contains text
            const numMatch = workerProp.value.match(/\d+/);
            workerValue = numMatch ? parseFloat(numMatch[0]) : NaN;
          }
        } catch (e) {
          return false;
        }

        if (isNaN(workerValue)) {
          return false;
        }

        // Check lower bound (if set)
        const lowerBoundOK =
          filter.low === "" || workerValue >= parseFloat(filter.low);

        // Check upper bound (if set)
        const upperBoundOK =
          filter.high === "" || workerValue <= parseFloat(filter.high);

        return lowerBoundOK && upperBoundOK;
      });
    } catch (e) {
      return false;
    }
  };

  const sortWorkers = (workersToSort) => {
    if (!workersToSort.length) return workersToSort;

    const workersCopy = [...workersToSort];

    switch (sortBy) {
      case "newest":
        return workersCopy.sort(
          (a, b) => new Date(b.updated_at || 0) - new Date(a.updated_at || 0)
        );
      case "oldest":
        return workersCopy.sort(
          (a, b) => new Date(a.updated_at || 0) - new Date(b.updated_at || 0)
        );
      case "most_viewed":
        return workersCopy.sort(
          (a, b) =>
            (parseInt(b.total_view) || 0) - (parseInt(a.total_view) || 0)
        );
      default:
        return workersCopy;
    }
  };

  // Event handlers with immediate UI feedback but debounced filtering
  const handleCategorySelect = (category) => {
    if (onCategoryChange) {
      onCategoryChange(category);
    } else {
      setSelectedCategory(category);
    }
    setFilterLevel("base");
    // Filtering will happen automatically via useEffect
  };

  const handleNeighborhoodToggle = (neighborhood) => {
    setSelectedNeighborhoods((prev) =>
      prev.some((n) => n.id === neighborhood.id)
        ? prev.filter((n) => n.id !== neighborhood.id)
        : [...prev, neighborhood]
    );
    // Filtering will happen automatically via useEffect
  };

  const handleFeatureToggle = (feature) => {
    setSelectedFeatures((prev) =>
      prev.some((f) => f.value === feature.value)
        ? prev.filter((f) => f.value !== feature.value)
        : [...prev, feature]
    );
    // Filtering will happen automatically via useEffect
  };

  const handleRangeFilterChange = (fieldId, type, value) => {
    setRangeFilters((prev) =>
      prev.map((f) =>
        f.id === fieldId
          ? {
              ...f,
              [type]: value === "" ? "" : parseFloat(value) || "",
            }
          : f
      )
    );
    // Filtering will happen automatically via useEffect
  };

  const handleSortChange = (newSortBy) => {
    setSortBy(newSortBy);
    setSortAnchorEl(null);
    // Filtering will happen automatically via useEffect
  };

  const handleResetAll = () => {
    setSelectedCategory(null);
    setSelectedNeighborhoods([]);
    setSelectedFeatures([]);
    setRangeFilters(
      rangeFilterFields.map((field) => ({
        ...field,
        low: "",
        high: "",
      }))
    );
    setSortBy("newest");
    if (onCategoryChange) onCategoryChange(null);
    // Filtering will happen automatically via useEffect
  };

  const getSortDisplayText = () => {
    const sortTexts = {
      newest: "جدیدترین",
      oldest: "قدیمی ترین",
      most_viewed: "پر بازدید ترین",
    };
    return sortTexts[sortBy] || "مرتب‌سازی";
  };

  // Render methods
  const renderSelectedFilters = () => {
    const hasActiveFilters =
      selectedCategory ||
      selectedNeighborhoods.length > 0 ||
      selectedFeatures.length > 0 ||
      rangeFilters.some((filter) => filter.low !== "" || filter.high !== "") ||
      sortBy !== "newest";

    if (!hasActiveFilters) return null;

    return (
      <Box
        sx={{
          p: 2,
          border: "1px solid",
          borderColor: "grey.300",
          borderRadius: 2,
        }}
      >
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          {selectedCategory && (
            <Chip
              label={`دسته‌بندی: ${selectedCategory.name}`}
              onClick={() => handleCategoryChange()}
              color="primary"
              variant="outlined"
              size="small"
            />
          )}

          {selectedNeighborhoods.map((neighborhood) => (
            <Chip
              key={neighborhood.id}
              label={`محله: ${neighborhood.name}`}
              onDelete={() =>
                setSelectedNeighborhoods((prev) =>
                  prev.filter((n) => n.id !== neighborhood.id)
                )
              }
              color="secondary"
              variant="outlined"
              size="small"
            />
          ))}

          {selectedFeatures.map((feature) => (
            <Chip
              key={feature.value}
              label={`دارای ${feature.value}`}
              onDelete={() =>
                setSelectedFeatures((prev) =>
                  prev.filter((f) => f.value !== feature.value)
                )
              }
              color="success"
              variant="outlined"
              size="small"
            />
          ))}

          {rangeFilters
            .map((filter) => {
              if (filter.low !== "" || filter.high !== "") {
                let label = `${filter.name}: `;
                
                if (filter.low !== "" && filter.high !== "") {
                  // Both low and high set
                  label += `${formatNumberWithWords(filter.low)} تا ${formatNumberWithWords(filter.high)} ${filter.unit}`;
                } else if (filter.low !== "") {
                  // Only low set
                  label += `از ${formatNumberWithWords(filter.low)}`;
                } else if (filter.high !== "") {
                  // Only high set
                  label += `تا ${formatNumberWithWords(filter.high)}`;
                }
                
                return (
                  <Chip
                    key={filter.id}
                    label={label}
                    onDelete={() => {
                      setRangeFilters((prev) =>
                        prev.map((f) =>
                          f.id === filter.id ? { ...f, low: "", high: "" } : f
                        )
                      );
                    }}
                    color="warning"
                    variant="outlined"
                    size="small"
                  />
                );
              }
              return null;
            })
            .filter(Boolean)}

          {sortBy !== "newest" && (
            <Chip
              label={`مرتب‌سازی: ${getSortDisplayText()}`}
              onDelete={() => setSortBy("newest")}
              color="info"
              variant="outlined"
              size="small"
            />
          )}

          <Chip
            label="پاک کردن همه"
            onClick={handleResetAll}
            color="error"
            variant="outlined"
            size="small"
            icon={<Delete />}
          />
        </Stack>
      </Box>
    );
  };

  const renderFeatures = () => {
    const availableFeatures = getAvailableFeatures();

    if (availableFeatures.length === 0) {
      return null;
    }

    return (
      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle2" sx={{ mb: 2, color: "text.secondary" }}>
          امکانات:
        </Typography>

        <Grid container spacing={1}>
          {availableFeatures.map((feature) => {
            const isSelected = selectedFeatures.some(
              (f) => f.value === feature.value
            );

            return (
              <Grid item xs={12} key={feature.id}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    p: 2,
                    border: "1px solid",
                    borderColor: isSelected ? "primary.main" : "grey.300",
                    borderRadius: 2,
                    bgcolor: isSelected ? "primary.light" : "white",
                    cursor: "pointer",
                  }}
                  onClick={() => handleFeatureToggle(feature)}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                    <Box
                      sx={{
                        width: 20,
                        height: 20,
                        border: "2px solid",
                        borderColor: isSelected ? "primary.main" : "grey.400",
                        borderRadius: "4px",
                        bgcolor: isSelected ? "primary.main" : "transparent",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {isSelected && (
                        <CheckBox sx={{ color: "white", fontSize: 16 }} />
                      )}
                    </Box>
                    <Typography
                      variant="body2"
                      fontWeight={isSelected ? "bold" : "normal"}
                    >
                      دارای {feature.value}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            );
          })}
        </Grid>
      </Box>
    );
  };

  const renderRangeFilters = () => (
    <Box sx={{ mb: 2 }}>
      <Accordion
        expanded={moreFiltersExpanded}
        onChange={() => setMoreFiltersExpanded(!moreFiltersExpanded)}
        sx={{
          "&:before": {
            display: "none",
          },
          boxShadow: "none",
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 2,
        }}
      >
        <AccordionSummary
          expandIcon={<ExpandMore />}
          sx={{
            backgroundColor: moreFiltersExpanded ? "grey.50" : "transparent",
            borderBottom: moreFiltersExpanded ? "1px solid" : "none",
            borderColor: "divider",
            borderRadius: moreFiltersExpanded ? "8px 8px 0 0" : "8px",
            minHeight: "48px",
            "& .MuiAccordionSummary-content": {
              margin: "12px 0",
            },
          }}
        >
          <Typography variant="subtitle2" sx={{ color: "text.secondary" }}>
            فیلترهای بیشتر
          </Typography>
        </AccordionSummary>
        <AccordionDetails sx={{ pt: 2 }}>
          <Grid container spacing={2}>
            {rangeFilters.map((filter) => (
              <Grid item xs={12} key={filter.id}>
                <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
                  {filter.name} ({filter.unit})
                </Typography>

                {/* Range inputs */}
                <Box
                  sx={{
                    display: "flex",
                    gap: 1,
                    alignItems: "center",
                    position: "relative",
                  }}
                >
                  {/* تا (To) - upper limit */}
                  <Box sx={{ flex: 1, position: "relative" }}>
                    <TextField
                      size="small"
                      placeholder="تا"
                      value={filter.high}
                      onChange={(e) =>
                        handleRangeFilterChange(
                          filter.id,
                          "high",
                          e.target.value
                        )
                      }
                      onFocus={() => setFocusedField(`${filter.id}-high`)}
                      onBlur={(e) => {
                        // Use setTimeout to allow click event to process first
                        setTimeout(() => {
                          // Check if the related target (what was clicked) is inside our suggestions
                          const relatedTarget = e.relatedTarget;
                          const isClickingSuggestion =
                            relatedTarget &&
                            relatedTarget.closest &&
                            relatedTarget.closest("[data-suggestion]");

                          if (!isClickingSuggestion) {
                            setFocusedField(null);
                          }
                        }, 150);
                      }}
                      fullWidth
                      type="number"
                      inputProps={{
                        min: filter.min,
                        max: filter.max,
                        style: { textAlign: "center" },
                        autoComplete: "off",
                        autoCorrect: "off",
                        autoCapitalize: "off",
                        spellCheck: "false",
                      }}
                      autoComplete="off"
                      name={`filter-${filter.id}-high`}
                    />
                    {/* Suggestions for upper limit */}
                    {focusedField === `${filter.id}-high` &&
                      getSuggestions(filter.id).length > 0 && (
                        <Paper
                          sx={{
                            position: "absolute",
                            top: "100%",
                            left: 0,
                            right: 0,
                            zIndex: 10,
                            mt: 0.5,
                            maxHeight: 150,
                            overflow: "auto",
                          }}
                          elevation={3}
                        >
                          {getSuggestions(filter.id).map(
                            (suggestion, index) => (
                              <Box
                                key={index}
                                data-suggestion="true" // Add data attribute for identification
                                sx={{
                                  p: 1,
                                  cursor: "pointer",
                                  borderBottom: "1px solid",
                                  borderColor: "divider",
                                  "&:hover": {
                                    bgcolor: "action.hover",
                                  },
                                  "&:last-child": {
                                    borderBottom: "none",
                                  },
                                }}
                                onClick={() => {
                                  handleSuggestionClick(
                                    filter.id,
                                    "high",
                                    suggestion.value
                                  );
                                }}
                              >
                                <Typography
                                  variant="body2"
                                  sx={{ textAlign: "center" }}
                                >
                                  {suggestion.label}
                                </Typography>
                              </Box>
                            )
                          )}
                        </Paper>
                      )}
                  </Box>

                  <Typography
                    variant="body2"
                    sx={{ minWidth: "30px", textAlign: "center" }}
                  >
                    تا
                  </Typography>

                  {/* از (From) - lower limit */}
                  <Box sx={{ flex: 1, position: "relative" }}>
                    <TextField
                      size="small"
                      placeholder="از"
                      value={filter.low}
                      onChange={(e) =>
                        handleRangeFilterChange(
                          filter.id,
                          "low",
                          e.target.value
                        )
                      }
                      onFocus={() => setFocusedField(`${filter.id}-low`)}
                      onBlur={(e) => {
                        // Use setTimeout to allow click event to process first
                        setTimeout(() => {
                          // Check if the related target (what was clicked) is inside our suggestions
                          const relatedTarget = e.relatedTarget;
                          const isClickingSuggestion =
                            relatedTarget &&
                            relatedTarget.closest &&
                            relatedTarget.closest("[data-suggestion]");

                          if (!isClickingSuggestion) {
                            setFocusedField(null);
                          }
                        }, 150);
                      }}
                      fullWidth
                      type="number"
                      inputProps={{
                        min: filter.min,
                        max: filter.high || filter.max,
                        style: { textAlign: "center" },
                        autoComplete: "off",
                        autoCorrect: "off",
                        autoCapitalize: "off",
                        spellCheck: "false",
                      }}
                      autoComplete="off"
                      name={`filter-${filter.id}-low`}
                    />
                    {/* Suggestions for lower limit */}
                    {focusedField === `${filter.id}-low` &&
                      getSuggestions(filter.id).length > 0 && (
                        <Paper
                          sx={{
                            position: "absolute",
                            top: "100%",
                            left: 0,
                            right: 0,
                            zIndex: 10,
                            mt: 0.5,
                            maxHeight: 150,
                            overflow: "auto",
                          }}
                          elevation={3}
                        >
                          {getSuggestions(filter.id).map(
                            (suggestion, index) => (
                              <Box
                                key={index}
                                data-suggestion="true" // Add data attribute for identification
                                sx={{
                                  p: 1,
                                  cursor: "pointer",
                                  borderBottom: "1px solid",
                                  borderColor: "divider",
                                  "&:hover": {
                                    bgcolor: "action.hover",
                                  },
                                  "&:last-child": {
                                    borderBottom: "none",
                                  },
                                }}
                                onClick={() => {
                                  handleSuggestionClick(
                                    filter.id,
                                    "low",
                                    suggestion.value
                                  );
                                }}
                              >
                                <Typography
                                  variant="body2"
                                  sx={{ textAlign: "center" }}
                                >
                                  {suggestion.label}
                                </Typography>
                              </Box>
                            )
                          )}
                        </Paper>
                      )}
                  </Box>
                </Box>

                {/* Number in words display */}
                {(filter.low !== "" || filter.high !== "") && (
                  <Box
                    sx={{ mt: 1, p: 1, bgcolor: "grey.50", borderRadius: 1 }}
                  >
                    <Typography variant="caption" color="text.secondary">
                      {filter.low !== "" && (
                        <span>
                          از {formatNumber(filter.low)} {filter.unit}{" "}
                        </span>
                      )}
                      {filter.low !== "" && filter.high !== "" && (
                        <span>تا </span>
                      )}
                      {filter.high !== "" && (
                        <span>
                          {formatNumber(filter.high)} {filter.unit}
                        </span>
                      )}
                    </Typography>
                  </Box>
                )}
              </Grid>
            ))}
          </Grid>
        </AccordionDetails>
      </Accordion>
    </Box>
  );

  return (
    <>
      {/* Apply margin to body/content when filter is open on desktop */}
      {!isMobile && isFilterOpen && (
        <style jsx global>{`
          body {
            margin-right: 500px;
            transition: margin-right 0.3s ease-in-out;
          }
        `}</style>
      )}

      {!isMobile && !isFilterOpen && (
        <style jsx global>{`
          body {
            margin-right: 0;
            transition: margin-right 0.3s ease-in-out;
          }
        `}</style>
      )}

      {/* Filter & Sort Buttons */}
      <Box
        sx={{
          position: "fixed",
          top: 80,
          right: 16,
          zIndex: 100,
          display: "flex",
          flexDirection: "column",
          gap: 1,
        }}
      >
        <Button
          onClick={() => openFilter()}
          variant="contained"
          sx={{ width: 56, height: 56, borderRadius: "50%" }}
        >
          <Tune sx={{ fontSize: 24 }} />
        </Button>
      </Box>

      {/* Sort Menu */}
      <Menu
        anchorEl={sortAnchorEl}
        open={Boolean(sortAnchorEl)}
        onClose={() => setSortAnchorEl(null)}
      >
        <MenuItem
          onClick={() => handleSortChange("newest")}
          selected={sortBy === "newest"}
        >
          جدیدترین
        </MenuItem>
        <MenuItem
          onClick={() => handleSortChange("oldest")}
          selected={sortBy === "oldest"}
        >
          قدیمی ترین
        </MenuItem>
        <MenuItem
          onClick={() => handleSortChange("most_viewed")}
          selected={sortBy === "most_viewed"}
        >
          پر بازدید ترین
        </MenuItem>
      </Menu>

      {/* Filter Panel */}
      <Box
        sx={{
          position: "fixed",
          top: 0,
          right: isFilterOpen ? 0 : -500,
          width: isMobile ? "100%" : 500,
          height: "100vh",
          bgcolor: "background.paper",
          boxShadow: 3,
          borderLeft: "1px solid",
          borderColor: "divider",
          transition: "right 0.3s ease-in-out",
          zIndex: 1200,
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Header */}
        <Box
          sx={{
            bgcolor: "primary.main",
            color: "white",
            p: 2,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Button
            onClick={() =>
              filterLevel === "base" ? closeFilter() : setFilterLevel("base")
            }
            color="inherit"
          >
            {filterLevel === "base" ? <Close /> : <ArrowBack />}
          </Button>
          <Typography variant="h6">فیلترها</Typography>
          <Button onClick={handleResetAll} color="inherit" size="small">
            حذف همه
          </Button>
        </Box>

        {/* Selected Filters */}
        {renderSelectedFilters()}

        {/* Content */}
        <Box sx={{ flex: 1, overflow: "auto" }}>
          {filterLevel === "category" ? (
            <Box sx={{ p: 2 }}>
              {loading ? (
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    p: 4,
                  }}
                >
                  <CircularProgress size={40} sx={{ mb: 2 }} />
                  <Typography variant="body2" color="text.secondary">
                    Loading categories...
                  </Typography>
                </Box>
              ) : categories.length === 0 ? (
                <Typography
                  sx={{ textAlign: "center", p: 3 }}
                  color="text.secondary"
                >
                  No categories available
                </Typography>
              ) : (
                <Grid container spacing={2}>
                  {categories.map((category) => (
                    <Grid item xs={6} key={category.id}>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          p: 2,
                          cursor: "pointer",
                          border: "1px solid",
                          borderColor:
                            selectedCategory?.id === category.id
                              ? "primary.main"
                              : "grey.300",
                          borderRadius: 1,
                          bgcolor:
                            selectedCategory?.id === category.id
                              ? "primary.light"
                              : "white",
                          "&:hover": {
                            bgcolor:
                              selectedCategory?.id === category.id
                                ? "primary.light"
                                : "grey.50",
                            borderColor:
                              selectedCategory?.id === category.id
                                ? "primary.main"
                                : "grey.400",
                          },
                          transition: "all 0.2s ease-in-out",
                          height: "100%",
                          minHeight: "80px",
                        }}
                        onClick={() => handleCategorySelect(category)}
                      >
                        {selectedCategory?.id === category.id ? (
                          <RadioButtonChecked color="primary" sx={{ ml: 1 }} />
                        ) : (
                          <RadioButtonUnchecked
                            sx={{ ml: 1, color: "grey.500" }}
                          />
                        )}
                        <Typography
                          sx={{
                            ml: 2,
                            fontWeight: 500,
                            textAlign: "right",
                            flex: 1,
                          }}
                        >
                          {category.name}
                        </Typography>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              )}
            </Box>
          ) : filterLevel === "region" ? (
            <Box sx={{ p: 2 }}>
              {loading ? (
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    p: 4,
                  }}
                >
                  <CircularProgress size={40} sx={{ mb: 2 }} />
                  <Typography variant="body2" color="text.secondary">
                    Loading neighborhoods...
                  </Typography>
                </Box>
              ) : neighborhoods.length === 0 ? (
                <Typography
                  sx={{ textAlign: "center", p: 3 }}
                  color="text.secondary"
                >
                  No neighborhoods available
                </Typography>
              ) : (
                <Grid container spacing={1}>
                  {neighborhoods.map((neighborhood) => (
                    <Grid item xs={12} md={6} key={neighborhood.id}>
                      <Button
                        variant={
                          selectedNeighborhoods.some(
                            (n) => n.id === neighborhood.id
                          )
                            ? "contained"
                            : "outlined"
                        }
                        fullWidth
                        startIcon={
                          selectedNeighborhoods.some(
                            (n) => n.id === neighborhood.id
                          ) ? (
                            <CheckBox />
                          ) : (
                            <CheckBoxOutlineBlank />
                          )
                        }
                        onClick={() => handleNeighborhoodToggle(neighborhood)}
                        sx={{ justifyContent: "flex-start" }}
                      >
                        {neighborhood.name}
                      </Button>
                    </Grid>
                  ))}
                </Grid>
              )}
            </Box>
          ) : (
            <Box sx={{ p: 2 }}>
              {/* Sort Button */}
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 2,
                }}
              >
                <Button
                  onClick={(e) => setSortAnchorEl(e.currentTarget)}
                  variant="outlined"
                  size="small"
                  startIcon={<Sort />}
                >
                  {getSortDisplayText()}
                </Button>
                <span>مرتب‌سازی</span>
              </Box>
              <Divider />

              {/* Category Selection */}
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  my: 2,
                }}
              >
                <Button
                  onClick={() => setFilterLevel("category")}
                  variant="outlined"
                  size="small"
                >
                  {selectedCategory ? "تغییر" : "انتخاب"}
                </Button>
                <span>
                  {selectedCategory
                    ? `دسته بندی: ${selectedCategory.name}`
                    : "انتخاب دسته بندی"}
                </span>
              </Box>
              <Divider />

              {/* Neighborhood Selection */}
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  my: 2,
                }}
              >
                <Button
                  onClick={() => setFilterLevel("region")}
                  variant="outlined"
                  size="small"
                >
                  {selectedNeighborhoods.length > 0 ? "تغییر" : "انتخاب"}
                </Button>
                <span>
                  {selectedNeighborhoods.length > 0
                    ? `محلات: ${selectedNeighborhoods
                        .slice(0, 2)
                        .map((n) => n.name)
                        .join("، ")}${
                        selectedNeighborhoods.length > 2 ? "..." : ""
                      }`
                    : "انتخاب محلات"}
                </span>
              </Box>
              <Divider />

              {/* Features Section - Now above range filters */}
              {renderFeatures()}

              {/* Range Filters Section - Now in collapsible accordion */}
              {renderRangeFilters()}
            </Box>
          )}
        </Box>

        {/* Footer */}
        {filterLevel === "base" && (
          <Box sx={{ p: 2, borderTop: 1, borderColor: "divider" }}>
            <Button
              variant="contained"
              fullWidth
              onClick={() => closeFilter()}
            >
              نمایش {applyFilters().length} آگهی
            </Button>
          </Box>
        )}
      </Box>

      {/* Overlay for mobile */}
      {isFilterOpen && isMobile && (
        <Box
          sx={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            bgcolor: "rgba(0, 0, 0, 0.5)",
            zIndex: 1199,
          }}
          onClick={() => closeFilter()}
        />
      )}
    </>
  );
};

export default WorkerFilter;
