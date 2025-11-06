import React, { useState, useEffect } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import {
  Box,
  Button,
  Grid,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Slider,
  Divider,
  AppBar,
  Modal,
  Typography,
  Chip,
  Stack,
  Menu,
  MenuItem,
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

const WorkerFilter = ({
  workers = [],
  onFilteredWorkersChange,
  initialCategory = null,
  onCategoryChange = null,
  enableLocalCategoryFilter = false,
  availableCategories = [],
  initialNeighborhood = null,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedNeighborhoods, setSelectedNeighborhoods] = useState([]);
  const [selectedTickFields, setSelectedTickFields] = useState([]);
  const [localNormalFields, setLocalNormalFields] = useState([]);
  const [filterLevel, setFilterLevel] = useState("base");
  const [sortAnchorEl, setSortAnchorEl] = useState(null);
  const [sortBy, setSortBy] = useState("newest");
  const [result, setResult] = useState([]);

  const [subcategories, setSubcategories] = useState([]);
  const [neighborhoods, setNeighborhoods] = useState([]);
  const [tickFields, setTickFields] = useState([
    { id: 1, name: "پارکینگ", value: "پارکینگ", kind: 2, special: 1 },
    { id: 2, name: "آسانسور", value: "آسانسور", kind: 2, special: 1 },
    { id: 3, name: "انباری", value: "انباری", kind: 2, special: 1 },
  ]);

  const displayCategories = enableLocalCategoryFilter
    ? availableCategories
    : subcategories;

  useEffect(() => {
    if (initialNeighborhood) {
      setSelectedNeighborhoods([initialNeighborhood]);
    }
  }, [initialNeighborhood]);

  useEffect(() => {
    if (initialCategory) {
      setSelectedCategory(initialCategory);
    }
  }, [initialCategory]);
  useEffect(() => {
    if (initialCategory) {
      setSelectedCategory(initialCategory);
    }
  }, [initialCategory]);

  useEffect(() => {
    const fetchOptionalData = async () => {
      try {
        var token = Cookies.get("id_token");
        const response = await axios({
          method: "get",
          url: "https://api.ajur.app/api/get-department",
          params: { token: token },
        });

        setSubcategories(response.data.subcategories || []);
        setNeighborhoods(response.data.neighborhoods || []);
        setResult(response.data);
      } catch (error) {
        console.error("Error fetching optional filter data:", error);
      }
    };

    if (!enableLocalCategoryFilter) {
      fetchOptionalData();
    }
  }, [enableLocalCategoryFilter]);

  useEffect(() => {
    const fetchCategoryFields = async () => {
      if (selectedCategory?.id) {
        try {
          const response = await axios({
            method: "get",
            url: "https://api.ajur.app/api/category-fields",
            params: { cat: selectedCategory.id },
          });

          const fieldsWithDefaults = (response.data.normal_fields || []).map(
            (field) => ({
              ...field,
              low: parseInt(field.min_range) || 0,
              high: parseInt(field.max_range) || 100,
            })
          );

          setLocalNormalFields(fieldsWithDefaults);
        } catch (error) {
          console.error("Error fetching category fields:", error);
          setLocalNormalFields([]);
        }
      } else {
        setLocalNormalFields([]);
      }
    };

    fetchCategoryFields();
  }, [selectedCategory]);

  useEffect(() => {
    console.log("🔍 useEffect triggered - applying filters and sorting");
    console.log("📊 Total workers:", workers.length);
    console.log("🎯 Current sort:", sortBy);

    const filtered = applyAllFilters(workers);
    console.log("✅ After filtering:", filtered.length);
    const sorted = applySorting(filtered);
    console.log("🔄 After sorting:", sorted.length);

    onFilteredWorkersChange(sorted);
  }, [
    workers,
    selectedCategory,
    selectedNeighborhoods,
    selectedTickFields,
    localNormalFields,
    sortBy,
  ]);

  const applyAllFilters = (workersToFilter) => {
    const shouldFilterByCategory =
      enableLocalCategoryFilter && selectedCategory;

    if (
      !shouldFilterByCategory &&
      selectedNeighborhoods.length === 0 &&
      selectedTickFields.length === 0 &&
      !hasActiveRangeFilters()
    ) {
      return workersToFilter;
    }

    return workersToFilter.filter((worker) => {
      if (shouldFilterByCategory) {
        const workerCategoryId = parseInt(worker.category_id);
        if (workerCategoryId !== selectedCategory.id) {
          return false;
        }
      }

      if (selectedNeighborhoods.length > 0) {
        const workerNeighborhoodId = parseInt(worker.neighborhood_id);
        if (
          !selectedNeighborhoods.some((nb) => nb.id === workerNeighborhoodId)
        ) {
          return false;
        }
      }

      if (selectedTickFields.length > 0) {
        try {
          const workerProperties = JSON.parse(worker.json_properties || "[]");
          const hasAllTickFields = selectedTickFields.every((tickField) =>
            workerProperties.some(
              (prop) => prop.name === tickField.value && prop.kind === 2
            )
          );
          if (!hasAllTickFields) return false;
        } catch (e) {
          return false;
        }
      }

      return isWorkerInRange(worker);
    });
  };

  const applySorting = (workersToSort) => {
    if (!workersToSort || workersToSort.length === 0) {
      console.log("❌ No workers to sort");
      return workersToSort;
    }

    console.log("🔄 Starting sort with type:", sortBy);
    const workersCopy = [...workersToSort];

    try {
      switch (sortBy) {
        case "newest":
          return workersCopy.sort((a, b) => {
            const dateA = a.updated_at ? new Date(a.updated_at) : new Date(0);
            const dateB = b.updated_at ? new Date(b.updated_at) : new Date(0);
            return dateB.getTime() - dateA.getTime();
          });

        case "oldest":
          return workersCopy.sort((a, b) => {
            const dateA = a.updated_at ? new Date(a.updated_at) : new Date(0);
            const dateB = b.updated_at ? new Date(b.updated_at) : new Date(0);
            return dateA.getTime() - dateB.getTime();
          });

        case "most_viewed":
          return workersCopy.sort((a, b) => {
            const viewsA = parseInt(a.total_view) || 0;
            const viewsB = parseInt(b.total_view) || 0;
            return viewsB - viewsA;
          });

        default:
          return workersCopy;
      }
    } catch (error) {
      console.error("❌ Error in sorting:", error);
      return workersCopy;
    }
  };

  const hasActiveRangeFilters = () => {
    return localNormalFields.some(
      (field) =>
        field.special == 1 &&
        (field.low !== parseInt(field.min_range) ||
          field.high !== parseInt(field.max_range))
    );
  };

  const hasActiveFilters = () => {
    const hasCategoryFilter = enableLocalCategoryFilter && selectedCategory;

    return (
      hasCategoryFilter ||
      selectedNeighborhoods.length > 0 ||
      selectedTickFields.length > 0 ||
      hasActiveRangeFilters() ||
      sortBy !== "newest"
    );
  };

  const isWorkerInRange = (worker) => {
    try {
      const workerProperties = JSON.parse(worker.json_properties || "[]");
      const specialProperties = workerProperties.filter(
        (prop) => prop.special == 1
      );

      return localNormalFields.every((field) => {
        if (field.special != 1) return true;

        const workerProp = specialProperties.find(
          (prop) => prop.name == field.value
        );
        if (!workerProp) return false;

        const lower = field.low;
        const higher = field.high;

        return workerProp.value >= lower && workerProp.value <= higher;
      });
    } catch (e) {
      return false;
    }
  };

  const handleCategorySelect = (category) => {
    if (selectedCategory?.id === category.id) {
      setFilterLevel("base");
      return;
    }

    if (enableLocalCategoryFilter) {
      setSelectedCategory(category);
    } else {
      if (onCategoryChange) {
        onCategoryChange(category);
      }
    }

    setFilterLevel("base");
  };

  const handleNeighborhoodToggle = (neighborhood) => {
    setSelectedNeighborhoods((prev) =>
      prev.some((n) => n.id === neighborhood.id)
        ? prev.filter((n) => n.id !== neighborhood.id)
        : [...prev, neighborhood]
    );
  };

  const handleTickFieldToggle = (field) => {
    setSelectedTickFields((prev) =>
      prev.some((f) => f.value === field.value)
        ? prev.filter((f) => f.value !== field.value)
        : [...prev, field]
    );
  };

  const handleSliderChange = (event, newValue, activeThumb, field) => {
    if (!Array.isArray(newValue)) return;

    const minDistance = calculateMinDistance(field);
    let [low, high] = newValue;

    if (activeThumb === 0) {
      low = Math.min(low, high - minDistance);
      low = Math.max(low, parseInt(field.min_range));
    } else {
      high = Math.max(high, low + minDistance);
      high = Math.min(high, parseInt(field.max_range));
    }

    setLocalNormalFields((prev) =>
      prev.map((f) =>
        f.id === field.id
          ? {
              ...f,
              low: low,
              high: high,
            }
          : f
      )
    );
  };

  const calculateMinDistance = (field) => {
    const minRange = parseInt(field.min_range) || 0;
    const maxRange = parseInt(field.max_range) || 100;
    const totalRange = maxRange - minRange;
    const minDistance = Math.max(1, Math.floor(totalRange * 0.02));
    return minDistance;
  };

  const handleDeleteFilter = (field) => {
    setLocalNormalFields((prev) =>
      prev.map((f) =>
        f.id === field.id
          ? {
              ...f,
              low: parseInt(f.min_range) || 0,
              high: parseInt(field.max_range) || 100,
            }
          : f
      )
    );
  };

  const handleResetAll = () => {
    setSelectedNeighborhoods([]);
    setSelectedTickFields([]);

    setLocalNormalFields((prev) =>
      prev.map((field) => ({
        ...field,
        low: parseInt(field.min_range) || 0,
        high: parseInt(field.max_range) || 100,
      }))
    );

    setSortBy("newest");

    if (!enableLocalCategoryFilter && selectedCategory && onCategoryChange) {
      onCategoryChange(null);
    } else if (enableLocalCategoryFilter) {
      setSelectedCategory(null);
    }
  };

  const handleSortClick = (event) => {
    setSortAnchorEl(event.currentTarget);
  };

  const handleSortClose = () => {
    setSortAnchorEl(null);
  };

  const handleSortSelect = (sortType) => {
    console.log("🎯 Sort selected:", sortType);
    setSortBy(sortType);
    handleSortClose();
  };

  const removeCategoryFilter = () => {
    if (!enableLocalCategoryFilter) {
      setIsOpen(true);
      setFilterLevel("category");
    }

    if (!enableLocalCategoryFilter && onCategoryChange) {
      onCategoryChange(null);
    } else {
      setSelectedCategory(null);
    }
  };

  const removeNeighborhoodFilter = (neighborhoodId) => {
    setSelectedNeighborhoods((prev) =>
      prev.filter((n) => n.id !== neighborhoodId)
    );
  };

  const removeTickFieldFilter = (fieldValue) => {
    setSelectedTickFields((prev) => prev.filter((f) => f.value !== fieldValue));
  };

  const removeRangeFilter = (fieldId) => {
    setLocalNormalFields((prev) =>
      prev.map((f) =>
        f.id === fieldId
          ? {
              ...f,
              low: parseInt(f.min_range) || 0,
              high: parseInt(field.max_range) || 100,
            }
          : f
      )
    );
  };

  const handleBackClick = () => {
    if (filterLevel === "base") {
      setIsOpen(false);
    } else {
      setFilterLevel("base");
    }
  };

  const numFormatter = (num) => {
    if (num >= 1000000000) {
      return (num / 1000000000).toFixed(0) + " میلیارد";
    } else if (num >= 1000000) {
      return (num / 1000000).toFixed(0) + " میلیون";
    } else if (num > 999) {
      return (num / 1000).toFixed(0) + " هزار";
    } else {
      return num.toString();
    }
  };

  const getSortDisplayText = () => {
    switch (sortBy) {
      case "newest":
        return "جدیدترین";
      case "oldest":
        return "قدیمی ترین";
      case "most_viewed":
        return "پر بازدید ترین";
      default:
        return "مرتب‌سازی";
    }
  };

  const isFieldAtDefault = (field) => {
    return (
      field.low === parseInt(field.min_range) &&
      field.high === parseInt(field.max_range)
    );
  };

  const renderSelectedFilterTags = () => {
    const hasActiveFilters =
      selectedCategory ||
      selectedNeighborhoods.length > 0 ||
      selectedTickFields.length > 0 ||
      hasActiveRangeFilters() ||
      sortBy !== "newest";

    if (!hasActiveFilters) return null;

    return (
      <Box
        sx={{
          mt: 2,
          p: 2,
          border: "1px solid",
          borderColor: "grey.300",
          borderRadius: 2,
          bgcolor: "grey.50",
        }}
      >
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          {selectedCategory && (
            <Chip
              label={`دسته‌بندی: ${selectedCategory.name}`}
              onDelete={removeCategoryFilter}
              color="primary"
              variant="outlined"
              size="small"
            />
          )}

          {selectedNeighborhoods.map((neighborhood) => (
            <Chip
              key={neighborhood.id}
              label={`محله: ${neighborhood.name}`}
              onDelete={() => removeNeighborhoodFilter(neighborhood.id)}
              color="secondary"
              variant="outlined"
              size="small"
            />
          ))}

          {selectedTickFields.map((field) => (
            <Chip
              key={field.value}
              label={`دارای ${field.value}`}
              onDelete={() => removeTickFieldFilter(field.value)}
              color="success"
              variant="outlined"
              size="small"
            />
          ))}

          {localNormalFields
            .filter((field) => field.special == 1 && !isFieldAtDefault(field))
            .map((field) => (
              <Chip
                key={field.id}
                label={`${field.value}: ${numFormatter(
                  field.low
                )} - ${numFormatter(field.high)}`}
                onDelete={() => removeRangeFilter(field.id)}
                color="warning"
                variant="outlined"
                size="small"
              />
            ))}

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

  const renderTickFields = () => {
    if (tickFields.length === 0) return null;

    return (
      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle2" sx={{ mb: 2, color: "text.secondary" }}>
          امکانات:
        </Typography>

        <Grid container spacing={1}>
          {tickFields.map((field) => {
            const isSelected = selectedTickFields.some(
              (f) => f.value === field.value
            );

            return (
              <Grid item xs={12} key={field.id || field.value}>
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
                    transition: "all 0.2s ease",
                    "&:hover": {
                      borderColor: "primary.main",
                      bgcolor: isSelected ? "primary.light" : "grey.50",
                    },
                  }}
                  onClick={() => handleTickFieldToggle(field)}
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
                      دارای {field.value}
                    </Typography>
                  </Box>

                  {isSelected && (
                    <Box
                      sx={{
                        width: 6,
                        height: 6,
                        borderRadius: "50%",
                        bgcolor: "primary.main",
                      }}
                    />
                  )}
                </Box>
              </Grid>
            );
          })}
        </Grid>

        {selectedTickFields.length > 0 && (
          <Box sx={{ mt: 1, display: "flex", justifyContent: "flex-end" }}>
            <Button
              size="small"
              onClick={() => setSelectedTickFields([])}
              startIcon={<Delete />}
              color="error"
            >
              پاک کردن امکانات
            </Button>
          </Box>
        )}
      </Box>
    );
  };

  const renderBaseLevel = () => (
    <Box sx={{ p: 2 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        <Button
          onClick={handleSortClick}
          variant="outlined"
          size="small"
          startIcon={<Sort />}
        >
          {getSortDisplayText()}
        </Button>
        <span>مرتب‌سازی</span>
      </Box>
      <Divider />

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
                .join("، ")}${selectedNeighborhoods.length > 2 ? "..." : ""}`
            : "انتخاب محلات"}
        </span>
      </Box>
      <Divider />

      {renderTickFields()}

      {localNormalFields
        .filter((field) => field.special == 1)
        .map((field) => (
          <Accordion key={field.id} sx={{ mt: 1 }}>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Box sx={{ width: "100%", textAlign: "right" }}>
                {!isFieldAtDefault(field) && (
                  <Button
                    variant="outlined"
                    size="small"
                    color="error"
                    startIcon={<Delete />}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteFilter(field);
                    }}
                    sx={{ mr: 1 }}
                  >
                    حذف
                  </Button>
                )}
                <span>{field.value}</span>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <Slider
                value={[field.low, field.high]}
                onChange={(e, newValue, activeThumb) =>
                  handleSliderChange(e, newValue, activeThumb, field)
                }
                valueLabelFormat={numFormatter}
                valueLabelDisplay="auto"
                min={parseInt(field.min_range)}
                max={parseInt(field.max_range)}
                disableSwap
              />
            </AccordionDetails>
          </Accordion>
        ))}
    </Box>
  );

  const renderCategoryLevel = () => (
    <Box sx={{ p: 2 }}>
      <Grid container spacing={1}>
        {displayCategories.map((category) => (
          <Grid item xs={12} key={category.id}>
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
              }}
              onClick={() => handleCategorySelect(category)}
            >
              {selectedCategory?.id === category.id ? (
                <RadioButtonChecked color="primary" sx={{ ml: 1 }} />
              ) : (
                <RadioButtonUnchecked sx={{ ml: 1 }} />
              )}
              <span>{category.name}</span>
            </Box>
          </Grid>
        ))}
      </Grid>
    </Box>
  );

  const renderRegionLevel = () => (
    <Box sx={{ p: 2 }}>
      <Grid container spacing={1}>
        {neighborhoods.map((neighborhood) => (
          <Grid item xs={12} md={6} key={neighborhood.id}>
            <Button
              variant={
                selectedNeighborhoods.some((n) => n.id === neighborhood.id)
                  ? "contained"
                  : "outlined"
              }
              fullWidth
              startIcon={
                selectedNeighborhoods.some((n) => n.id === neighborhood.id) ? (
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
    </Box>
  );

  const renderFilterContent = () => {
    switch (filterLevel) {
      case "category":
        return renderCategoryLevel();
      case "region":
        return renderRegionLevel();
      default:
        return renderBaseLevel();
    }
  };

  const getFilterTitle = () => {
    const titles = {
      base: "فیلترها",
      category: "انتخاب دسته بندی",
      region: "انتخاب محلات",
    };
    return titles[filterLevel];
  };

  const getHeaderButtonIcon = () => {
    return filterLevel === "base" ? <Close /> : <ArrowBack />;
  };

  return (
    <>
      {/* Filter Trigger Button with fixed z-index */}
      <Box
        sx={{
          display: "flex",
          gap: 1,
          mb: 2,
          position: "sticky",
          top: 0,
          backgroundColor: "background.paper",
          py: 1,
          borderBottom: "1px solid",
          borderColor: "grey.300",
        }}
      >
        <Button
          onClick={() => setIsOpen(true)}
          variant="contained"
          startIcon={<Tune />}
          size="medium"
          sx={{ flex: 2 }}
        >
          فیلترها
        </Button>

        <Button
          onClick={handleSortClick}
          variant="outlined"
          startIcon={<Sort />}
          size="medium"
          sx={{ flex: 1 }}
        >
          {getSortDisplayText()}
        </Button>

        <Menu
          anchorEl={sortAnchorEl}
          open={Boolean(sortAnchorEl)}
          onClose={handleSortClose}
        >
          <MenuItem
            onClick={() => handleSortSelect("newest")}
            selected={sortBy === "newest"}
          >
            جدیدترین
          </MenuItem>
          <MenuItem
            onClick={() => handleSortSelect("oldest")}
            selected={sortBy === "oldest"}
          >
            قدیمی ترین
          </MenuItem>
        </Menu>
      </Box>

      {/* Selected Filter Tags with fixed z-index */}
      {renderSelectedFilterTags() && (
        <Box
          sx={{
            position: "sticky",
            top: 60,
            zIndex: 30,
            backgroundColor: "grey.50",
          }}
        >
          {renderSelectedFilterTags()}
        </Box>
      )}

      {/* Filter Modal */}
      <Modal open={isOpen} onClose={() => setIsOpen(false)}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: { xs: "95%", sm: 500 },
            maxHeight: "80vh",
            bgcolor: "background.paper",
            borderRadius: 2,
            boxShadow: 24,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <AppBar position="static" color="primary">
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                p: 2,
              }}
            >
              <Button onClick={handleBackClick} color="inherit">
                {getHeaderButtonIcon()}
              </Button>

              <strong>{getFilterTitle()}</strong>

              <Button onClick={handleResetAll} color="inherit" size="small">
                حذف همه
              </Button>
            </Box>
          </AppBar>

          <Box sx={{ flex: 1, overflow: "auto" }}>{renderFilterContent()}</Box>

          {filterLevel === "base" && (
            <Box sx={{ p: 2, borderTop: 1, borderColor: "divider" }}>
              <Button
                variant="contained"
                fullWidth
                onClick={() => setIsOpen(false)}
              >
                نمایش {applyAllFilters(workers).length} آگهی
              </Button>
            </Box>
          )}
        </Box>
      </Modal>
    </>
  );
};

export default WorkerFilter;
