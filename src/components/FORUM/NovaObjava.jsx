import { useState, useCallback, useEffect } from "react";
import {
  Box, Button, Heading, FormControl, FormLabel,
  Input, Textarea, Select, VStack, useToast, Card, CardBody, HStack, Spinner, Text, Checkbox
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { ArrowBackIcon } from "@chakra-ui/icons";
import { API_BASE } from "../../api/config";

const getStoredUser = () => {
  try { return JSON.parse(localStorage.getItem("user") || "null"); }
  catch { return null; }
};

const NovaObjava = ({
  apiBase = API_BASE,
  onSuccess,
  onCancel,
  hideBackButton = false,
  showInCard = true
}) => {
  const navigate = useNavigate();
  const toast = useToast();
  const user = getStoredUser();

  const [title, setTitle] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [content, setContent] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);

  const [categories, setCategories] = useState([]);
  const [catLoading, setCatLoading] = useState(true);
  const [catError, setCatError] = useState("");

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setCatLoading(true);
        const res = await fetch(`${apiBase}/api/categories`);
        if (!res.ok) throw new Error("Napaka pri branju kategorij");
        const data = await res.json();
        if (alive) {
          setCategories(Array.isArray(data) ? data : []);
          setCatLoading(false);
        }
      } catch (e) {
        if (alive) {
          setCatError(e.message || "Napaka pri branju kategorij");
          setCatLoading(false);
        }
      }
    })();
    return () => { alive = false; };
  }, [apiBase]);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();

    if (!user?.id) {
      toast({ status: "warning", title: "Najprej se prijavi." });
      navigate("/prijava");
      return;
    }
    if (!title.trim() || !content.trim()) {
      toast({ status: "error", title: "Naslov in vsebina sta obvezna." });
      return;
    }
    if (!categoryId) {
      toast({ status: "error", title: "Izberi kategorijo." });
      return;
    }

    try {
      const res = await fetch(`${apiBase}/api/posts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: 'include',
        body: JSON.stringify({
          title: title.trim(),
          content: content.trim(),
          categoryId,
          userId: user.id,
          isAnonymous: isAnonymous
        }),
      });

      if (!res.ok) {
        const msg = await res.text().catch(() => "");
        throw new Error(msg || "Napaka pri shranjevanju.");
      }

      toast({ status: "success", title: "Objava uspešno ustvarjena!" });
      window.dispatchEvent(new Event("forum-post-created"));
      if (onSuccess) {
        onSuccess();
      } else {
        navigate("/");
      }
    } catch (err) {
      toast({ status: "error", title: err.message || "Napaka pri shranjevanju." });
    }
  }, [user, title, content, categoryId, toast, navigate, apiBase, onSuccess]);

  const formContent = (
    <Box as="form" onSubmit={handleSubmit}>
      <VStack spacing={4} align="stretch">
        <FormControl isRequired>
          <FormLabel
            fontSize="sm"
            fontWeight="700"
            color="gray.700"
            textTransform="uppercase"
            letterSpacing="0.05em"
            mb={2}
            sx={{
              background: "linear-gradient(90deg, #EC5F8C 0%, #F48FB1 100%)",
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent"
            }}
          >
            Naslov
          </FormLabel>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Kratek naslov tvoje objave"
            size="md"
            borderRadius="16px"
            borderColor="rgba(236, 95, 140, 0.15)"
            borderWidth="1.5px"
            bg="linear-gradient(145deg, #f9fafb 0%, #ffffff 100%)"
            transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
            _hover={{
              borderColor: "rgba(236, 95, 140, 0.3)",
              bg: "white",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)"
            }}
            _focus={{
              borderColor: "#EC5F8C",
              boxShadow: "0 0 0 4px rgba(236, 95, 140, 0.12), 0 4px 16px rgba(236, 95, 140, 0.15)",
              bg: "white",
              transform: "translateY(-2px)"
            }}
          />
        </FormControl>

        <FormControl isRequired>
          <FormLabel
            fontSize="sm"
            fontWeight="600"
            color="gray.700"
            textTransform="uppercase"
            letterSpacing="0.02em"
            mb={3}
          >
            Kategorija
          </FormLabel>
          {catLoading ? (
            <HStack p={4} border="1px solid" borderColor="gray.200" borderRadius="2px">
              <Spinner size="sm" color="brand.500" />
              <Text fontSize="sm" color="gray.600">Nalaganje kategorij…</Text>
            </HStack>
          ) : catError ? (
            <Text fontSize="sm" color="red.500" p={4} border="1px solid" borderColor="red.200" borderRadius="2px" bg="red.50">
              {catError}
            </Text>
          ) : (
            <Select
              placeholder="Izberi kategorijo"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              size="md"
              borderRadius="16px"
              borderColor="rgba(236, 95, 140, 0.15)"
              borderWidth="1.5px"
              bg="linear-gradient(145deg, #f9fafb 0%, #ffffff 100%)"
              transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
              _hover={{
                borderColor: "rgba(236, 95, 140, 0.3)",
                bg: "white"
              }}
              _focus={{
                borderColor: "#EC5F8C",
                boxShadow: "0 0 0 4px rgba(236, 95, 140, 0.12)",
                bg: "white"
              }}
              isDisabled={catLoading || !!catError || categories.length === 0}
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Select>
          )}
        </FormControl>

        <FormControl isRequired>
          <FormLabel
            fontSize="sm"
            fontWeight="600"
            color="gray.700"
            textTransform="uppercase"
            letterSpacing="0.02em"
            mb={3}
          >
            Vsebina
          </FormLabel>
          <Textarea
            minH="180px"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Zapiši vsebino svoje objave..."
            borderRadius="16px"
            borderColor="rgba(236, 95, 140, 0.15)"
            borderWidth="2px"
            bg="linear-gradient(145deg, #f9fafb 0%, #ffffff 100%)"
            transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
            _hover={{
              borderColor: "rgba(236, 95, 140, 0.3)",
              bg: "white"
            }}
            _focus={{
              borderColor: "#EC5F8C",
              boxShadow: "0 0 0 4px rgba(236, 95, 140, 0.12), 0 4px 16px rgba(236, 95, 140, 0.1)",
              bg: "white"
            }}
            resize="vertical"
          />
        </FormControl>
        <FormControl>
          <Checkbox
            isChecked={isAnonymous}
            onChange={(e) => setIsAnonymous(e.target.checked)}
            colorScheme="brand"
            fontSize="xs"
          >
            Objavi kot anonimen član
          </Checkbox>

          <Text fontSize="xs" color="gray.500" mt={1}>
            Tvojo ime bo videl/a samo administrator, drugi bodo videli "Anonimen član"
          </Text>
        </FormControl>

        <HStack justify="flex-end" spacing={3} pt={4} borderTop="1px solid" borderColor="gray.100">
          <Button
            variant="ghost"
            onClick={onCancel || (() => navigate(-1))}
            borderRadius="12px"
            color="gray.600"
            transition="all 0.2s"
            _hover={{ color: "#EC5F8C", bg: "rgba(236, 95, 140, 0.05)" }}
          >
            Prekliči
          </Button>
          <Button
            type="submit"
            bgGradient="linear(135deg, #EC5F8C 0%, #F48FB1 100%)"
            color="white"
            borderRadius="12px"
            fontWeight="600"
            px={6}
            boxShadow="0 4px 12px rgba(236, 95, 140, 0.3)"
            transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
            _hover={{
              bgGradient: "linear(135deg, #D94B8C 0%, #EC5F8C 100%)",
              transform: "translateY(-2px)",
              boxShadow: "0 6px 16px rgba(236, 95, 140, 0.4)"
            }}
            _active={{
              transform: "translateY(0)",
              boxShadow: "0 2px 8px rgba(236, 95, 140, 0.3)"
            }}
            isDisabled={catLoading || !!catError}
          >
            Objavi
          </Button>
        </HStack>
      </VStack>
    </Box>
  );

  if (!showInCard) {
    return formContent;
  }

  const cardWrapper = (
    <Box
      bg="linear-gradient(145deg, #ffffff 0%, #fafbfc 100%)"
      borderRadius="20px"
      boxShadow="0 4px 20px rgba(0, 0, 0, 0.06), 0 1px 4px rgba(0, 0, 0, 0.04)"
      border="1px solid"
      borderColor="rgba(236, 95, 140, 0.1)"
      p={{ base: 4, md: 5 }}
      pt={10}
      position="relative"
      overflow="hidden"
    >
      <HStack justify="space-between" mb={6}>
        <Box>
          <Heading
            fontSize="1.25rem"
            fontWeight="700"
            color="gray.900"
            letterSpacing="-0.02em"
            mb={1}
          >
            Nova objava
          </Heading>
          <Text fontSize="sm" color="gray.600">
            Deli svojo izkušnjo ali vprašanje s skupnostjo
          </Text>
        </Box>
        {!hideBackButton && (
          <Button
            leftIcon={<ArrowBackIcon />}
            variant="ghost"
            onClick={onCancel || (() => navigate(-1))}
            borderRadius="12px"
            color="gray.600"
            _hover={{ color: "#EC5F8C", bg: "rgba(236, 95, 140, 0.05)" }}
          >
            Nazaj
          </Button>
        )}
      </HStack>
      {formContent}
    </Box>
  );

  if (hideBackButton) {
    return cardWrapper;
  }

  return (
    <Box maxW="4xl" mx="auto" px={{ base: 4, md: 6 }} py={8} mt={{ base: 0, md: 8 }}>
      {cardWrapper}
    </Box>
  );
};

export default NovaObjava;
