import { Box, HStack, Button, VStack } from "@chakra-ui/react";
import Categories from "../FORUM/Categories/Categories";
import { API_BASE } from "../../api/config";

export const ForumSidebar = ({ selectedCategory, view, onSelectCategory, onGoLatest, onGoTop, categories }) => (
    <VStack align="stretch" spacing={4}>
        <Box h="40px" display="flex" alignItems="center">
            <HStack spacing={0} pl={6}>
                <Button onClick={onGoLatest} size="sm" variant="ghost" fontWeight="600" fontSize="sm" color={!selectedCategory && view === "latest" ? "#EC5F8C" : "gray.600"} borderBottom={!selectedCategory && view === "latest" ? "2px solid" : "2px solid transparent"} borderColor="#EC5F8C" borderRadius="0" _hover={{ color: "#EC5F8C", bg: "transparent" }} px={4}>Vse objave</Button>
                <Button onClick={onGoTop} size="sm" variant="ghost" fontWeight="600" fontSize="sm" color={!selectedCategory && view === "top" ? "#EC5F8C" : "gray.600"} borderBottom={!selectedCategory && view === "top" ? "2px solid" : "2px solid transparent"} borderColor="#EC5F8C" borderRadius="0" _hover={{ color: "#EC5F8C", bg: "transparent" }} px={4}>Top objave</Button>
            </HStack>
        </Box>
        <Categories apiBase={API_BASE} onSelect={onSelectCategory} selectedCategory={selectedCategory} />
    </VStack>
);
