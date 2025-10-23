// components/WorkerFilter.js
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
} from "@mui/icons-material";

const WorkerFilter = ({ workers = [], onFilteredWorkersChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedNeighborhoods, setSelectedNeighborhoods] = useState([]);
  const [selectedTickFields, setSelectedTickFields] = useState([]);
  const [localNormalFields, setLocalNormalFields] = useState([]);
  const [filterLevel, setFilterLevel] = useState("base");

  // State for filter options from API
  const [subcategories, setSubcategories] = useState([]);
  const [neighborhoods, setNeighborhoods] = useState([]);
  const [tickFields, setTickFields] = useState([
    // Pre-defined tick fields - no loading needed
    { id: 1, name: "پارکینگ", value: "پارکینگ", kind: 2, special: 1 },
    { id: 2, name: "آسانسور", value: "آسانسور", kind: 2, special: 1 },
    { id: 3, name: "انباری", value: "انباری", kind: 2, special: 1 },
  ]);

  // Remove loading state - no API calls needed on mount
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
      } catch (error) {
        console.error("Error fetching optional filter data:", error);
      }
    };

    fetchOptionalData();
  }, []);

  // Fetch category fields when category is selected
  useEffect(() => {
    const fetchCategoryFields = async () => {
      if (selectedCategory?.id) {
        try {
          const response = await axios({
            method: "get",
            url: "https://api.ajur.app/api/category-fields",
            params: { cat: selectedCategory.id },
          });

          setLocalNormalFields(response.data.normal_fields || []);
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

  // Apply filters and notify parent
  useEffect(() => {
    const filtered = applyAllFilters(workers);
    onFilteredWorkersChange(filtered);
  }, [
    workers,
    selectedCategory,
    selectedNeighborhoods,
    selectedTickFields,
    localNormalFields,
  ]);

  const applyAllFilters = (workersToFilter) => {
    if (
      !selectedCategory &&
      selectedNeighborhoods.length === 0 &&
      selectedTickFields.length === 0 &&
      !hasActiveRangeFilters()
    ) {
      return workersToFilter;
    }

    return workersToFilter.filter((worker) => {
      // Category filter
      if (selectedCategory && worker.category_id != selectedCategory.id) {
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

      // Tick fields filter
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

      // Normal fields range filter
      return isWorkerInRange(worker);
    });
  };

  const hasActiveRangeFilters = () => {
    return localNormalFields.some(
      (field) => field.special == 1 && (field.low > 0 || field.high > 0)
    );
  };

  const isWorkerInRange = (worker) => {
    try {
      const workerProperties = JSON.parse(worker.json_properties || "[]");
      const specialProperties = workerProperties.filter(
        (prop) => prop.special == 1
      );

      return localNormalFields.every((field) => {
        if (field.special != 1 || (field.low === 0 && field.high === 0))
          return true;

        const workerProp = specialProperties.find(
          (prop) => prop.name == field.value
        );
        if (!workerProp) return false;

        const lower =
          field.low > 0 ? parseInt(field.low) : parseInt(field.min_range);
        const higher =
          field.high > 0 ? parseInt(field.high) : parseInt(field.max_range);

        return workerProp.value >= lower && workerProp.value <= higher;
      });
    } catch (e) {
      return false;
    }
  };

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
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
    setLocalNormalFields((prev) =>
      prev.map((f) =>
        f.id === field.id
          ? {
              ...f,
              low: activeThumb === 0 ? newValue[0] : f.low,
              high: activeThumb === 1 ? newValue[1] : f.high,
            }
          : f
      )
    );
  };

  const handleDeleteFilter = (field) => {
    setLocalNormalFields((prev) =>
      prev.map((f) => (f.id === field.id ? { ...f, low: 0, high: 0 } : f))
    );
  };

  const handleResetAll = () => {
    setSelectedCategory(null);
    setSelectedNeighborhoods([]);
    setSelectedTickFields([]);
    setLocalNormalFields([]);
  };

  // Remove individual filters
  const removeCategoryFilter = () => {
    setSelectedCategory(null);
  };

  const removeNeighborhoodFilter = (neighborhoodId) => {
    setSelectedNeighborhoods((prev) =>
      prev.filter((n) => n.id !== neighborhoodId)
    );
  };

  const removeTickFieldFilter = (fieldValue) => {
    setSelectedTickFields((prev) =>
      prev.filter((f) => f.value !== fieldValue)
    );
  };

  const removeRangeFilter = (fieldId) => {
    setLocalNormalFields((prev) =>
      prev.map((f) => (f.id === fieldId ? { ...f, low: 0, high: 0 } : f))
    );
  };

  // Handle back button click
  const handleBackClick = () => {
    if (filterLevel === "base") {
      setIsOpen(false);
    } else {
      setFilterLevel("base");
    }
  };

  // Fixed numFormatter function
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

  // Render selected filter tags (OUTSIDE the modal)
  const renderSelectedFilterTags = () => {
    const hasActiveFilters =
      selectedCategory ||
      selectedNeighborhoods.length > 0 ||
      selectedTickFields.length > 0 ||
      hasActiveRangeFilters();

    if (!hasActiveFilters) return null;

    return (
      <Box sx={{ mt: 2, p: 2, border: "1px solid", borderColor: "grey.300", borderRadius: 2, bgcolor: "grey.50" }}>
        <Typography variant="subtitle2" sx={{ mb: 1, color: "text.secondary" }}>
          فیلترهای فعال:
        </Typography>
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          {/* Category Tag */}
          {selectedCategory && (
            <Chip
              label={`دسته‌بندی: ${selectedCategory.name}`}
              onDelete={removeCategoryFilter}
              color="primary"
              variant="outlined"
              size="small"
            />
          )}

          {/* Neighborhood Tags */}
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

          {/* Tick Field Tags */}
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

          {/* Range Filter Tags */}
          {localNormalFields
            .filter(
              (field) =>
                field.special == 1 && (field.low > 0 || field.high > 0)
            )
            .map((field) => (
              <Chip
                key={field.id}
                label={`${field.value}: ${numFormatter(
                  field.low || parseInt(field.min_range)
                )} - ${numFormatter(
                  field.high || parseInt(field.max_range)
                )}`}
                onDelete={() => removeRangeFilter(field.id)}
                color="warning"
                variant="outlined"
                size="small"
              />
            ))}

          {/* Clear All Button */}
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

  // Enhanced Tick Fields rendering with better styling
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

        {/* Reset tick fields button */}
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

  // Render methods
  const renderBaseLevel = () => (
    <Box sx={{ p: 2 }}>
      {/* Category Selection */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
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
                .join("، ")}${selectedNeighborhoods.length > 2 ? "..." : ""}`
            : "انتخاب محلات"}
        </span>
      </Box>
      <Divider />

      {/* Tick Fields - The three specific options */}
      {renderTickFields()}

      {/* Normal Fields */}
      {localNormalFields
        .filter((field) => field.special == 1)
        .map((field) => (
          <Accordion key={field.id} sx={{ mt: 1 }}>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Box sx={{ width: "100%", textAlign: "right" }}>
                {(field.low > 0 || field.high > 0) && (
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
                value={[
                  field.low || parseInt(field.min_range),
                  field.high || parseInt(field.max_range),
                ]}
                onChange={(e, newValue, activeThumb) =>
                  handleSliderChange(e, newValue, activeThumb, field)
                }
                valueLabelFormat={numFormatter}
                valueLabelDisplay="auto"
                min={parseInt(field.min_range)}
                max={parseInt(field.max_range)}
              />
            </AccordionDetails>
          </Accordion>
        ))}
    </Box>
  );

  const renderCategoryLevel = () => (
    <Box sx={{ p: 2 }}>
      <Grid container spacing={1}>
        {subcategories.map((category) => (
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

  // Get the appropriate icon for the header button
  const getHeaderButtonIcon = () => {
    return filterLevel === "base" ? <Close /> : <ArrowBack />;
  };

  return (
    <>
      {/* Filter Trigger Button - No loading state */}
      <Button
        onClick={() => setIsOpen(true)}
        variant="contained"
        startIcon={<Tune />}
        fullWidth
        size="medium"
        sx={{ 
          zIndex: '9999 !important',
          position: 'relative',
        }}
      >
        فیلترها ({applyAllFilters(workers).length})
      </Button>

      {/* Selected Filter Tags - OUTSIDE the modal, beneath the button */}
      {renderSelectedFilterTags()}

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
          {/* Header */}
          <AppBar position="static" color="primary">
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                p: 2,
              }}
            >
              {/* Back/Close Button - Changes based on filter level */}
              <Button onClick={handleBackClick} color="inherit">
                {getHeaderButtonIcon()}
              </Button>
              
              <strong>{getFilterTitle()}</strong>
              
              <Button onClick={handleResetAll} color="inherit" size="small">
                حذف همه
              </Button>
            </Box>
          </AppBar>

          {/* Content */}
          <Box sx={{ flex: 1, overflow: "auto" }}>
            {renderFilterContent()}
          </Box>

          {/* Footer - Only show on base level now */}
          {filterLevel === "base" && (
            <Box sx={{ p: 2, borderTop: 1, borderColor: "divider" }}>
              <Button
                variant="contained"
                fullWidth
                onClick={() => setIsOpen(false)}
              >
                نمایش {applyAllFilters(workers).length} فایل‌ها
              </Button>
            </Box>
          )}
        </Box>
      </Modal>
    </>
  );
};

export default WorkerFilter;