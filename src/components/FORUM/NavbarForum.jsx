import { useEffect, useMemo, useState, useCallback } from "react";
import { Box, Flex, HStack, VStack, IconButton, Button, Image, Link, Heading, Menu, MenuButton, MenuList, MenuItem, Avatar, Text, Stack, useDisclosure, Drawer, DrawerOverlay, DrawerContent, DrawerHeader, DrawerBody, DrawerCloseButton, Container, Divider, Badge, useBreakpointValue } from "@chakra-ui/react";
import { HamburgerIcon, CloseIcon, ChevronDownIcon, BellIcon, AddIcon } from "@chakra-ui/icons";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import Logo from "../../assets/Logo.png";
import { FiUser, FiLogOut, FiSettings } from "react-icons/fi";
import { API_BASE } from "../../api/config";
import { getStoredUser } from "../../utils/helpers";

const links = [
  { label: "O nas", to: "/o-nas" },
  { label: "Forum", to: "/" },
  { label: "Nasveti", href: "#nasveti" },
  { label: "Kontakt", href: "#kontakt" }
];

const NavbarForum = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [user, setUser] = useState(getStoredUser());
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();
  const headingSize = useBreakpointValue({ base: "sm", md: "md" });
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notificationsLoading, setNotificationsLoading] = useState(false);

  const handleCreatePost = useCallback(() => {
    navigate("/?new=true");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [navigate]);

  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    try {
      setNotificationsLoading(true);
      const res = await fetch(`${API_BASE}/api/notifications`, { credentials: 'include' });
      if (!res.ok) throw new Error("Napaka pri branju notifikacij");
      const data = await res.json();
      setNotifications(data.items || []);
      setUnreadCount(data.unreadCount || 0);
    } catch (err) {
      console.error(err);
    } finally {
      setNotificationsLoading(false);
    }
  }, [user]);

  const markAsRead = useCallback(async (notificationId) => {
    try {
      const res = await fetch(`${API_BASE}/api/notifications/${notificationId}/read`, { method: "PUT", credentials: 'include' });
      if (res.ok) {
        setNotifications(prev => prev.map(n => n.id === notificationId ? { ...n, read: true } : n));
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [user, fetchNotifications]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
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

  const handleLogout = useCallback(async () => {
    try {
      await fetch(`${API_BASE}/api/logout`, { method: "POST", credentials: 'include' });
    } catch (err) {
      console.error("Napaka pri odjavi:", err);
    }
    localStorage.removeItem("user");
    window.dispatchEvent(new Event("auth-changed"));
    setUser(null);
    navigate("/");
  }, [navigate]);

  const displayName = useMemo(() => {
    if (!user?.username) return "";
    return user.username.length > 15 ? user.username.slice(0, 14) + "…" : user.username;
  }, [user]);

  const Left = (
    <HStack spacing={3} minW={0} flexShrink={1}>
      <Link as={RouterLink} to="/" _hover={{ transform: "scale(1.05)", transition: "all 0.2s" }}>
        <Image src={Logo} alt="Mamin kotiček" boxSize={{ base: "40px", md: "52px" }} objectFit="contain" transition="transform 0.2s" />
      </Link>
      <Heading as={RouterLink} to="/" size={headingSize} color="white" whiteSpace="nowrap" _hover={{ opacity: 0.9 }} transition="opacity 0.2s">Mamin kotiček</Heading>
    </HStack>
  );

  const RightAuth = user ? (
    <HStack spacing={{ base: 2, md: 3 }}>
      <Button size="sm" leftIcon={<AddIcon boxSize={3} />} onClick={handleCreatePost} bg="white" color="brand.500" fontWeight="600" px={3} h={{ base: "36px", md: "38px" }} fontSize="sm" rounded="full" boxShadow="0 4px 12px rgba(255, 255, 255, 0.3)" _hover={{ bg: "rgba(255, 255, 255, 0.95)", transform: "translateY(-2px)", boxShadow: "0 6px 20px rgba(255, 255, 255, 0.4)" }} _active={{ transform: "translateY(0)", boxShadow: "0 2px 8px rgba(255, 255, 255, 0.3)" }} transition="all 0.2s cubic-bezier(0.4, 0, 0.2, 1)">
        <Text display={{ base: "none", md: "inline" }}>Objava</Text>
        <Text display={{ base: "inline", md: "none" }}>Nova</Text>
      </Button>
      <Menu placement="bottom-end">
        <Box position="relative">
          <MenuButton as={IconButton} icon={<BellIcon />} variant="ghost" color="white" size="md" _hover={{ bg: "rgba(255, 255, 255, 0.15)" }} _active={{ bg: "rgba(255, 255, 255, 0.2)" }} />
          {unreadCount > 0 && (
            <Badge position="absolute" top="-2px" right="-2px" bg="red.500" color="white" borderRadius="full" fontSize="xs" minW="18px" h="18px" display="flex" alignItems="center" justifyContent="center" boxShadow="0 2px 4px rgba(0,0,0,0.2)" border="2px solid" borderColor="white">{unreadCount > 99 ? '99+' : unreadCount}</Badge>
          )}
        </Box>
        <MenuList maxH="400px" overflowY="auto" minW="320px">
          <Box px={4} py={2} borderBottom="1px solid" borderColor="gray.200">
            <HStack justify="space-between">
              <Heading size="sm">Obvestila</Heading>
              {unreadCount > 0 && <Button size="xs" onClick={() => {/* mark all as read */ }}>Označi vse kot prebrane</Button>}
            </HStack>
          </Box>
          {notificationsLoading ? (
            <Box p={4} textAlign="center"><Text color="gray.500">Nalaganje...</Text></Box>
          ) : notifications.length === 0 ? (
            <Box p={4} textAlign="center"><Text color="gray.500">Nimate obvestil</Text></Box>
          ) : (
            <VStack spacing={0} align="stretch">
              {notifications.map((notif) => (
                <MenuItem key={notif.id} onClick={() => { markAsRead(notif.id); navigate(`/?post=${notif.postId}`); }} bg={notif.read ? "white" : "brand.50"} _hover={{ bg: "gray.50" }}>
                  <HStack spacing={3} w="full">
                    <Avatar name={notif.actorUsername} size="sm" />
                    <VStack align="start" spacing={0} flex={1}>
                      <Text fontSize="sm"><strong>{notif.actorUsername}</strong> {notif.type === "like" ? "je lajkal/a" : "je komentiral/a"} tvojo objavo</Text>
                      <Text fontSize="xs" color="gray.500" noOfLines={1}>{notif.postTitle}</Text>
                    </VStack>
                    {!notif.read && <Box w="8px" h="8px" bg="brand.500" borderRadius="full" />}
                  </HStack>
                </MenuItem>
              ))}
            </VStack>
          )}
        </MenuList>
      </Menu>
      <Menu placement="bottom-end">
        <MenuButton as={Button} rightIcon={<ChevronDownIcon color="white" />} variant="ghost" px={2} h={{ base: "36px", md: "38px" }} rounded="full" _hover={{ bg: "rgba(255, 255, 255, 0.15)" }} _active={{ bg: "rgba(255, 255, 255, 0.2)" }} transition="all 0.2s">
          <HStack spacing={2}>
            <Avatar name={user.username} size="sm" bg="white" color="brand.500" />
            <Text fontWeight="600" color="white" fontSize="sm" display={{ base: "none", lg: "block" }}>{displayName}</Text>
          </HStack>
        </MenuButton>
        <MenuList boxShadow="0 20px 40px rgba(0, 0, 0, 0.12)" border="1px solid" borderColor="gray.100" rounded="xl" py={2} minW="200px">
          <Box px={3} py={2} mb={2}>
            <Text fontWeight="600" fontSize="sm" color="gray.700">{user.username}</Text>
            <Text fontSize="xs" color="gray.500">{user.email}</Text>
          </Box>
          <Divider mb={2} />
          <MenuItem as={RouterLink} to="/profile" icon={<FiUser />} rounded="md" mx={2} fontSize="sm" _hover={{ bg: "brand.50", color: "brand.600" }}>Moj profil</MenuItem>
          <MenuItem icon={<FiSettings />} rounded="md" mx={2} fontSize="sm" _hover={{ bg: "brand.50", color: "brand.600" }}>Nastavitve</MenuItem>
          <Divider my={2} />
          <MenuItem onClick={handleLogout} icon={<FiLogOut />} color="red.600" rounded="md" mx={2} fontSize="sm" _hover={{ bg: "red.50" }}>Odjava</MenuItem>
        </MenuList>
      </Menu>
    </HStack>
  ) : (
    <HStack spacing={{ base: 2, md: 3 }}>
      <Button as={RouterLink} to="/registracija" variant="ghost" size={{ base: "sm", md: "md" }} fontWeight="600" color="white" rounded="full" _hover={{ bg: "rgba(255, 255, 255, 0.15)" }}>Registracija</Button>
      <Button as={RouterLink} to="/prijava" bg="white" color="brand.500" size={{ base: "sm", md: "md" }} fontWeight="600" px={{ base: 4, md: 6 }} rounded="full" boxShadow="0 4px 12px rgba(255, 255, 255, 0.3)" _hover={{ bg: "rgba(255, 255, 255, 0.95)", transform: "translateY(-2px)", boxShadow: "0 6px 20px rgba(255, 255, 255, 0.4)" }} _active={{ transform: "translateY(0)", boxShadow: "0 2px 8px rgba(255, 255, 255, 0.3)" }} transition="all 0.2s cubic-bezier(0.4, 0, 0.2, 1)">Prijava</Button>
    </HStack>
  );

  return (
    <Box as="nav" bgGradient="linear(to-r, brand.500, brand.600)" backdropFilter="blur(12px)" position="sticky" top="0" zIndex="1000" boxShadow={scrolled ? "0 8px 32px rgba(236, 95, 140, 0.35), 0 4px 16px rgba(0, 0, 0, 0.12)" : "0 4px 20px rgba(236, 95, 140, 0.25), 0 2px 8px rgba(0, 0, 0, 0.08)"} borderBottom="1px solid" borderColor="rgba(255, 255, 255, 0.2)" transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)" _after={{ content: '""', position: 'absolute', bottom: 0, left: 0, right: 0, height: '1px', bgGradient: 'linear(90deg, transparent 0%, rgba(255, 255, 255, 0.3) 50%, transparent 100%)' }}>
      <Container maxW="8xl" mx="auto" px={{ base: 4, md: 6 }}>
        <Flex align="center" h={{ base: "68px", md: "76px" }} justify="space-between">
          {Left}
          <HStack as="nav" aria-label="Glavna navigacija" spacing={8} display={{ base: "none", md: "flex" }} flex="1" justify="center">
            {links.map((l) => l.to ? (
              <Link key={l.label} as={RouterLink} to={l.to} color="white" fontWeight="500" fontSize="md" position="relative" _hover={{ color: "white", textDecoration: "none", _after: { width: "100%" } }} _after={{ content: '""', position: "absolute", bottom: "-4px", left: "0", width: "0", height: "2px", bg: "white", transition: "width 0.3s ease" }}>{l.label}</Link>
            ) : (
              <Link key={l.label} href={l.href} color="white" fontWeight="500" fontSize="md" position="relative" _hover={{ color: "white", textDecoration: "none", _after: { width: "100%" } }} _after={{ content: '""', position: "absolute", bottom: "-4px", left: "0", width: "0", height: "2px", bg: "white", transition: "width 0.3s ease" }}>{l.label}</Link>
            ))}
          </HStack>
          <HStack spacing={4} display={{ base: "none", md: "flex" }}>{RightAuth}</HStack>
          <HStack spacing={2} display={{ base: "flex", md: "none" }}>
            {user && (
              <Menu placement="bottom-end">
                <MenuButton as={IconButton} icon={<Avatar name={user.username} size="sm" bg="white" color="brand.500" />} variant="ghost" rounded="full" aria-label="Uporabniški meni" _hover={{ bg: "rgba(255, 255, 255, 0.15)" }} />
                <MenuList boxShadow="0 20px 40px rgba(0, 0, 0, 0.12)" border="1px solid" borderColor="gray.100" rounded="xl">
                  <MenuItem as={RouterLink} to="/profile" icon={<FiUser />}>Profil</MenuItem>
                  <MenuItem onClick={handleLogout} color="red.600" icon={<FiLogOut />}>Odjava</MenuItem>
                </MenuList>
              </Menu>
            )}
            <IconButton aria-label={isOpen ? "Zapri meni" : "Odpri meni"} icon={isOpen ? <CloseIcon boxSize={4} /> : <HamburgerIcon boxSize={5} />} variant="ghost" color="white" rounded="lg" _hover={{ bg: "rgba(255, 255, 255, 0.15)" }} onClick={isOpen ? onClose : onOpen} size="md" />
          </HStack>
        </Flex>
      </Container>
      <Drawer placement="right" isOpen={isOpen} onClose={onClose} size="xs">
        <DrawerOverlay bg="rgba(0, 0, 0, 0.4)" backdropFilter="blur(4px)" />
        <DrawerContent bgGradient="linear(to-r, brand.500, brand.600)" boxShadow="0 0 60px rgba(236, 95, 140, 0.4)" color="white">
          <DrawerCloseButton mt={4} mr={2} color="white" _hover={{ bg: "rgba(255, 255, 255, 0.15)" }} rounded="lg" />
          <DrawerHeader borderBottomWidth="1px" borderColor="rgba(255, 255, 255, 0.2)" pb={4}>
            <HStack spacing={3}>
              <Image src={Logo} alt="" boxSize="32px" filter="brightness(0) invert(1)" />
              <Text fontSize="lg" fontWeight="700" color="white">Mamin kotiček</Text>
            </HStack>
          </DrawerHeader>
          <DrawerBody pt={4}>
            <Stack spacing={2}>
              {links.map((l) => l.to ? (
                <Button key={l.label} as={RouterLink} to={l.to} onClick={onClose} variant="ghost" justifyContent="flex-start" color="white" fontWeight="500" _hover={{ bg: "rgba(255, 255, 255, 0.15)", transform: "translateX(4px)" }} _active={{ bg: "rgba(255, 255, 255, 0.25)" }} rounded="lg" height="44px" transition="all 0.2s">{l.label}</Button>
              ) : (
                <Button key={l.label} as="a" href={l.href} onClick={onClose} variant="ghost" justifyContent="flex-start" color="white" fontWeight="500" _hover={{ bg: "rgba(255, 255, 255, 0.15)", transform: "translateX(4px)" }} _active={{ bg: "rgba(255, 255, 255, 0.25)" }} rounded="lg" height="44px" transition="all 0.2s">{l.label}</Button>
              ))}
              <Divider my={2} borderColor="rgba(255, 255, 255, 0.2)" />
              {user ? (
                <>
                  <Button leftIcon={<AddIcon />} onClick={() => { onClose(); navigate("/?new=true"); window.scrollTo({ top: 0, behavior: "smooth" }); }} bg="white" color="brand.500" fontWeight="600" _hover={{ bg: "rgba(255, 255, 255, 0.95)" }} rounded="xl" h="48px" w="full" boxShadow="0 4px 12px rgba(255, 255, 255, 0.3)" transition="all 0.2s">Ustvari objavo</Button>
                  <Divider my={2} borderColor="rgba(255, 255, 255, 0.2)" />
                  <Button as={RouterLink} to="/profile" onClick={onClose} leftIcon={<FiUser />} variant="ghost" color="white" justifyContent="flex-start" fontWeight="500" _hover={{ bg: "rgba(255, 255, 255, 0.15)" }} rounded="lg" h="44px">Moj profil</Button>
                  <Button leftIcon={<FiSettings />} variant="ghost" color="white" justifyContent="flex-start" fontWeight="500" _hover={{ bg: "rgba(255, 255, 255, 0.15)" }} rounded="lg" h="44px">Nastavitve</Button>
                  <Divider my={2} borderColor="rgba(255, 255, 255, 0.2)" />
                  <Button onClick={() => { handleLogout(); onClose(); }} leftIcon={<FiLogOut />} variant="ghost" justifyContent="flex-start" color="white" fontWeight="500" _hover={{ bg: "rgba(255, 255, 255, 0.15)" }} rounded="lg" h="44px">Odjava</Button>
                </>
              ) : (
                <>
                  <Button as={RouterLink} to="/registracija" onClick={onClose} variant="ghost" color="white" justifyContent="flex-start" fontWeight="500" _hover={{ bg: "rgba(255, 255, 255, 0.15)" }} rounded="lg" h="44px">Registracija</Button>
                  <Button as={RouterLink} to="/prijava" onClick={onClose} bg="white" color="brand.500" fontWeight="600" _hover={{ bg: "rgba(255, 255, 255, 0.95)" }} rounded="xl" h="48px" w="full" boxShadow="0 4px 12px rgba(255, 255, 255, 0.3)">Prijava</Button>
                </>
              )}
            </Stack>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </Box>
  );
};

export default NavbarForum;
