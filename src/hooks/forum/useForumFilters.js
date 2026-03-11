import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";

export const useForumFilters = (categories) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [view, setView] = useState("latest");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const cat = searchParams.get("cat");
    const v = searchParams.get("view") || "latest";
    const search = searchParams.get("search");
    setView(v);
    if (search) setSearchQuery(decodeURIComponent(search));
    else setSearchQuery("");
    if (!cat) {
      setSelectedCategory(null);
      return;
    }
    const foundCat = categories.find(c => c.slug === cat);
    if (foundCat) setSelectedCategory(foundCat);
    else setSelectedCategory({ slug: cat, name: cat, id: null });
  }, [searchParams, categories]);

  const handleSelectCategory = (cat) => {
    setSelectedCategory(cat);
    setView("latest");
    setSearchParams({ cat: cat.slug, view: "latest" });
  };

  const goLatest = () => {
    setSelectedCategory(null);
    setView("latest");
    setSearchParams({ view: "latest" });
  };

  const goTop = () => {
    setSelectedCategory(null);
    setView("top");
    setSearchParams({ view: "top" });
  };

  const selectedPostId = searchParams.get("post");

  return { selectedCategory, view, searchQuery, setSearchQuery, handleSelectCategory, goLatest, goTop, selectedPostId, searchParams, setSearchParams };
};
