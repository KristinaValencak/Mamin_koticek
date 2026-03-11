import { Box, InputGroup, InputLeftElement, Input } from "@chakra-ui/react";
import { SearchIcon } from "@chakra-ui/icons";

export const SearchInput = ({ value, onChange, placeholder = "Išči...", display }) => (
  <InputGroup size="md" className="forum-search-input-wrapper" display={display} id={display?.base === "block" ? "mobile-search-input" : undefined} w={display?.base === "none" ? "100%" : undefined}>
    <InputLeftElement pointerEvents="none" h={display?.base === "none" ? "100%" : undefined}>
      <SearchIcon color="gray.400" boxSize={display?.base === "none" ? 4 : undefined} />
    </InputLeftElement>
    <Input placeholder={placeholder} value={value} onChange={(e) => onChange(e.target.value)} bg={display?.base === "block" ? "linear-gradient(145deg, #f9fafb 0%, #ffffff 100%)" : undefined} borderColor={display?.base === "block" ? "rgba(236, 95, 140, 0.15)" : undefined} borderRadius={display?.base === "block" ? "16px" : undefined} borderWidth={display?.base === "block" ? "2px" : undefined} transition={display?.base === "block" ? "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)" : undefined} _hover={display?.base === "block" ? { borderColor: "rgba(236, 95, 140, 0.3)", bg: "white", transform: "translateY(-1px)" } : undefined} _focus={display?.base === "block" ? { borderColor: "#EC5F8C", boxShadow: "0 0 0 4px rgba(236, 95, 140, 0.12)", bg: "white" } : undefined} h={display?.base === "none" ? "38px" : undefined} pl={display?.base === "none" ? 10 : undefined} fontSize={display?.base === "none" ? "sm" : undefined} />
  </InputGroup>
);
