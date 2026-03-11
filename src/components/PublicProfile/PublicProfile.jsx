import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    Box, Container, Heading, VStack, HStack, Button, Text, Avatar,
    Divider, useToast, Skeleton, Badge, Grid, GridItem, Stat, StatLabel,
    StatNumber, Card, CardBody, SimpleGrid
} from "@chakra-ui/react";
import { ArrowBackIcon } from "@chakra-ui/icons";
import Footer from "../Footer/Footer";
import { FaHeart, FaComment } from "react-icons/fa";
import { API_BASE } from "../../api/config";

const PublicProfile = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const toast = useToast();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!id) return;

        async function loadProfile() {
            try {
                setLoading(true);
                const res = await fetch(`${API_BASE}/api/users/${id}`);

                if (!res.ok) {
                    if (res.status === 404) {
                        toast({ status: "error", title: "Uporabnik ne obstaja" });
                        navigate("/");
                        return;
                    }
                    throw new Error("Napaka pri branju profila");
                }

                const data = await res.json();
                setUser(data);
            } catch (err) {
                console.error(err);
                toast({ status: "error", title: "Napaka pri nalaganju profila" });
            } finally {
                setLoading(false);
            }
        }

        loadProfile();
    }, [id, navigate, toast]);

    const formatDate = (iso) =>
        new Date(iso).toLocaleString("sl-SI", {
            year: "numeric",
            month: "short",
            day: "2-digit",
        });

    const handlePostClick = (postId) => {
        navigate(`/?post=${postId}`);
    };

    if (loading) {
        return (
            <Box minH="100vh" bg="gray.50">
                <Container maxW="container.lg" py={8}>
                    <Skeleton height="200px" borderRadius="xl" />
                </Container>
            </Box>
        );
    }

    if (!user) {
        return null;
    }

    return (
        <Box minH="100vh" bg="gray.50">
            <Container maxW="container.lg" py={8}>
                <VStack spacing={6} align="stretch">
                    <HStack>
                        <Button
                            leftIcon={<ArrowBackIcon />}
                            variant="ghost"
                            onClick={() => navigate(-1)}
                        >
                            Nazaj
                        </Button>
                    </HStack>

                    <Card bg="white" borderRadius="xl" boxShadow="md">
                        <CardBody p={8}>
                            <VStack spacing={6} align="stretch">
                                {/* Profile Header */}
                                <HStack spacing={6} align="flex-start">
                                    <Avatar
                                        size="xl"
                                        name={user.username}
                                        bg="brand.500"
                                    />
                                    <VStack align="flex-start" spacing={2} flex="1">
                                        <HStack spacing={3}>
                                            <Heading size="lg">{user.username}</Heading>
                                            {user.email_verified && (
                                                <Badge colorScheme="green" fontSize="xs">
                                                    ✓ Verificiran
                                                </Badge>
                                            )}
                                        </HStack>

                                        {user.bio && (
                                            <Text color="gray.700" whiteSpace="pre-wrap" lineHeight="1.6">
                                                {user.bio}
                                            </Text>
                                        )}
                                        {!user.bio && (
                                            <Text color="gray.400" fontStyle="italic">
                                                Uporabnik še ni dodal BIO-ja
                                            </Text>
                                        )}

                                        <Text fontSize="sm" color="gray.500">
                                            Član/ica od {formatDate(user.createdAt)}
                                        </Text>
                                    </VStack>
                                </HStack>

                                <Divider />

                                {/* Stats */}
                                <SimpleGrid columns={{ base: 3, md: 3 }} spacing={4}>
                                    <Stat textAlign="center">
                                        <StatLabel color="gray.600">Objave</StatLabel>
                                        <StatNumber color="brand.500">{user.stats.totalPosts}</StatNumber>
                                    </Stat>
                                    <Stat textAlign="center">
                                        <StatLabel color="gray.600">Lajki</StatLabel>
                                        <StatNumber color="red.500">{user.stats.totalLikes}</StatNumber>
                                    </Stat>
                                    <Stat textAlign="center">
                                        <StatLabel color="gray.600">Komentarji</StatLabel>
                                        <StatNumber color="blue.500">{user.stats.totalComments}</StatNumber>
                                    </Stat>
                                </SimpleGrid>
                            </VStack>
                        </CardBody>
                    </Card>

                    {user.recentPosts && user.recentPosts.length > 0 && (
                        <Box>
                            <Heading size="md" mb={4}>Objave</Heading>
                            <VStack spacing={4} align="stretch">
                                {user.recentPosts.map((post) => (
                                    <Card
                                        key={post.id}
                                        bg="white"
                                        borderRadius="lg"
                                        boxShadow="sm"
                                        cursor="pointer"
                                        _hover={{ boxShadow: "md", transform: "translateY(-2px)" }}
                                        transition="all 0.2s"
                                        onClick={() => handlePostClick(post.id)}
                                    >
                                        <CardBody p={6}>
                                            <VStack align="stretch" spacing={3}>
                                                <HStack justify="space-between">
                                                    {post.categoryName && (
                                                        <Badge colorScheme="pink">{post.categoryName}</Badge>
                                                    )}
                                                    <Text fontSize="xs" color="gray.500">
                                                        {formatDate(post.createdAt)}
                                                    </Text>
                                                </HStack>
                                                <Heading size="sm" color="gray.800">
                                                    {post.title}
                                                </Heading>
                                                <Text
                                                    fontSize="sm"
                                                    color="gray.600"
                                                    noOfLines={2}
                                                    whiteSpace="pre-wrap"
                                                >
                                                    {post.content}
                                                </Text>
                                                <HStack spacing={4} color="gray.500" fontSize="xs">
                                                    <HStack spacing={1}>
                                                        <FaHeart size="12px" />
                                                        <Text>{post.likeCount}</Text>
                                                    </HStack>
                                                    <HStack spacing={1}>
                                                        <FaComment size="12px" />
                                                        <Text>{post.commentCount}</Text>
                                                    </HStack>
                                                </HStack>
                                            </VStack>
                                        </CardBody>
                                    </Card>
                                ))}
                            </VStack>
                        </Box>
                    )}

                    {(!user.recentPosts || user.recentPosts.length === 0) && (
                        <Card bg="white" borderRadius="lg">
                            <CardBody p={8} textAlign="center">
                                <Text color="gray.500">Uporabnik še ni objavil nobene objave</Text>
                            </CardBody>
                        </Card>
                    )}
                </VStack>
            </Container>
            <Box display={{ base: "none", md: "block" }}>
                <Footer />
            </Box>
        </Box>
    );
};

export default PublicProfile;