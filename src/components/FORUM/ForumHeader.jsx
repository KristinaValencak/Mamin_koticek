import { Box, HStack, Heading, IconButton } from "@chakra-ui/react";
import { ArrowBackIcon } from "@chakra-ui/icons";

export const ForumHeader = ({ selectedPostId, selectedCategory, selectedPostTitle, onClose }) => (
  <Box h="40px" display="flex" alignItems="center" justifyContent="center">
    {selectedPostId ? (
      <HStack spacing={3}>
        <IconButton icon={<ArrowBackIcon />} onClick={onClose} size="sm" variant="ghost" aria-label="Nazaj na seznam" color="gray.600" _hover={{ color: "#EC5F8C", bg: "gray.50" }} />
        <Heading fontSize="xl" fontWeight="700" color="gray.800">{selectedCategory ? `${selectedCategory.name || selectedCategory.slug} - ${selectedPostTitle || "..."}` : selectedPostTitle || "..."}</Heading>
      </HStack>
    ) : (
      selectedCategory && <Heading fontSize="xl" fontWeight="700" color="gray.800">{selectedCategory.name || selectedCategory.slug}</Heading>
    )}
  </Box>
);
