import { useEffect, useMemo, useState } from "react";
import {
    Box,
    VStack,
    Text,
    Spinner,
    Link,
    HStack,
    Icon,
    Heading,
} from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";
import {
    FaBaby,
    FaChild,
    FaGraduationCap,
    FaHeart,
    FaMoon,
    FaUtensils,
    FaShoppingBag,
    FaHandsHelping,
    FaComments,
    FaCalendarAlt,
} from "react-icons/fa";
import { API_BASE } from "../../../api/config";

export default function Categories({ apiBase = API_BASE, onSelect, selectedCategory }) {
    const [loading, setLoading] = useState(true);
    const [categories, setCategories] = useState([]);
    const [error, setError] = useState("");

    const getCategoryIcon = (categoryId, categorySlug) => {
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

    useEffect(() => {
        let alive = true;
        (async () => {
            try {
                const res = await fetch(`${apiBase}/api/categories`);
                if (!res.ok) throw new Error("Napaka pri branju kategorij");
                const data = await res.json();
                if (alive) {
                    setCategories(data);
                    setLoading(false);
                }
            } catch (e) {
                setError(e.message || "Napaka");
                setLoading(false);
            }
        })();
        return () => {
            alive = false;
        };
    }, [apiBase]);

    return (
        <Box className="forum-categories-wrapper">
            <Heading size="sm" mb={3} className="forum-section-title">Kategorije</Heading>
            {loading ? (
                <Box py={6} textAlign="center">
                    <Spinner color="#EC5F8C" />
                </Box>
            ) : error ? (
                <Text color="red.500" fontSize="sm">
                    {error}
                </Text>
            ) : (
                <VStack align="stretch" spacing={1} className="forum-categories-list">
                    {categories.map((cat) => {
                        const IconComponent = getCategoryIcon(cat.id, cat.slug);
                        const isSelected = selectedCategory?.slug === cat.slug || selectedCategory?.id === cat.id;

                        return (
                            <Box
                                key={cat.id}
                                as="button"
                                onClick={() => onSelect && onSelect(cat)}
                                className={`forum-category-card ${isSelected ? 'forum-category-selected' : ''}`}
                                textAlign="left"
                            >
                                <HStack spacing={3} align="center">
                                    <Box className="forum-category-icon">
                                        {cat.id === 1 ? (
                                            <Text fontSize="lg" role="img" aria-label="nosečnica">🤰</Text>
                                        ) : (
                                            <Icon as={IconComponent} boxSize={4} />
                                        )}
                                    </Box>
                                    <Text
                                        flex={1}
                                        fontSize="sm"
                                        fontWeight="600"
                                        className="forum-category-name"
                                    >
                                        {cat.name}
                                    </Text>
                                </HStack>
                            </Box>
                        );
                    })}
                </VStack>
            )}

            <Box mt={4} pt={4} borderTop="1px solid" borderColor="#efefef" className="forum-categories-footer">
                <VStack align="stretch" spacing={2}>
                    <Link as={RouterLink} to="/pogoji-uporabe" color="gray.600" _hover={{ color: "#EC5F8C" }}>Pogoji uporabe</Link>
                    <Link as={RouterLink} to="/politika-zasebnosti" color="gray.600" _hover={{ color: "#EC5F8C" }}>Zasebnost</Link>
                    <Link
                        fontSize="sm"
                        className="forum-footer-link"
                        onClick={() => window.alert("Kontakt")}
                    >
                        Kontakt
                    </Link>

                </VStack>
            </Box>
        </Box>
    );
}