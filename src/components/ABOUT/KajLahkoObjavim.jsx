import React from "react";
import { Box, Container, SimpleGrid, Heading, Text, Stack, Button, Icon } from "@chakra-ui/react";
import { motion } from "framer-motion";
import { CheckCircle, Star } from "lucide-react";
import Image2 from "../../assets/Image2.png";

const MotionBox = motion(Box);
const MotionImage = motion("img");

const KajLahkoObjavim = () => {
  return (
    <Box as="section" id="kaj-lahko-objavim" py={{ base: 20, md: 28 }} bg="linear-gradient(180deg, #FFF5F8 0%, #FFFFFF 100%)">
      <Container maxW="container.xl">
        <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={{ base: 14, md: 20 }} alignItems="center">
          
          <MotionBox initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: "easeOut" }} viewport={{ once: true }}>
            <Stack spacing={8}>
              <Heading as="h2" fontSize={{ base: "2.5rem", md: "3rem" }} lineHeight="1.1" fontWeight="extrabold" color="#2D2D2D">
                Kaj lahko objavim?
              </Heading>

              <Text fontSize="lg" fontWeight="semibold" color="#2D2D2D">
                V Maminem kotičku verjamemo, da ne obstaja neumno vprašanje.
              </Text>

              <Text fontSize="md" color="#5F5F5F" maxW="2xl">
                Lahko vprašaš karkoli o nosečnosti, dojenčkih, starševstvu ali preprosto deliš misel iz vsakdanjega življenja. Tukaj ni napačnih vprašanj – le iskreni pogovori.
              </Text>

              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={10}>
                <Stack spacing={4} p={6} bg="white" rounded="2xl" boxShadow="sm">
                  <Text fontWeight="bold" color="#2D2D2D">Morda želiš vprašati</Text>
                  {["Katero vadbo lahko počnem med nosečnostjo?","Kako naj pomagam otroku pri dojenju?","Kakšni so vaši triki, da dojenček zaspi?","Ali bo moj otrok kdaj prespal noč?"].map((item, i) => (
                    <Stack key={i} direction="row" align="flex-start">
                      <Icon as={CheckCircle} color="#EC5F8C" boxSize={18} mt="2px" />
                      <Text color="#5F5F5F">{item}</Text>
                    </Stack>
                  ))}
                </Stack>

                <Stack spacing={4} p={6} bg="white" rounded="2xl" boxShadow="sm">
                  <Text fontWeight="bold" color="#2D2D2D">Ali pa kaj bolj sproščenega</Text>
                  {["Kaj trenutno berete?","Ima katera priporočilo za vrtec?","Kdo še kvačka ali šiva?","Kaj je danes na vašem meniju?"].map((item, i) => (
                    <Stack key={i} direction="row" align="flex-start">
                      <Icon as={Star} color="#EC5F8C" boxSize={18} mt="2px" />
                      <Text color="#5F5F5F">{item}</Text>
                    </Stack>
                  ))}
                  <Button mt={2} size="lg" rounded="full" px={10} bg="linear-gradient(135deg, #EC5F8C, #F48FB1)" color="white" _hover={{ transform: "translateY(-2px)", boxShadow: "lg" }}>
                    Moje prvo vprašanje
                  </Button>
                </Stack>
              </SimpleGrid>
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
              rounded="3xl"
              overflow="hidden"
              maxW={{ base: "95%", md: "480px", lg: "550px" }}
              mx="auto"
              boxShadow="0 25px 60px rgba(236, 95, 140, 0.28), 0 10px 30px rgba(0, 0, 0, 0.12)"
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
                src={Image2}
                alt="Ilustracija – vprašanja in ideje"
                style={{ width: "100%", borderRadius: "1.5rem", objectFit: "contain" }}
              />
            </MotionBox>
          </MotionBox>

        </SimpleGrid>
      </Container>
    </Box>
  );
};

export default KajLahkoObjavim;
