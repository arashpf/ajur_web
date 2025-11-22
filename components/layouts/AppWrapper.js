import React from "react";
import { FilterProvider } from "../contexts/FilterContext";

export default function AppWrapper({ children }) {
  return <FilterProvider>{children}</FilterProvider>;
}
