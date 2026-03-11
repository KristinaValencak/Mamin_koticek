import { useState, useEffect, useCallback } from "react";
import {
  Box, Container, Heading, VStack, HStack, Button, FormControl, FormLabel,
  Input, Card, CardBody, Text, Divider, useToast, Avatar, IconButton,
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter,
  ModalCloseButton, useDisclosure, Skeleton, Badge, Flex, Grid, GridItem, Stat,
  StatLabel, StatNumber, StatHelpText, Tabs, TabList, TabPanels, Tab, TabPanel, SimpleGrid,
  Textarea, Select, Spinner
} from "@chakra-ui/react";
import { EditIcon, DeleteIcon, BellIcon, SettingsIcon, CloseIcon } from "@chakra-ui/icons";
import { FiUser, FiFileText, FiHeart, FiMessageSquare, FiBell, FiSettings, FiTrash2, FiEdit3, FiEdit } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import Swal from 'sweetalert2';
import Footer from "../Footer/Footer";
import NovaObjava from "./NovaObjava";
import { API_BASE } from "../../api/config";

const getStoredUser = () => {
  try { return JSON.parse(localStorage.getItem("user") || "null"); }
  catch { return null; }
};


const Profile = () => {
  const navigate = useNavigate();
  const toast = useToast();

  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [postsLoading, setPostsLoading] = useState(true);
  const [editingField, setEditingField] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deletingPostId, setDeletingPostId] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");

  const [editingPostId, setEditingPostId] = useState(null);
  const [editPostData, setEditPostData] = useState({
    title: "",
    content: "",
    categoryId: ""
  });

  const [stats, setStats] = useState({
    totalPosts: 0,
    totalLikes: 0,
    totalComments: 0
  });

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    bio: ""
  });

  const [activeDetailView, setActiveDetailView] = useState(null); // 'likes', 'comments', ali null
  const [likesList, setLikesList] = useState([]);
  const [commentsList, setCommentsList] = useState([]);
  const [detailLoading, setDetailLoading] = useState(false);



  useEffect(() => {
    const storedUser = getStoredUser();
    if (!storedUser) {
      navigate("/prijava");
      return;
    }

    let abort = false;
    async function loadProfile() {
      try {
        setLoading(true);

        const res = await fetch(`${API_BASE}/api/users/me`, {
          credentials: 'include'
        });

        if (res.status === 401) {
          localStorage.removeItem("user");
          window.dispatchEvent(new Event("auth-changed"));
          navigate("/prijava");
          return;
        }

        if (!res.ok) throw new Error("Napaka pri branju profila");
        const data = await res.json();
        if (!abort) {
          setUser(data);
          setFormData({
            username: data.username || "",
            email: data.email || "",
            password: "",
            confirmPassword: "",
            bio: data.bio || ""
          });
        }
      } catch (err) {
        console.error(err);
        if (!abort) {
          toast({
            status: "error",
            title: "Napaka pri nalaganju profila",
            description: err.message
          });
        }
      } finally {
        if (!abort) setLoading(false);
      }
    }
    loadProfile();
    return () => { abort = true; };
  }, [navigate, toast]);

  const fetchUserPosts = useCallback(async () => {
    try {
      setPostsLoading(true);

      const res = await fetch(`${API_BASE}/api/users/me/posts`, {
        credentials: 'include'
      });

      if (!res.ok) throw new Error("Napaka pri branju objav");
      const data = await res.json();
      const postsList = data.items || [];
      setPosts(postsList);

      const totalLikes = postsList.reduce((sum, post) => sum + (post.likeCount || 0), 0);
      const totalComments = postsList.reduce((sum, post) => sum + (post.commentCount || 0), 0);
      setStats({
        totalPosts: postsList.length,
        totalLikes: totalLikes,
        totalComments: totalComments
      });
    } catch (err) {
      console.error(err);
      toast({
        status: "error",
        title: "Napaka pri nalaganju objav",
        description: err.message
      });
    } finally {
      setPostsLoading(false);
    }
  }, [toast]);
  useEffect(() => {
    const storedUser = getStoredUser();
    if (!storedUser) return;

    fetchUserPosts();
  }, [fetchUserPosts]);



  const loadLikesDetail = useCallback(async () => {
    try {
      setDetailLoading(true);

      const res = await fetch(`${API_BASE}/api/users/me/likes`, {
        credentials: 'include'
      });

      if (!res.ok) throw new Error("Napaka pri branju lajkov");
      const data = await res.json();
      setLikesList(data.items || []);
    } catch (err) {
      console.error(err);
      toast({
        status: "error",
        title: "Napaka pri nalaganju lajkov",
        description: err.message
      });
    } finally {
      setDetailLoading(false);
    }
  }, [toast]);

  const loadCommentsDetail = useCallback(async () => {
    try {
      setDetailLoading(true);

      const res = await fetch(`${API_BASE}/api/users/me/comments`, {
        credentials: 'include'
      });

      if (!res.ok) throw new Error("Napaka pri branju komentarjev");
      const data = await res.json();
      setCommentsList(data.items || []);
    } catch (err) {
      console.error(err);
      toast({
        status: "error",
        title: "Napaka pri nalaganju komentarjev",
        description: err.message
      });
    } finally {
      setDetailLoading(false);
    }
  }, [toast]);

  const handleStatClick = async (type) => {
    if (activeDetailView === type) {
      setActiveDetailView(null);
      return;
    }

    setActiveDetailView(type);

    if (type === 'posts') {
    } else if (type === 'likes') {
      await loadLikesDetail();
    } else if (type === 'comments') {
      await loadCommentsDetail();
    }
  };

  const handleSaveField = useCallback(async (field) => {
    try {
      setSaving(true);
      const updateData = {};

      if (field === 'username') {
        updateData.username = formData.username.trim();
      } else if (field === 'email') {
        updateData.email = formData.email.trim();
      } else if (field === 'password') {
        if (formData.password) {
          updateData.password = formData.password;
        } else {
          toast({ status: "error", title: "Vnesite novo geslo" });
          return;
        }
      } else if (field === 'bio') {
        updateData.bio = formData.bio ? formData.bio.trim() : null;
      }

      const res = await fetch(`${API_BASE}/api/users/me`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: 'include',
        body: JSON.stringify(updateData)
      });

      if (res.status === 409) {
        const data = await res.json();
        toast({
          status: "error",
          title: data.message || "Uporabnik z tem emailom ali uporabniškim imenom že obstaja"
        });
        return;
      }

      if (!res.ok) throw new Error("Napaka pri posodabljanju profila");
      const data = await res.json();

      if (field === 'email' && data.emailChanged) {
        await Swal.fire({
          icon: 'success',
          title: 'Email spremenjen!',
          html: `
            <p>Na email naslov <strong>${data.email}</strong> smo poslali verifikacijsko povezavo.</p>
            <p>Prosim preveri svoj email in klikni na povezavo.</p>
            <p><strong>Sedaj boste odjavljeni.</strong></p>
          `,
          confirmButtonColor: '#EC5F8C',
          confirmButtonText: 'V redu',
          allowOutsideClick: false
        });

        localStorage.removeItem("user");
        window.dispatchEvent(new Event("auth-changed"));
        navigate("/prijava");
        return;
      }

      const storedUser = getStoredUser();
      if (storedUser) {
        const updatedUser = { ...storedUser, ...data };
        localStorage.setItem("user", JSON.stringify(updatedUser));
        window.dispatchEvent(new Event("auth-changed"));
      }

      setUser(data);
      setEditingField(null);

      if (field === 'password') {
        setFormData({
          ...formData,
          password: "",
          confirmPassword: ""
        });
      } else {
        setFormData({
          ...formData,
          [field]: data[field] !== undefined ? (data[field] || "") : formData[field]
        });
      }

      toast({
        status: "success",
        title: data.message || "Profil uspešno posodobljen"
      });
    } catch (err) {
      console.error(err);
      toast({
        status: "error",
        title: "Napaka pri posodabljanju profila",
        description: err.message
      });
    } finally {
      setSaving(false);
    }
  }, [formData, toast, navigate]);

  const handleDeletePost = useCallback(async (postId) => {
    const result = await Swal.fire({
      title: 'Ali ste prepričani?',
      text: "Te objave ne bo mogoče obnoviti!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Da, izbriši!',
      cancelButtonText: 'Prekliči'
    });

    if (!result.isConfirmed) return;

    try {
      setDeletingPostId(postId);
      const res = await fetch(`${API_BASE}/api/posts/${postId}`, {
        method: "DELETE",
        credentials: 'include'
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Napaka pri brisanju objave");
      }

      const updatedPosts = posts.filter(p => p.id !== postId);
      setPosts(updatedPosts);

      const totalLikes = updatedPosts.reduce((sum, post) => sum + (post.likeCount || 0), 0);
      const totalComments = updatedPosts.reduce((sum, post) => sum + (post.commentCount || 0), 0);
      setStats({
        totalPosts: updatedPosts.length,
        totalLikes: totalLikes,
        totalComments: totalComments
      });

      toast({
        status: "success",
        title: "Objava uspešno izbrisana"
      });
    } catch (err) {
      console.error(err);
      toast({
        status: "error",
        title: "Napaka pri brisanju objave",
        description: err.message
      });
    } finally {
      setDeletingPostId(null);
    }
  }, [posts, toast]);

  const handleDeleteAccount = useCallback(async () => {
    const result = await Swal.fire({
      title: 'Izbriši račun?',
      html: `
        <p><strong>Ta operacija je nepovratna!</strong></p>
        <p>Izbrisani bodo:</p>
        <ul style="text-align: left; margin: 10px 0;">
          <li>Vaš profil</li>
          <li>Vse vaše objave</li>
          <li>Vsi vaši komentarji</li>
          <li>Vsi vaši lajki</li>
        </ul>
        <p>Ali ste prepričani?</p>
      `,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Da, izbriši račun!',
      cancelButtonText: 'Prekliči',
      input: 'text',
      inputPlaceholder: 'Vnesite "IZBRIŠI" za potrditev',
      inputValidator: (value) => {
        if (value !== 'IZBRIŠI') {
          return 'Morate vnesti "IZBRIŠI" za potrditev';
        }
      }
    });

    if (!result.isConfirmed) return;

    try {
      const res = await fetch(`${API_BASE}/api/users/me`, {
        method: "DELETE",
        credentials: 'include'
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Napaka pri brisanju računa");
      }

      await Swal.fire({
        icon: 'success',
        title: 'Račun izbrisan',
        text: 'Vaš račun je bil uspešno izbrisan.',
        confirmButtonColor: '#EC5F8C'
      });

      localStorage.removeItem("user");
      window.dispatchEvent(new Event("auth-changed"));
      navigate("/");
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: 'error',
        title: 'Napaka',
        text: err.message || "Napaka pri brisanju računa",
        confirmButtonColor: '#EC5F8C'
      });
    }
  }, [toast, navigate]);

  const handleSaveEditPost = useCallback(async (postId) => {
    try {
      setSaving(true);

      if (!editPostData.title.trim() || !editPostData.content.trim()) {
        toast({ status: "error", title: "Naslov in vsebina sta obvezna" });
        return;
      }

      const res = await fetch(`${API_BASE}/api/posts/${postId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: 'include',
        body: JSON.stringify({
          title: editPostData.title.trim(),
          content: editPostData.content.trim(),
          categoryId: editPostData.categoryId || null
        })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || data.message || "Napaka pri posodabljanju objave");
      }

      await fetchUserPosts();

      setEditingPostId(null);
      setEditPostData({ title: "", content: "", categoryId: "" });

      toast({
        status: "success",
        title: "Objava uspešno posodobljena"
      });
    } catch (err) {
      console.error(err);
      toast({
        status: "error",
        title: err.message || "Napaka pri posodabljanju objave"
      });
    } finally {
      setSaving(false);
    }
  }, [editPostData, toast, fetchUserPosts]);



  const formatDate = (iso) =>
    new Date(iso).toLocaleString("sl-SI", {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });

  if (loading) {
    return (
      <Box minH="100vh" bg="gray.50">
        <Container maxW="8xl" py={8}>
          <Grid templateColumns={{ base: "1fr", lg: "280px 1fr" }} gap={6}>
            <GridItem>
              <Skeleton height="400px" borderRadius="xl" />
            </GridItem>
            <GridItem>
              <VStack spacing={4} align="stretch">
                <Skeleton height="200px" borderRadius="xl" />
                <Skeleton height="300px" borderRadius="xl" />
              </VStack>
            </GridItem>
          </Grid>
        </Container>
      </Box>
    );
  }

  if (!user) {
    return null;
  }

  const menuItems = [
    { id: "overview", label: "Pregled", icon: FiUser },
    { id: "posts", label: "Urejanje objav", icon: FiFileText },
    { id: "newpost", label: "Nova objava", icon: FiEdit },
    { id: "settings", label: "Nastavitve", icon: FiSettings },
  ];

  return (
    <>
      <Box minH="100vh" bg="gray.50">
        <Container maxW="8xl" py={8} px={{ base: 4, md: 6 }}>
          <Grid
            templateColumns={{ base: "1fr", lg: "280px 1fr" }}
            gap={6}
            alignItems="start"
          >
            <GridItem position={{ lg: "sticky" }} top={{ lg: "90px" }}>
              <VStack spacing={4} align="stretch">
                <Box
                  bg="white"
                  rounded="xl"
                  p={6}
                  boxShadow="0 4px 12px rgba(0, 0, 0, 0.05)"
                  border="1px solid"
                  borderColor="gray.100"
                >
                  <VStack spacing={4}>
                    <Avatar
                      name={user.username}
                      size="xl"
                      bg="brand.400"
                      color="white"
                    />
                    <VStack spacing={1}>
                      <Heading
                        size="md"
                        bgGradient="linear(135deg, #D94B8C 0%, #EC5F8C 50%, #F48FB1 100%)"
                        bgClip="text"
                        fontWeight="800"
                      >
                        {user.username}
                      </Heading>
                      <Text fontSize="sm" color="gray.600">{user.email}</Text>
                    </VStack>
                    <Divider />

                    <SimpleGrid columns={3} spacing={3} w="full">
                      <VStack spacing={0}>
                        <Text fontSize="xl" fontWeight="bold" color="brand.500">
                          {stats.totalPosts}
                        </Text>
                        <Text fontSize="xs" color="gray.600">Objave</Text>
                      </VStack>
                      <VStack spacing={0}>
                        <Text fontSize="xl" fontWeight="bold" color="red.500">
                          {stats.totalLikes}
                        </Text>
                        <Text fontSize="xs" color="gray.600">Lajki</Text>
                      </VStack>
                      <VStack spacing={0}>
                        <Text fontSize="xl" fontWeight="bold" color="blue.500">
                          {stats.totalComments}
                        </Text>
                        <Text fontSize="xs" color="gray.600">Komentarji</Text>
                      </VStack>
                    </SimpleGrid>
                  </VStack>
                </Box>

                <Box
                  bg="white"
                  rounded="xl"
                  p={3}
                  boxShadow="0 4px 12px rgba(0, 0, 0, 0.05)"
                  border="1px solid"
                  borderColor="gray.100"
                >
                  <VStack spacing={1} align="stretch">
                    {menuItems.map((item) => {
                      const Icon = item.icon;
                      const isActive = activeTab === item.id;
                      return (
                        <Button
                          key={item.id}
                          leftIcon={<Icon />}
                          variant="ghost"
                          justifyContent="flex-start"
                          fontWeight={isActive ? "600" : "500"}
                          color={isActive ? "brand.600" : "gray.700"}
                          bg={isActive ? "brand.50" : "transparent"}
                          _hover={{
                            bg: isActive ? "brand.100" : "gray.50",
                            color: "brand.600"
                          }}
                          rounded="lg"
                          onClick={() => setActiveTab(item.id)}
                        >
                          {item.label}
                        </Button>
                      );
                    })}
                  </VStack>
                </Box>
              </VStack>
            </GridItem>

            <GridItem>
              <VStack spacing={6} align="stretch">
                {activeTab === "overview" && (
                  <>
                    <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                      <Box
                        bg="white"
                        rounded="xl"
                        p={6}
                        boxShadow="0 4px 12px rgba(0, 0, 0, 0.05)"
                        border="1px solid"
                        borderColor="gray.100"
                        position="relative"
                        overflow="hidden"
                        cursor="pointer"
                        onClick={() => handleStatClick('posts')}
                        _hover={{
                          borderColor: "brand.300",
                          transform: "translateY(-2px)",
                          boxShadow: "0 8px 24px rgba(236, 95, 140, 0.15)"
                        }}
                        transition="all 0.2s"
                        _before={{
                          content: '""',
                          position: "absolute",
                          top: 0,
                          left: 0,
                          right: 0,
                          height: "4px",
                          bg: "brand.400"
                        }}
                      >
                        <Stat>
                          <HStack justify="space-between">
                            <Box>
                              <StatLabel color="gray.600" fontSize="sm" fontWeight="500">
                                Skupaj objav
                              </StatLabel>
                              <StatNumber fontSize="3xl" fontWeight="800" color="brand.500">
                                {stats.totalPosts}
                              </StatNumber>
                              <StatHelpText color="gray.500" fontSize="xs">
                                {activeDetailView === 'posts' ? 'Klikni za zapiranje' : 'Klikni za prikaz'}
                              </StatHelpText>
                            </Box>
                            <Box
                              p={3}
                              bg="brand.50"
                              rounded="lg"
                            >
                              <FiFileText size={24} color="#EC5F8C" />
                            </Box>
                          </HStack>
                        </Stat>
                      </Box>

                      <Box
                        bg="white"
                        rounded="xl"
                        p={6}
                        boxShadow="0 4px 12px rgba(0, 0, 0, 0.05)"
                        border="1px solid"
                        borderColor="gray.100"
                        position="relative"
                        overflow="hidden"
                        cursor="pointer"
                        onClick={() => handleStatClick('likes')}
                        _hover={{
                          borderColor: "red.300",
                          transform: "translateY(-2px)",
                          boxShadow: "0 8px 24px rgba(245, 101, 101, 0.15)"
                        }}
                        transition="all 0.2s"
                        _before={{
                          content: '""',
                          position: "absolute",
                          top: 0,
                          left: 0,
                          right: 0,
                          height: "4px",
                          bg: "red.400"
                        }}
                      >
                        <Stat>
                          <HStack justify="space-between">
                            <Box>
                              <StatLabel color="gray.600" fontSize="sm" fontWeight="500">
                                Skupaj všečkov
                              </StatLabel>
                              <StatNumber fontSize="3xl" fontWeight="800" color="red.500">
                                {stats.totalLikes}
                              </StatNumber>
                              <StatHelpText color="gray.500" fontSize="xs">
                                {activeDetailView === 'likes' ? 'Klikni za zapiranje' : 'Klikni za prikaz'}
                              </StatHelpText>
                            </Box>
                            <Box
                              p={3}
                              bg="red.50"
                              rounded="lg"
                            >
                              <FiHeart size={24} color="#F56565" />
                            </Box>
                          </HStack>
                        </Stat>
                      </Box>

                      <Box
                        bg="white"
                        rounded="xl"
                        p={6}
                        boxShadow="0 4px 12px rgba(0, 0, 0, 0.05)"
                        border="1px solid"
                        borderColor="gray.100"
                        position="relative"
                        overflow="hidden"
                        cursor="pointer"
                        onClick={() => handleStatClick('comments')}
                        _hover={{
                          borderColor: "blue.300",
                          transform: "translateY(-2px)",
                          boxShadow: "0 8px 24px rgba(66, 153, 225, 0.15)"
                        }}
                        transition="all 0.2s"
                        _before={{
                          content: '""',
                          position: "absolute",
                          top: 0,
                          left: 0,
                          right: 0,
                          height: "4px",
                          bg: "blue.400"
                        }}
                      >
                        <Stat>
                          <HStack justify="space-between">
                            <Box>
                              <StatLabel color="gray.600" fontSize="sm" fontWeight="500">
                                Skupaj komentarjev
                              </StatLabel>
                              <StatNumber fontSize="3xl" fontWeight="800" color="blue.500">
                                {stats.totalComments}
                              </StatNumber>
                              <StatHelpText color="gray.500" fontSize="xs">
                                {activeDetailView === 'comments' ? 'Klikni za zapiranje' : 'Klikni za prikaz'}
                              </StatHelpText>
                            </Box>
                            <Box
                              p={3}
                              bg="blue.50"
                              rounded="lg"
                            >
                              <FiMessageSquare size={24} color="#4299E1" />
                            </Box>
                          </HStack>
                        </Stat>
                      </Box>
                    </SimpleGrid>




                    {(!activeDetailView || activeDetailView === 'posts') && (
                      <Box
                        bg="white"
                        rounded="xl"
                        p={6}
                        boxShadow="0 4px 12px rgba(0, 0, 0, 0.05)"
                        border="1px solid"
                        borderColor="brand.200"
                        borderLeft="4px solid"
                        borderLeftColor="brand.500"
                      >
                        <Heading size="md" mb={4} color="gray.800">
                          Vse objave
                        </Heading>
                        <Divider mb={4} />

                        {postsLoading ? (
                          <VStack spacing={3} py={8}>
                            <Spinner size="lg" color="brand.500" />
                            <Text color="gray.600">Nalaganje objav...</Text>
                          </VStack>
                        ) : posts.length === 0 ? (
                          <VStack py={12} spacing={3}>
                            <FiFileText size={48} color="#CBD5E0" />
                            <Text color="gray.600" fontSize="lg" fontWeight="500">
                              Nimate še nobenih objav
                            </Text>
                            <Text color="gray.500" fontSize="sm">
                              Vaše objave se bodo tukaj prikazale
                            </Text>
                          </VStack>
                        ) : (
                          <VStack spacing={3} align="stretch">
                            {posts.map((post) => (
                              <Box
                                key={post.id}
                                p={4}
                                borderWidth="1px"
                                borderColor="gray.100"
                                borderRadius="lg"
                                bg="gray.50"
                                _hover={{
                                  bg: "brand.50",
                                  borderColor: "brand.200",
                                  transform: "translateX(4px)"
                                }}
                                transition="all 0.2s"
                                cursor="pointer"
                                onClick={() => navigate(`/?post=${post.id}`)}
                              >
                                <HStack spacing={3} align="start">
                                  <Box
                                    p={2}
                                    bg="brand.100"
                                    rounded="full"
                                    color="brand.500"
                                  >
                                    <FiFileText size={20} />
                                  </Box>
                                  <VStack align="start" spacing={1} flex={1}>
                                    <Text fontWeight="600" color="gray.800" fontSize="md">
                                      {post.title}
                                    </Text>
                                    <Text fontSize="sm" color="gray.600" noOfLines={2}>
                                      {post.content}
                                    </Text>
                                    <HStack spacing={4} fontSize="xs" color="gray.500">
                                      <HStack spacing={1}>
                                        <FiHeart size={12} />
                                        <Text>{post.likeCount || 0}</Text>
                                      </HStack>
                                      <HStack spacing={1}>
                                        <FiMessageSquare size={12} />
                                        <Text>{post.commentCount || 0}</Text>
                                      </HStack>
                                      <Text>{formatDate(post.createdAt)}</Text>
                                    </HStack>
                                  </VStack>
                                </HStack>
                              </Box>
                            ))}
                          </VStack>
                        )}
                      </Box>
                    )}



                    {activeDetailView === 'likes' && (
                      <Box
                        bg="white"
                        rounded="xl"
                        p={6}
                        boxShadow="0 4px 12px rgba(0, 0, 0, 0.05)"
                        border="1px solid"
                        borderColor="red.200"
                        borderLeft="4px solid"
                        borderLeftColor="red.500"
                      >
                        <HStack justify="space-between" mb={4}>
                          <Heading size="md" color="gray.800">
                            Vsi všečki
                          </Heading>
                        </HStack>
                        <Divider mb={4} />

                        {detailLoading ? (
                          <VStack spacing={3} py={8}>
                            <Spinner size="lg" color="red.500" />
                            <Text color="gray.600">Nalaganje lajkov...</Text>
                          </VStack>
                        ) : likesList.length === 0 ? (
                          <VStack py={12} spacing={3}>
                            <FiHeart size={48} color="#CBD5E0" />
                            <Text color="gray.600" fontSize="lg" fontWeight="500">
                              Nimate še nobenih lajkov
                            </Text>
                            <Text color="gray.500" fontSize="sm">
                              Ko nekdo lajka vašo objavo, se bo tukaj prikazalo
                            </Text>
                          </VStack>
                        ) : (
                          <VStack spacing={3} align="stretch">
                            {likesList.map((like) => (
                              <Box
                                key={like.likeId}
                                p={4}
                                borderWidth="1px"
                                borderColor="gray.100"
                                borderRadius="lg"
                                bg="gray.50"
                                _hover={{
                                  bg: "red.50",
                                  borderColor: "red.200",
                                  transform: "translateX(4px)"
                                }}
                                transition="all 0.2s"
                                cursor="pointer"
                                onClick={() => navigate(`/?post=${like.postId}`)}
                              >

                                <HStack spacing={3} align="start">
                                  <Box
                                    p={2}
                                    bg="red.100"
                                    rounded="full"
                                    color="red.500"
                                  >
                                    <FiHeart size={20} />
                                  </Box>
                                  <VStack align="start" spacing={1} flex={1}>
                                    <HStack spacing={2} wrap="wrap">
                                      <Text fontWeight="600" color="gray.800">
                                        {like.username}
                                      </Text>
                                      <Text color="gray.600">likes your post</Text>
                                      <Text fontWeight="600" color="brand.500">
                                        "{like.postTitle}"
                                      </Text>
                                    </HStack>
                                    <Text fontSize="xs" color="gray.500">
                                      {formatDate(like.likedAt)}
                                    </Text>
                                  </VStack>
                                </HStack>
                              </Box>
                            ))}
                          </VStack>
                        )}
                      </Box>
                    )}

                    {activeDetailView === 'comments' && (
                      <Box
                        bg="white"
                        rounded="xl"
                        p={6}
                        boxShadow="0 4px 12px rgba(0, 0, 0, 0.05)"
                        border="1px solid"
                        borderColor="blue.200"
                        borderLeft="4px solid"
                        borderLeftColor="blue.500"
                      >
                        <HStack justify="space-between" mb={4}>
                          <Heading size="md" color="gray.800">
                            Vsi komentarji na mojih objavah
                          </Heading>
                        </HStack>
                        <Divider mb={4} />

                        {detailLoading ? (
                          <VStack spacing={3} py={8}>
                            <Spinner size="lg" color="blue.500" />
                            <Text color="gray.600">Nalaganje komentarjev...</Text>
                          </VStack>
                        ) : commentsList.length === 0 ? (
                          <VStack py={12} spacing={3}>
                            <FiMessageSquare size={48} color="#CBD5E0" />
                            <Text color="gray.600" fontSize="lg" fontWeight="500">
                              Nimate še nobenih komentarjev
                            </Text>
                            <Text color="gray.500" fontSize="sm">
                              Ko nekdo komentira vašo objavo, se bo tukaj prikazalo
                            </Text>
                          </VStack>
                        ) : (
                          <VStack spacing={4} align="stretch">
                            {commentsList.map((comment) => (
                              <Box
                                key={comment.commentId}
                                p={5}
                                borderWidth="1px"
                                borderColor="gray.100"
                                borderRadius="lg"
                                bg="white"
                                _hover={{
                                  bg: "blue.50",
                                  borderColor: "blue.200",
                                  transform: "translateX(4px)"
                                }}
                                transition="all 0.2s"
                                cursor="pointer"
                                onClick={() => navigate(`/?post=${comment.postId}`)}
                              >
                                <VStack align="start" spacing={3}>
                                  <HStack justify="space-between" w="full">
                                    <HStack spacing={2}>
                                      <Box
                                        p={2}
                                        bg="blue.100"
                                        rounded="full"
                                        color="blue.500"
                                      >
                                        <FiMessageSquare size={18} />
                                      </Box>
                                      <VStack align="start" spacing={0}>
                                        <Text fontWeight="600" color="gray.800">
                                          {comment.commenterUsername}
                                        </Text>
                                        <Text fontSize="xs" color="gray.500">
                                          {formatDate(comment.commentedAt)}
                                        </Text>
                                      </VStack>
                                    </HStack>
                                  </HStack>

                                  <Box
                                    p={3}
                                    bg="gray.50"
                                    borderRadius="md"
                                    w="full"
                                  >
                                    <Text fontSize="sm" color="gray.700" lineHeight="1.6">
                                      {comment.content}
                                    </Text>
                                  </Box>

                                  <HStack spacing={2} fontSize="xs" color="gray.500">
                                    <Text>Na objavi:</Text>
                                    <Text fontWeight="600" color="brand.500">
                                      "{comment.postTitle}"
                                    </Text>
                                  </HStack>
                                </VStack>
                              </Box>
                            ))}
                          </VStack>
                        )}
                      </Box>
                    )}
                  </>
                )}

                {activeTab === "posts" && (
                  <Box
                    bg="white"
                    rounded="xl"
                    p={6}
                    boxShadow="0 4px 12px rgba(0, 0, 0, 0.05)"
                    border="1px solid"
                    borderColor="gray.100"
                  >
                    <Heading size="md" mb={4} color="gray.800">Urejanje objav</Heading>
                    <Divider mb={4} />

                    {editingPostId && (
                      <Box
                        bg="white"
                        rounded="xl"
                        p={6}
                        boxShadow="0 4px 12px rgba(0, 0, 0, 0.05)"
                        border="1px solid"
                        borderColor="brand.200"
                        borderLeft="4px solid"
                        borderLeftColor="brand.500"
                        mb={4}
                      >
                        <Heading size="md" mb={4} color="gray.800">Uredi objavo</Heading>
                        <Divider mb={4} />

                        <VStack spacing={4} align="stretch">
                          <FormControl isRequired>
                            <FormLabel>Naslov</FormLabel>
                            <Input
                              value={editPostData.title}
                              onChange={(e) => setEditPostData({ ...editPostData, title: e.target.value })}
                              focusBorderColor="brand.300"
                            />
                          </FormControl>

                          <FormControl isRequired>
                            <FormLabel>Vsebina</FormLabel>
                            <Textarea
                              value={editPostData.content}
                              onChange={(e) => setEditPostData({ ...editPostData, content: e.target.value })}
                              rows={6}
                              focusBorderColor="brand.300"
                            />
                          </FormControl>

                          <HStack spacing={3}>
                            <Button
                              onClick={() => handleSaveEditPost(editingPostId)}
                              bg="brand.500"
                              color="white"
                              _hover={{ bg: "brand.600" }}
                              isLoading={saving}
                            >
                              Shrani spremembe
                            </Button>
                            <Button
                              onClick={() => {
                                setEditingPostId(null);
                                setEditPostData({ title: "", content: "", categoryId: "" });
                              }}
                              variant="ghost"
                            >
                              Prekliči
                            </Button>
                          </HStack>
                        </VStack>
                      </Box>
                    )}
                    {postsLoading ? (
                      <VStack spacing={3}>
                        <Skeleton height="100px" />
                        <Skeleton height="100px" />
                        <Skeleton height="100px" />
                      </VStack>
                    ) : posts.length === 0 ? (
                      <VStack py={12} spacing={3}>
                        <FiFileText size={48} color="#CBD5E0" />
                        <Text color="gray.600" fontSize="lg" fontWeight="500">
                          Nimate še nobenih objav
                        </Text>
                        <Text color="gray.500" fontSize="sm">
                          Začnite s prvo objavo na forumu
                        </Text>
                        <Button
                          mt={2}
                          bgGradient="linear(135deg, #EC5F8C 0%, #F48FB1 100%)"
                          color="white"
                          _hover={{ bgGradient: "linear(135deg, #D94B8C 0%, #EC5F8C 100%)" }}
                          onClick={() => setActiveTab("newpost")}
                        >
                          Ustvari objavo
                        </Button>
                      </VStack>
                    ) : (
                      <VStack spacing={4} align="stretch">
                        {posts.map((post) => (
                          <Box
                            key={post.id}
                            p={5}
                            borderWidth="1px"
                            borderColor="gray.100"
                            borderRadius="lg"
                            _hover={{
                              bg: "gray.50",
                              borderColor: "brand.200",
                              transform: "translateY(-2px)",
                              boxShadow: "0 4px 12px rgba(236, 95, 140, 0.1)"
                            }}
                            transition="all 0.2s"
                          >
                            <HStack justify="space-between" align="start">
                              <VStack align="start" spacing={2} flex={1}>
                                <HStack spacing={2}>
                                  <Heading size="sm" color="gray.800">
                                    {post.title}
                                  </Heading>
                                  {post.categoryName && (
                                    <Badge colorScheme="pink">{post.categoryName}</Badge>
                                  )}
                                </HStack>
                                <Text fontSize="sm" color="gray.600" noOfLines={2}>
                                  {post.content}
                                </Text>
                                <HStack spacing={4} fontSize="sm" color="gray.500">
                                  <HStack>
                                    <FiHeart />
                                    <Text>{post.likeCount || 0} lajkov</Text>
                                  </HStack>
                                  <HStack>
                                    <FiMessageSquare />
                                    <Text>{post.commentCount || 0} komentarjev</Text>
                                  </HStack>
                                  <Text>•</Text>
                                  <Text>{formatDate(post.createdAt)}</Text>
                                </HStack>
                              </VStack>
                              <IconButton
                                icon={<FiEdit3 />}
                                aria-label="Uredi objavo"
                                variant="ghost"
                                colorScheme="blue"
                                size="sm"
                                onClick={() => {
                                  setEditingPostId(post.id);
                                  setEditPostData({
                                    title: post.title,
                                    content: post.content,
                                    categoryId: post.categoryId || ""
                                  });
                                }}
                              />
                              <IconButton
                                icon={<FiTrash2 />}
                                aria-label="Izbriši objavo"
                                variant="ghost"
                                colorScheme="red"
                                size="sm"
                                isLoading={deletingPostId === post.id}
                                onClick={() => handleDeletePost(post.id)}
                              />
                            </HStack>
                          </Box>
                        ))}
                      </VStack>
                    )}
                  </Box>
                )}

                {activeTab === "newpost" && (
                  <Box
                    bg="white"
                    rounded="xl"
                    p={6}
                    boxShadow="0 4px 12px rgba(0, 0, 0, 0.05)"
                    border="1px solid"
                    borderColor="gray.100"
                  >
                    <NovaObjava
                      apiBase={API_BASE}
                      onSuccess={async () => {
                        await fetchUserPosts();
                        setActiveTab("posts");
                      }}
                      onCancel={() => setActiveTab("overview")}
                      hideBackButton={true}
                      showInCard={false}
                    />
                  </Box>
                )}

                {activeTab === "settings" && (
                  <Box
                    bg="white"
                    rounded="xl"
                    p={6}
                    boxShadow="0 4px 12px rgba(0, 0, 0, 0.05)"
                    border="1px solid"
                    borderColor="gray.100"
                  >
                    <Heading size="md" mb={4} color="gray.800">Nastavitve profila</Heading>
                    <Divider mb={6} />

                    <VStack spacing={6} align="stretch">
                      <Box>
                        <HStack mb={3}>
                          <FiUser />
                          <Heading size="sm" color="gray.700">Osebni podatki</Heading>
                        </HStack>
                        <VStack spacing={3} align="stretch" pl={6}>
                          <HStack justify="space-between" p={3} bg="gray.50" rounded="lg">
                            <Box flex="1">
                              <Text fontSize="sm" color="gray.600">Uporabniško ime</Text>
                              {editingField === 'username' ? (
                                <Input
                                  value={formData.username}
                                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                  size="sm"
                                  mt={1}
                                  focusBorderColor="brand.300"
                                  autoFocus
                                />
                              ) : (
                                <Text fontWeight="600" mt={1}>{user.username}</Text>
                              )}
                            </Box>
                            {editingField === 'username' ? (
                              <HStack spacing={2}>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  colorScheme="gray"
                                  onClick={() => {
                                    setFormData({ ...formData, username: user.username });
                                    setEditingField(null);
                                  }}
                                >
                                  Prekliči
                                </Button>
                                <Button
                                  size="sm"
                                  bg="brand.500"
                                  color="white"
                                  _hover={{ bg: "brand.600" }}
                                  onClick={async () => {
                                    if (!formData.username.trim()) {
                                      toast({ status: "error", title: "Uporabniško ime je obvezno" });
                                      return;
                                    }
                                    await handleSaveField('username');
                                  }}
                                  isLoading={saving}
                                >
                                  Shrani
                                </Button>
                              </HStack>
                            ) : (
                              <Button
                                size="sm"
                                leftIcon={<FiEdit3 />}
                                variant="ghost"
                                colorScheme="brand"
                                onClick={() => setEditingField('username')}
                              >
                                Spremeni
                              </Button>
                            )}
                          </HStack>

                          <HStack justify="space-between" p={3} bg="gray.50" rounded="lg">
                            <Box flex="1">
                              <Text fontSize="sm" color="gray.600">Email</Text>
                              {editingField === 'email' ? (
                                <Box>
                                  <Input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    size="sm"
                                    mt={1}
                                    focusBorderColor="brand.300"
                                    autoFocus
                                  />
                                  {editingField === 'email' && formData.email.trim().toLowerCase() !== user.email?.trim().toLowerCase() && (
                                    <Text fontSize="xs" color="orange.600" mt={1} fontWeight="500">
                                      ⚠️ Sprememba emaila zahteva ponovno verifikacijo. Po spremembi boste odjavljeni.
                                    </Text>
                                  )}
                                </Box>
                              ) : (
                                <VStack align="start" spacing={1} mt={1}>
                                  <Text fontWeight="600">{user.email}</Text>
                                  {!user.email_verified && (
                                    <HStack spacing={1}>
                                      <Badge colorScheme="orange" fontSize="xs">
                                        Neverificiran
                                      </Badge>
                                      <Text fontSize="xs" color="orange.600">
                                        Preveri email za verifikacijsko povezavo
                                      </Text>
                                    </HStack>
                                  )}
                                </VStack>
                              )}
                            </Box>
                            {editingField === 'email' ? (
                              <HStack spacing={2}>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  colorScheme="gray"
                                  onClick={() => {
                                    setFormData({ ...formData, email: user.email });
                                    setEditingField(null);
                                  }}
                                >
                                  Prekliči
                                </Button>
                                <Button
                                  size="sm"
                                  bg="brand.500"
                                  color="white"
                                  _hover={{ bg: "brand.600" }}
                                  onClick={async () => {
                                    if (!formData.email.trim()) {
                                      toast({ status: "error", title: "Email je obvezen" });
                                      return;
                                    }
                                    await handleSaveField('email');
                                  }}
                                  isLoading={saving}
                                >
                                  Shrani
                                </Button>
                              </HStack>
                            ) : (
                              <Button
                                size="sm"
                                leftIcon={<FiEdit3 />}
                                variant="ghost"
                                colorScheme="brand"
                                onClick={() => setEditingField('email')}
                              >
                                Spremeni
                              </Button>
                            )}
                          </HStack>

                          <HStack justify="space-between" p={3} bg="gray.50" rounded="lg">
                            <Box flex="1">
                              <Text fontSize="sm" color="gray.600">Geslo</Text>
                              {editingField === 'password' ? (
                                <VStack spacing={2} align="stretch" mt={1}>
                                  <Input
                                    type="password"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    size="sm"
                                    placeholder="Novo geslo (vsaj 8 znakov)"
                                    focusBorderColor="brand.300"
                                    autoFocus
                                  />
                                  {formData.password && (
                                    <Input
                                      type="password"
                                      value={formData.confirmPassword}
                                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                      size="sm"
                                      placeholder="Potrdi novo geslo"
                                      focusBorderColor="brand.300"
                                    />
                                  )}
                                </VStack>
                              ) : (
                                <Text fontWeight="600" mt={1} color="gray.400">••••••••</Text>
                              )}
                            </Box>
                            {editingField === 'password' ? (
                              <HStack spacing={2}>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  colorScheme="gray"
                                  onClick={() => {
                                    setFormData({ ...formData, password: "", confirmPassword: "" });
                                    setEditingField(null);
                                  }}
                                >
                                  Prekliči
                                </Button>
                                <Button
                                  size="sm"
                                  bg="brand.500"
                                  color="white"
                                  _hover={{ bg: "brand.600" }}
                                  onClick={async () => {
                                    if (formData.password && formData.password.length < 8) {
                                      toast({ status: "error", title: "Geslo mora biti vsaj 8 znakov dolgo" });
                                      return;
                                    }
                                    if (formData.password && formData.password !== formData.confirmPassword) {
                                      toast({ status: "error", title: "Gesli se ne ujemata" });
                                      return;
                                    }
                                    await handleSaveField('password');
                                  }}
                                  isLoading={saving}
                                >
                                  Shrani
                                </Button>
                              </HStack>
                            ) : (
                              <Button
                                size="sm"
                                leftIcon={<FiEdit3 />}
                                variant="ghost"
                                colorScheme="brand"
                                onClick={() => setEditingField('password')}
                              >
                                Spremeni
                              </Button>
                            )}
                          </HStack>

                          <HStack justify="space-between" align="flex-start" p={3} bg="gray.50" rounded="lg">
                            <Box flex="1">
                              <Text fontSize="sm" color="gray.600">BIO</Text>
                              {editingField === 'bio' ? (
                                <VStack spacing={2} align="stretch" mt={1}>
                                  <Textarea
                                    value={formData.bio || ""}
                                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                    placeholder="Napišite nekaj o sebi..."
                                    rows={6}
                                    size="sm"
                                    focusBorderColor="brand.300"
                                    resize="vertical"
                                    maxLength={500}
                                  />
                                  <Text fontSize="xs" color="gray.500" textAlign="right">
                                    {(formData.bio || "").length}/500 znakov
                                  </Text>
                                </VStack>
                              ) : (
                                <Text fontSize="sm" color="gray.600" mt={1} whiteSpace="pre-wrap" fontWeight={user?.bio ? "600" : "400"}>
                                  {user?.bio || <Text as="span" fontStyle="italic" color="gray.400" fontWeight="400">Ni dodanega BIO-ja</Text>}
                                </Text>
                              )}
                            </Box>
                            {editingField === 'bio' ? (
                              <HStack spacing={2}>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  colorScheme="gray"
                                  onClick={() => {
                                    setEditingField(null);
                                    setFormData({
                                      ...formData,
                                      bio: user?.bio || ""
                                    });
                                  }}
                                  isDisabled={saving}
                                >
                                  Prekliči
                                </Button>
                                <Button
                                  size="sm"
                                  bg="brand.500"
                                  color="white"
                                  _hover={{ bg: "brand.600" }}
                                  onClick={async () => {
                                    await handleSaveField('bio');
                                  }}
                                  isLoading={saving}
                                >
                                  Shrani
                                </Button>
                              </HStack>
                            ) : (
                              <Button
                                size="sm"
                                leftIcon={<FiEdit3 />}
                                variant="ghost"
                                colorScheme="brand"
                                onClick={() => setEditingField('bio')}
                              >
                                Spremeni
                              </Button>
                            )}
                          </HStack>
                        </VStack>
                      </Box>

                      <Divider />

                      <Box>
                        <HStack mb={3}>
                          <FiSettings />
                          <Heading size="sm" color="gray.700">Dejanja</Heading>
                        </HStack>
                        <VStack spacing={2} align="stretch" pl={6}>
                          <Button
                            variant="outline"
                            colorScheme="red"
                            justifyContent="flex-start"
                            leftIcon={<FiTrash2 />}
                            onClick={handleDeleteAccount}
                          >
                            Izbriši račun
                          </Button>
                        </VStack>
                      </Box>
                    </VStack>
                  </Box>
                )}
              </VStack>
            </GridItem>
          </Grid>
        </Container>
      </Box>
      <Box display={{ base: "none", md: "block" }}>
        <Footer />
      </Box>
    </>
  );
};

export default Profile;

