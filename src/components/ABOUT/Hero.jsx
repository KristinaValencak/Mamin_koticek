import React from "react";
import { Box, Container, VStack, Heading, Text, Button, Stack } from "@chakra-ui/react";
import { motion, useReducedMotion } from "framer-motion";
import { Link as RouterLink } from "react-router-dom";
import heroBgImage from "../../assets/hero-bg-image.avif";
const MotionRouterLink = motion(RouterLink);
const MotionHeading = motion(Heading);
const MotionText = motion(Text);

const Hero = () => {
  const prefersReducedMotion = useReducedMotion();
  const ACCENT = "#F06292";
  const ACCENT_HOVER = "#D94B8C";
  const TEXT_SECONDARY = "#4A4A4A";
  const BLUR_BUBBLE = "#FFD6E7";
  const WHITE = "#FFFFFF"

  return (
    <Box
      as="section"
      id="domov"
      position="relative"
      overflow="hidden"
      color={TEXT_SECONDARY}
      backgroundImage={`url(${heroBgImage})`}
      backgroundSize="cover"
      backgroundPosition="center"
      backgroundRepeat="no-repeat"
      minH={{ base: "100vh", md: "100vh" }}
    >
      <Box
        position="absolute"
        top="0"
        left="0"
        right="0"
        bottom="0"
        bg="rgba(0, 0, 0, 0.24)"
        zIndex={0}
      />
      <Box aria-hidden position="absolute" right="-10%" top="-10%" w={{ base: "72", md: "96" }} h={{ base: "72", md: "96" }} bg={BLUR_BUBBLE} rounded="full" filter="blur(110px)" opacity={0.6} zIndex={1} />

      <Container maxW="container.lg" position="relative" zIndex={2} pt={{ base: 20, md: 32 }} pb={{ base: 24, md: 40 }} textAlign="center">
        <VStack spacing={{ base: 6, md: 8 }}>
          <MotionHeading fontSize={{ base: "3xl", md: "6xl" }} fontWeight="extrabold" lineHeight="1.1" color={WHITE} initial={prefersReducedMotion ? undefined : { opacity: 0, y: 24 }} animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>Dobrodošla v Maminem kotičku</MotionHeading>
          <MotionText fontSize={{ base: "md", md: "xl" }} maxW="2xl" mx="auto" color={WHITE} initial={prefersReducedMotion ? undefined : { opacity: 0, y: 18 }} animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.1 }}>Tvoj prostor za pogovor, podporo in deljenje vsakdanjih čudežev materinstva. Tukaj nisi nikoli sama – pridruži se mamicam, ki razumejo. 💕</MotionText>
          <Stack direction={{ base: "column", sm: "row" }} spacing={4} justify="center">
            <Button as={MotionRouterLink} to="/" whileTap={prefersReducedMotion ? undefined : { scale: 0.97 }} size="lg" rounded="full" px={8} bg={ACCENT} color="white" _hover={{ bg: ACCENT_HOVER }} boxShadow="0 8px 24px rgba(240, 98, 146, 0.35)">Vstopi v kotiček</Button>
          </Stack>
          <Text id="main" fontSize="sm" color={WHITE}>Brezplačno članstvo – varen prostor za vse mame</Text>
        </VStack>
      </Container>
    </Box>
  );
};

export default Hero;
