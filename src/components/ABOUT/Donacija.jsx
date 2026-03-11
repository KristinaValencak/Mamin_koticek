import React from "react";
import {
  Box,
  Container,
  SimpleGrid,
  Heading,
  Text,
  Stack,
  Button,
  Image,
} from "@chakra-ui/react";
import { motion } from "framer-motion";
import { FaCoffee } from "react-icons/fa";
import donacijeImg from "../../assets/donacije.png";

const MotionBox = motion(Box);
const MotionImage = motion(Image);

const Donacija = () => {
  return (
    <Box 
      as="section" 
      id="donacija" 
      py={{ base: 20, md: 28 }} 
      bg="linear-gradient(180deg, #FFFFFF 0%, #FFF5F8 100%)"
    >
      <Container maxW="container.xl">
        <SimpleGrid
          columns={{ base: 1, lg: 2 }}
          spacing={{ base: 12, md: 20 }}
          alignItems="center"
        >
          <MotionBox
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            viewport={{ once: true }}
          >
            <Stack spacing={6}>
              <Heading
                as="h2"
                fontSize={{ base: "2.2rem", md: "2.8rem" }}
                lineHeight="1.2"
                fontWeight="extrabold"
                color="#2D2D2D"
              >
                Podpri Mamin kotiček
              </Heading>

              <Text
                fontSize={{ base: "md", md: "lg" }}
                color="#5F5F5F"
                lineHeight="1.8"
              >
                Donacije so prostovoljne in pomagajo, da forum lahko še naprej raste ter dodaja nove funkcionalnosti in vsebine za vas. 
                Hvala za vašo podporo – vsak prispevek pomaga, da forum ostane prijazen, varen in brezplačen za vse mamice. 💕
              </Text>

              <Button
                as="a"
                href="https://buymeacoffee.com/maminkoticek"
                target="_blank"
                rel="noopener noreferrer"
                size="lg"
                rounded="full"
                px={8}
                py={6}
                bg="linear-gradient(135deg, #EC5F8C, #F48FB1)"
                color="white"
                fontWeight="600"
                fontSize={{ base: "md", md: "lg" }}
                leftIcon={<FaCoffee />}
                boxShadow="0 10px 25px rgba(236, 95, 140, 0.35)"
                _hover={{
                  transform: "translateY(-3px)",
                  boxShadow: "0 14px 35px rgba(236, 95, 140, 0.45)",
                  bg: "linear-gradient(135deg, #D94B8C, #EC5F8C)",
                }}
                transition="all 0.3s ease"
                alignSelf="flex-start"
              >
                Podpri nas z donacijo
              </Button>
            </Stack>
          </MotionBox>

          <MotionBox
            initial={{ opacity: 0, scale: 0.96 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.15 }}
            viewport={{ once: true }}
            display="flex"
            justifyContent="center"
            alignItems="center"
          >
            <MotionBox
              as="a"
              href="https://buymeacoffee.com/maminkoticek"
              target="_blank"
              rel="noopener noreferrer"
              bg="white"
              rounded="3xl"
              p={{ base: 4, md: 5 }}
              boxShadow="0 25px 60px rgba(236, 95, 140, 0.28), 0 10px 30px rgba(0, 0, 0, 0.12)"
              overflow="hidden"
              maxW={{ base: "95%", md: "480px", lg: "550px" }}
              mx="auto"
              cursor="pointer"
              initial={{ rotate: -1.5 }}
              animate={{
                y: [0, -15, 0],
                rotate: [-1.5, -0.5, -1.5],
              }}
              transition={{
                y: {
                  duration: 5,
                  repeat: Infinity,
                  ease: "easeInOut",
                },
                rotate: {
                  duration: 5,
                  repeat: Infinity,
                  ease: "easeInOut",
                },
              }}
              whileHover={{
                y: -20,
                rotate: 0,
                scale: 1.04,
                boxShadow: "0 35px 80px rgba(236, 95, 140, 0.4), 0 15px 40px rgba(0, 0, 0, 0.18)",
                transition: { duration: 0.3 },
              }}
            >
              <MotionImage
                src={donacijeImg}
                alt="Donacije za Mamin kotiček - sporočila donatorjev"
                w="100%"
                h="auto"
                maxH="520px"
                rounded="2xl"
                objectFit="contain"
                
              />
            </MotionBox>
          </MotionBox>
        </SimpleGrid>
      </Container>
    </Box>
  );
};

export default Donacija;