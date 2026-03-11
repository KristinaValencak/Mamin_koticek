import { Box, HStack, IconButton, Avatar, useDisclosure, Drawer, DrawerOverlay, DrawerContent, DrawerHeader, DrawerBody, DrawerCloseButton, Text, Flex, VStack, Button, Spinner, InputGroup, InputLeftElement, Input, Icon } from "@chakra-ui/react";
import { Link as RouterLink, useNavigate, useLocation } from "react-router-dom";
import { FaHome, FaTh, FaBaby, FaChild, FaGraduationCap, FaHeart, FaMoon, FaUtensils, FaShoppingBag, FaHandsHelping, FaComments, FaCalendarAlt } from "react-icons/fa";
import { AddIcon, SearchIcon } from "@chakra-ui/icons";
import { useState, useEffect, useCallback } from "react";
import { API_BASE } from "../../api/config";
import { getStoredUser } from "../../utils/helpers";

const MobileFooterNavbar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { isOpen: isCategoriesOpen, onOpen: onCategoriesOpen, onClose: onCategoriesClose } = useDisclosure();
    const { isOpen: isSearchOpen, onOpen: onSearchOpen, onClose: onSearchClose } = useDisclosure();
    const [user, setUser] = useState(getStoredUser());
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [categoriesLoading, setCategoriesLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [searchLoading, setSearchLoading] = useState(false);

    useEffect(() => {
        let abort = false;
        async function loadCategories() {
            try {
                setCategoriesLoading(true);
                const res = await fetch(`${API_BASE}/api/categories`);
                if (!res.ok) throw new Error("Napaka pri branju kategorij");
                const data = await res.json();
                if (!abort) {
                    setCategories(Array.isArray(data) ? data : []);
                    setCategoriesLoading(false);
                }
            } catch (e) {
                console.error(e);
                if (!abort) setCategoriesLoading(false);
            }
        }
        loadCategories();
        return () => { abort = true; };
    }, []);

    useEffect(() => {
        const sync = () => setUser(getStoredUser());
        const onStorage = (e) => { if (e.key === "user") sync(); };
        window.addEventListener("storage", onStorage);
        window.addEventListener("auth-changed", sync);
        return () => {
            window.removeEventListener("storage", onStorage);
            window.removeEventListener("auth-changed", sync);
        };
    }, []);

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const cat = params.get("cat");
        if (cat) {
            const foundCat = categories.find(c => c.slug === cat);
            if (foundCat) {
                setSelectedCategory(foundCat);
            } else {
                setSelectedCategory({ slug: cat, name: cat, id: null });
            }
        } else {
            setSelectedCategory(null);
        }
    }, [location.search, categories]);

    const handleCreatePost = () => {
        if (!user) {
            navigate("/prijava");
            return;
        }
        navigate("/?new=true");
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleCategorySelect = (cat) => {
        if (cat) {
            navigate(`/?cat=${cat.slug}`);
        } else {
            navigate("/");
        }
        onCategoriesClose();
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleSearchClick = () => {
        onSearchOpen();
    };

    const searchUsers = useCallback(async (query) => {
        if (!query.trim()) {
            setSearchResults([]);
            return;
        }

        try {
            setSearchLoading(true);
            const res = await fetch(`${API_BASE}/api/users/search?q=${encodeURIComponent(query.trim())}`);
            if (!res.ok) throw new Error("Napaka pri iskanju");
            const data = await res.json();
            setSearchResults(Array.isArray(data) ? data : []);
        } catch (e) {
            console.error(e);
            setSearchResults([]);
        } finally {
            setSearchLoading(false);
        }
    }, []);

    useEffect(() => {
        if (!isSearchOpen) {
            setSearchQuery("");
            setSearchResults([]);
            return;
        }

        const timer = setTimeout(() => {
            if (searchQuery.trim()) {
                searchUsers(searchQuery);
            } else {
                setSearchResults([]);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [searchQuery, isSearchOpen, searchUsers]);

    const handleUserSelect = (userId) => {
        navigate(`/user/${userId}`);
        onSearchClose();
        setSearchQuery("");
        setSearchResults([]);
    };

    const getCategoryIcon = (categoryId) => {
        const iconMap = {
            1: null,
            2: FaBaby,
            3: FaChild,
            4: FaGraduationCap,
            5: FaHeart,
            6: FaMoon,
            7: FaUtensils,
            8: FaShoppingBag,
            9: FaHeart,
            10: FaHandsHelping,
            11: FaComments,
            12: FaCalendarAlt,
        };
        return iconMap[categoryId] || FaComments;
    };

    const isActive = (path) => location.pathname === path;

    return (
        <>
            <Box
                display={{ base: "block", md: "none" }}
                position="fixed"
                bottom="0"
                left="0"
                right="0"
                zIndex="1000"
                bg="white"
                borderTop="1px solid"
                borderColor="gray.200"
                boxShadow="0 -2px 10px rgba(0, 0, 0, 0.05)"
                py={2}
                px={4}
            >
                <HStack
                    justify="space-between"
                    align="center"
                    spacing={0}
                    maxW="100%"
                >
                    <IconButton
                        as={RouterLink}
                        to="/"
                        aria-label="Forum"
                        icon={<FaHome />}
                        variant="ghost"
                        size="lg"
                        color={isActive("/") ? "#EC5F8C" : "gray.600"}
                        _hover={{
                            bg: "gray.50",
                            color: "#EC5F8C"
                        }}
                        _active={{
                            bg: "gray.100"
                        }}
                        borderRadius="md"
                        flex="1"
                        maxW="25%"
                    />

                    <IconButton
                        aria-label="Kategorije"
                        icon={<FaTh />}
                        variant="ghost"
                        size="lg"
                        color={selectedCategory ? "#EC5F8C" : "gray.600"}
                        _hover={{
                            bg: "gray.50",
                            color: "#EC5F8C"
                        }}
                        _active={{
                            bg: "gray.100"
                        }}
                        borderRadius="md"
                        onClick={onCategoriesOpen}
                        flex="1"
                        maxW="25%"
                    />

                    <IconButton
                        aria-label="Nova objava"
                        icon={<AddIcon />}
                        size="lg"
                        bg="#EC5F8C"
                        color="white"
                        borderRadius="full"
                        _hover={{
                            bg: "#D94B8C",
                            transform: "scale(1.1)"
                        }}
                        _active={{
                            bg: "#C73A7A",
                            transform: "scale(0.95)"
                        }}
                        boxShadow="0 4px 12px rgba(236, 95, 140, 0.4)"
                        transition="all 0.2s"
                        onClick={handleCreatePost}
                        flex="0 0 auto"
                        minW="48px"
                        h="48px"
                    />

                    <IconButton
                        aria-label="Iskanje"
                        icon={<SearchIcon />}
                        variant="ghost"
                        size="lg"
                        color="gray.600"
                        _hover={{
                            bg: "gray.50",
                            color: "#EC5F8C"
                        }}
                        _active={{
                            bg: "gray.100"
                        }}
                        borderRadius="md"
                        onClick={handleSearchClick}
                        flex="1"
                        maxW="25%"
                    />

                    <Box flex="1" maxW="25%" display="flex" justifyContent="center">
                        {user ? (
                            <IconButton
                                as={RouterLink}
                                to="/profile"
                                aria-label="Moj profil"
                                icon={
                                    <Avatar
                                        name={user.username || "U"}
                                        size="sm"
                                        bg="linear-gradient(135deg, #EC5F8C 0%, #F48FB1 100%)"
                                        color="white"
                                    />
                                }
                                variant="ghost"
                                size="lg"
                                color={isActive("/profile") ? "#EC5F8C" : "gray.600"}
                                _hover={{
                                    bg: "gray.50",
                                    color: "#EC5F8C"
                                }}
                                _active={{
                                    bg: "gray.100"
                                }}
                                borderRadius="md"
                                p={0}
                            />
                        ) : (
                            <IconButton
                                as={RouterLink}
                                to="/prijava"
                                aria-label="Prijava"
                                icon={
                                    <Avatar
                                        name="?"
                                        size="sm"
                                        bg="gray.300"
                                        color="white"
                                    />
                                }
                                variant="ghost"
                                size="lg"
                                color="gray.600"
                                _hover={{
                                    bg: "gray.50",
                                    color: "#EC5F8C"
                                }}
                                _active={{
                                    bg: "gray.100"
                                }}
                                borderRadius="md"
                                p={0}
                            />
                        )}
                    </Box>
                </HStack>
            </Box>

            <Drawer
                isOpen={isCategoriesOpen}
                placement="bottom"
                onClose={onCategoriesClose}
                size="full"
            >
                <DrawerOverlay />
                <DrawerContent borderTopRadius="2xl">
                    <DrawerHeader
                        borderBottom="1px solid"
                        borderColor="gray.200"
                        pb={4}
                    >
                        <Flex justify="space-between" align="center">
                            <Text fontSize="xl" fontWeight="700" color="gray.800">
                                Kategorije
                            </Text>
                            <DrawerCloseButton position="relative" top={0} right={0} />
                        </Flex>
                    </DrawerHeader>
                    <DrawerBody pt={6}>
                        {categoriesLoading ? (
                            <Box py={8} textAlign="center">
                                <Spinner color="#EC5F8C" size="lg" />
                            </Box>
                        ) : (
                            <VStack align="stretch" spacing={2}>
                                <Button
                                    onClick={() => handleCategorySelect(null)}
                                    variant={!selectedCategory ? "solid" : "ghost"}
                                    colorScheme="brand"
                                    justifyContent="flex-start"
                                    h="48px"
                                    fontSize="md"
                                    fontWeight="600"
                                    leftIcon={<FaHome />}
                                    borderRadius="lg"
                                >
                                    Vse objave
                                </Button>

                                {/* Categories list */}
                                {categories.map((cat) => {
                                    const IconComponent = getCategoryIcon(cat.id);
                                    const isSelected = selectedCategory?.slug === cat.slug || selectedCategory?.id === cat.id;

                                    return (
                                        <Button
                                            key={cat.id}
                                            onClick={() => handleCategorySelect(cat)}
                                            variant={isSelected ? "solid" : "ghost"}
                                            colorScheme={isSelected ? "brand" : "gray"}
                                            justifyContent="flex-start"
                                            h="48px"
                                            fontSize="md"
                                            fontWeight={isSelected ? "600" : "500"}
                                            leftIcon={
                                                cat.id === 1 ? (
                                                    <Text fontSize="lg">🤰</Text>
                                                ) : (
                                                    <Icon as={IconComponent} boxSize={4} />
                                                )
                                            }
                                            borderRadius="lg"
                                            _hover={{
                                                bg: isSelected ? "brand.600" : "gray.50"
                                            }}
                                        >
                                            {cat.name}
                                        </Button>
                                    );
                                })}
                            </VStack>
                        )}
                    </DrawerBody>
                </DrawerContent>
            </Drawer>

            <Drawer
                isOpen={isSearchOpen}
                placement="bottom"
                onClose={() => {
                    onSearchClose();
                    setSearchQuery("");
                    setSearchResults([]);
                }}
                size="full"
            >
                <DrawerOverlay />
                <DrawerContent borderTopRadius="2xl">
                    <DrawerHeader
                        borderBottom="1px solid"
                        borderColor="gray.200"
                        pb={4}
                    >
                        <Flex justify="space-between" align="center">
                            <Text fontSize="xl" fontWeight="700" color="gray.800">
                                Iskanje uporabnic
                            </Text>
                            <DrawerCloseButton position="relative" top={0} right={0} />
                        </Flex>
                    </DrawerHeader>
                    <DrawerBody pt={6}>
                        <VStack spacing={4} align="stretch">
                            <InputGroup size="lg">
                                <InputLeftElement pointerEvents="none">
                                    <SearchIcon color="gray.400" />
                                </InputLeftElement>
                                <Input
                                    placeholder="Išči po uporabniškem imenu..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    autoFocus
                                    bg="white"
                                    borderColor="gray.300"
                                    borderRadius="lg"
                                    _focus={{
                                        borderColor: "#EC5F8C",
                                        boxShadow: "0 0 0 3px rgba(236, 95, 140, 0.1)"
                                    }}
                                />
                            </InputGroup>

                            {searchLoading ? (
                                <Box py={8} textAlign="center">
                                    <Spinner color="#EC5F8C" size="lg" />
                                </Box>
                            ) : searchQuery.trim() && searchResults.length === 0 ? (
                                <Text color="gray.500" textAlign="center" py={8}>
                                    Ni rezultatov
                                </Text>
                            ) : (
                                <VStack align="stretch" spacing={2}>
                                    {searchResults.map((user) => (
                                        <Button
                                            key={user.id}
                                            onClick={() => handleUserSelect(user.id)}
                                            variant="ghost"
                                            justifyContent="flex-start"
                                            h="56px"
                                            fontSize="md"
                                            fontWeight="500"
                                            leftIcon={
                                                <Avatar
                                                    name={user.username}
                                                    size="sm"
                                                    bg="linear-gradient(135deg, #EC5F8C 0%, #F48FB1 100%)"
                                                    color="white"
                                                />
                                            }
                                            borderRadius="lg"
                                            _hover={{
                                                bg: "gray.50"
                                            }}
                                        >
                                            <VStack align="start" spacing={0} flex={1}>
                                                <Text fontWeight="600">{user.username}</Text>
                                                {user.bio && (
                                                    <Text fontSize="xs" color="gray.500" noOfLines={1}>
                                                        {user.bio}
                                                    </Text>
                                                )}
                                            </VStack>
                                        </Button>
                                    ))}
                                </VStack>
                            )}
                        </VStack>
                    </DrawerBody>
                </DrawerContent>
            </Drawer>
        </>
    );
};

export default MobileFooterNavbar;
