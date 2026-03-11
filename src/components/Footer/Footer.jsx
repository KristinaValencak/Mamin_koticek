import React from "react";
import { Box, Container, SimpleGrid, Stack, Text, Link, Button, Icon, HStack, Image } from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";
import { motion } from "framer-motion";
import { FaTiktok, FaInstagram } from "react-icons/fa";
import LogoBlack from "../../assets/LogoBlack.png";

const MotionBox = motion.create(Box);

const Footer = () => {
  return (
    <Box as="footer" bg="linear-gradient(180deg, #FFE0EB 0%, #FFD6E6 40%, #FFCCE0 100%)" py={{ base: 14, md: 20 }} borderTop="2px solid" borderColor="#EC5F8C">
      <Container maxW="container.xl">
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={{ base: 10, md: 16 }}>

          <MotionBox initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} viewport={{ once: true }}>
            <Stack spacing={5}>
              <HStack spacing={3}>
                <Image src={LogoBlack} alt="Mamin kotiček" boxSize="52px" />
                <Text fontWeight="bold" fontSize="lg" color="gray.800">Mamin kotiček</Text>
              </HStack>

              <Text fontSize="sm" color="gray.600" maxW="sm" lineHeight="1.7">
                Mamin kotiček je varen prostor za vse mamice, kjer delimo izkušnje, podporo in toplino – ker je materinstvo lažje skupaj.
              </Text>

              <Text fontSize="sm" color="gray.600">Email: maminkoticek@gmail.com</Text>

              <Button as={RouterLink} to="/" rounded="full" px={8} bg="linear-gradient(135deg, #EC5F8C, #F48FB1)" color="white"
                boxShadow="0 10px 25px rgba(236, 95, 140, 0.35)"
                _hover={{ transform: "translateY(-2px)", boxShadow: "0 14px 30px rgba(236, 95, 140, 0.45)", bg: "linear-gradient(135deg, #D94B8C, #EC5F8C)" }}
                _active={{ bg: "linear-gradient(135deg, #C73A7A, #D94B8C)" }}
                transition="all .25s ease" alignSelf="flex-start">
                Vstopi v kotiček
              </Button>
            </Stack>
          </MotionBox>

          {/* DESNI DEL */}
          <MotionBox initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }} viewport={{ once: true }}>
            <SimpleGrid columns={{ base: 2, sm: 3 }} spacing={6} mt={{ base: 6, md: 14 }}>
              <Stack spacing={2} fontSize="sm">
                <Link as={RouterLink} to="/" color="gray.700" _hover={{ color: "#EC5F8C", transform: "translateX(2px)" }} transition="all .2s">Forum</Link>
                <Link as={RouterLink} to="/registracija" color="gray.700" _hover={{ color: "#EC5F8C", transform: "translateX(2px)" }} transition="all .2s">Registracija</Link>
                <Link as={RouterLink} to="/prijava" color="gray.700" _hover={{ color: "#EC5F8C", transform: "translateX(2px)" }} transition="all .2s">Prijava</Link>
              </Stack>

              <Stack spacing={2} fontSize="sm">
                <Link color="gray.700" _hover={{ color: "#EC5F8C" }}>Pogosta vprašanja</Link>
                <Link color="gray.700" _hover={{ color: "#EC5F8C" }}>Podpora</Link>
                <Link color="gray.700" _hover={{ color: "#EC5F8C" }}>Prijava vsebine</Link>
                <Link color="gray.700" _hover={{ color: "#EC5F8C" }}>Vodnik za nove</Link>
              </Stack>

              <Stack spacing={2} fontSize="sm">
                <Link as={RouterLink} to="/pogoji-uporabe" color="gray.700" _hover={{ color: "#EC5F8C", transform: "translateX(2px)" }} transition="all .2s">Pogoji uporabe</Link>
                <Link as={RouterLink} to="/politika-zasebnosti" color="gray.700" _hover={{ color: "#EC5F8C", transform: "translateX(2px)" }} transition="all .2s">Politika zasebnosti</Link>
                <Link as={RouterLink} to="/politika-piskotkov" color="gray.700" _hover={{ color: "#EC5F8C", transform: "translateX(2px)" }} transition="all .2s">Politika piškotkov</Link>
              </Stack>
            </SimpleGrid>
          </MotionBox>
        </SimpleGrid>

        <HStack spacing={4} justify="center" mt={16}>
          {[FaTiktok, FaInstagram].map((I, i) => (
            <Link key={i} href="#" isExternal>
              <Box p={3} bg="white" rounded="full" boxShadow="0 2px 8px rgba(236, 95, 140, 0.15)" border="1px solid" borderColor="rgba(236, 95, 140, 0.2)"
                _hover={{ transform: "scale(1.1)", boxShadow: "0 4px 12px rgba(236, 95, 140, 0.3)", borderColor: "rgba(236, 95, 140, 0.4)" }} transition="all .2s">
                <Icon as={I} boxSize={5} color="#EC5F8C" />
              </Box>
            </Link>
          ))}
        </HStack>

        <Text fontSize="xs" color="gray.500" textAlign="center" mt={6}>
          © {new Date().getFullYear()} Mamin kotiček. Vse pravice pridržane.
        </Text>
      </Container>
    </Box>
  );
};

export default Footer;
