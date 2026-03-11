import { Box, VStack, IconButton } from "@chakra-ui/react";
import { AddIcon } from "@chakra-ui/icons";
import { FaRobot } from "react-icons/fa";

export const FloatingButtons = ({ onNewPost, onAIChat, show }) => {
  if (!show) return null;
  return (
    <Box position="fixed" bottom="2rem" right="2rem" zIndex={999}>
      <VStack spacing={3} align="stretch">
        <IconButton icon={<FaRobot />} aria-label="AI Asistent" size="lg" bg="linear-gradient(135deg, #667eea 0%, #764ba2 100%)" color="white" borderRadius="full" boxShadow="0 4px 12px rgba(102, 126, 234, 0.4)" _hover={{ bg: "linear-gradient(135deg, #764ba2 0%, #667eea 100%)", transform: "scale(1.1)", boxShadow: "0 6px 20px rgba(102, 126, 234, 0.5)" }} _active={{ transform: "scale(0.95)" }} transition="all 0.2s" onClick={onAIChat} title="AI Asistent - Vprašajte za nasvete" />
        <IconButton icon={<AddIcon />} aria-label="Nova objava" size="lg" bg="#EC5F8C" color="white" borderRadius="full" boxShadow="0 4px 12px rgba(236, 95, 140, 0.4)" _hover={{ bg: "#D94B8C", transform: "scale(1.1)", boxShadow: "0 6px 20px rgba(236, 95, 140, 0.5)" }} _active={{ transform: "scale(0.95)" }} transition="all 0.2s" onClick={onNewPost} title="Nova objava" />
      </VStack>
    </Box>
  );
};
