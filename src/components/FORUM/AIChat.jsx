import { useState, useRef, useEffect } from "react";
import {Box,IconButton,Input,VStack,HStack,Text,Heading,Modal,ModalOverlay,ModalContent,ModalHeader,ModalBody,ModalCloseButton,useDisclosure,Avatar,Spinner,Flex} from "@chakra-ui/react";
import { FaRobot, FaUser, FaPaperPlane } from "react-icons/fa";

const AIChat = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: "assistant",
      content: "Pozdravljeni! Sem vaš AI asistent za materinstvo. Kako vam lahko pomagam danes? 💕"
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current.focus(), 100);
    }
  }, [isOpen]);

  const handleSend = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      role: "user",
      content: inputValue.trim()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    setTimeout(() => {
      const aiResponse = {
        id: Date.now() + 1,
        role: "assistant",
        content: generateAIResponse(userMessage.content)
      };
      setMessages(prev => [...prev, aiResponse]);
      setIsLoading(false);
    }, 1000);
  };

  const generateAIResponse = (userInput) => {
    const lowerInput = userInput.toLowerCase();
    
    if (lowerInput.includes("spanje") || lowerInput.includes("spati")) {
      return "Za boljše spanje dojenčka poskusite:\n\n• Ustvarite rutino pred spanjem (kopel, masaža, pesmica)\n• Ohranite temno in tiho sobo\n• Poskusite beli šum\n• Preverite, ali je dojenček sit in ima suho plenico\n\nAli vas zanima kaj specifičnega glede spanja?";
    } else if (lowerInput.includes("hrana") || lowerInput.includes("dojenje")) {
      return "Glede hrane in dojenja:\n\n• Dojenje na zahtevo je najbolj priporočljivo\n• Poskusite različne pozicije za dojenje\n• Preverite, ali se dojenček pravilno prijema\n• Po potrebi se posvetujte z dojilno svetovalko\n\nAli imate specifična vprašanja?";
    } else if (lowerInput.includes("zdravje") || lowerInput.includes("bolezen")) {
      return "Za zdravje dojenčka:\n\n• Redno spremljajte temperaturo\n• Posvetujte se z zdravnikom pri težavah\n• Ohranjajte higieno in redno cepite\n• Bodite pozorni na znake bolezni (visoka temperatura, izguba apetita)\n\n⚠️ Za resne simptome takoj pokličite zdravnika!";
    } else if (lowerInput.includes("razvoj") || lowerInput.includes("motorika")) {
      return "Za razvoj dojenčka:\n\n• Tummy time pomaga pri razvoju mišic\n• Igre z različnimi teksturami spodbujajo razvoj\n• Govorite in pojejte otroku\n• Omogočite raziskovanje varnih predmetov\n\nVsak otrok se razvija po svojem tempu!";
    } else {
      return "Razumem vaše vprašanje. Kot AI asistent za materinstvo vam lahko pomagam z:\n\n• Nasveti za spanje in hrano\n• Informacijami o razvoju\n• Vprašanji o zdravju (splošno)\n• Podporo pri vsakdanjih izzivih\n\nKaj vas najbolj zanima?";
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl" isCentered>
      <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(4px)" />
      <ModalContent borderRadius="2xl"maxH="90vh" display="flex" flexDirection="column" boxShadow="0 20px 60px rgba(0, 0, 0, 0.3)"
      >
        <ModalHeader bgGradient="linear(to-r, brand.500, brand.600)" color="white"
          borderRadius="2xl 2xl 0 0"
          py={4}
        >
          <HStack spacing={3}>
            <Box
              p={2}
              bg="rgba(255, 255, 255, 0.2)"
              borderRadius="lg"
            >
              <FaRobot size={20} />
            </Box>
            <Box>
              <Heading size="md" fontWeight="700">
                AI Asistent
              </Heading>
              <Text fontSize="xs" opacity={0.9}>
                Vaš pomočnik za materinstvo
              </Text>
            </Box>
          </HStack>
        </ModalHeader>
        <ModalCloseButton color="white" _hover={{ bg: "rgba(255, 255, 255, 0.2)" }} />

        <ModalBody
          p={0}
          display="flex"
          flexDirection="column"
          bg="gray.50"
          flex="1"
          overflow="hidden"
        >
          <Box
            flex="1"
            overflowY="auto"
            p={4}
            css={{
              "&::-webkit-scrollbar": {
                width: "8px",
              },
              "&::-webkit-scrollbar-track": {
                background: "transparent",
              },
              "&::-webkit-scrollbar-thumb": {
                background: "#CBD5E0",
                borderRadius: "4px",
              },
              "&::-webkit-scrollbar-thumb:hover": {
                background: "#A0AEC0",
              },
            }}
          >
            <VStack spacing={4} align="stretch">
              {messages.map((message) => (
                <Flex
                  key={message.id}
                  justify={message.role === "user" ? "flex-end" : "flex-start"}
                  align="flex-start"
                  gap={3}
                >
                  {message.role === "assistant" && (
                    <Avatar
                      size="sm"
                      bg="brand.500"
                      icon={<FaRobot />}
                      borderRadius="full"
                    />
                  )}
                  <Box
                    maxW="75%"
                    bg={message.role === "user" ? "brand.500" : "white"}
                    color={message.role === "user" ? "white" : "gray.800"}
                    px={4}
                    py={3}
                    borderRadius="2xl"
                    boxShadow="0 2px 8px rgba(0, 0, 0, 0.1)"
                    borderTopLeftRadius={message.role === "assistant" ? "4px" : "2xl"}
                    borderTopRightRadius={message.role === "user" ? "4px" : "2xl"}
                  >
                    <Text
                      fontSize="sm"
                      lineHeight="1.6"
                      whiteSpace="pre-wrap"
                    >
                      {message.content}
                    </Text>
                  </Box>
                  {message.role === "user" && (
                    <Avatar
                      size="sm"
                      bg="gray.400"
                      icon={<FaUser />}
                      borderRadius="full"
                    />
                  )}
                </Flex>
              ))}
              {isLoading && (
                <Flex justify="flex-start" align="flex-start" gap={3}>
                  <Avatar
                    size="sm"
                    bg="brand.500"
                    icon={<FaRobot />}
                    borderRadius="full"
                  />
                  <Box
                    bg="white"
                    px={4}
                    py={3}
                    borderRadius="2xl"
                    borderTopLeftRadius="4px"
                    boxShadow="0 2px 8px rgba(0, 0, 0, 0.1)"
                  >
                    <HStack spacing={2}>
                      <Spinner size="sm" color="brand.500" />
                      <Text fontSize="xs" color="gray.500">
                        Piše...
                      </Text>
                    </HStack>
                  </Box>
                </Flex>
              )}
              <div ref={messagesEndRef} />
            </VStack>
          </Box>

          <Box
            p={4}
            bg="white"
            borderTop="1px solid"
            borderColor="gray.200"
          >
            <HStack spacing={2}>
              <Input
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Vprašajte AI asistenta..."
                borderRadius="xl"
                borderColor="gray.300"
                _focus={{
                  borderColor: "brand.500",
                  boxShadow: "0 0 0 1px var(--chakra-colors-brand-500)",
                }}
                _hover={{
                  borderColor: "brand.300",
                }}
                isDisabled={isLoading}
              />
              <IconButton
                icon={<FaPaperPlane />}
                aria-label="Pošlji"
                onClick={handleSend}
                bg="brand.500"
                color="white"
                borderRadius="xl"
                _hover={{
                  bg: "brand.600",
                  transform: "scale(1.05)",
                }}
                _active={{
                  transform: "scale(0.95)",
                }}
                isDisabled={!inputValue.trim() || isLoading}
                transition="all 0.2s"
              />
            </HStack>
            <Text fontSize="xs" color="gray.500" mt={2} textAlign="center">
              Pritisnite Enter za pošiljanje
            </Text>
          </Box>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default AIChat;
