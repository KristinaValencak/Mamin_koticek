import { Box, Container, SimpleGrid, Heading, Text, Stack, List, ListItem, ListIcon } from "@chakra-ui/react";
import { motion } from "framer-motion";
import { CheckCircle } from "lucide-react";
import Image5 from "../../assets/Image5.avif";

const MotionBox = motion(Box);
const MotionImage = motion("img");

const Varnost = () => {
  return (
    <Box as="section" id="varnost" py={{ base: 20, md: 28 }} bg="linear-gradient(180deg, #FFF8FA 0%, #FFFFFF 100%)">
      <Container maxW="container.xl">
        <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={{ base: 14, md: 20 }} alignItems="center">
          
          <MotionBox initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: "easeOut" }} viewport={{ once: true }}>
            <Stack spacing={8}>
              <Heading as="h2" fontSize={{ base: "2.2rem", md: "2.6rem" }} lineHeight="1.2" fontWeight="extrabold" color="#2D2D2D">
                Kako skrbimo za varnost v Maminem kotičku
              </Heading>

              <Text fontSize="md" color="#5F5F5F" maxW="2xl">
                Mamin kotiček je varen in spoštljiv prostor za pogovor. Da se tukaj vsaka mamica počuti dobrodošlo, sledimo nekaj preprostim smernicam.
              </Text>

              <Box bg="white" rounded="2xl" p={{ base: 6, md: 8 }} boxShadow="sm">
                <List spacing={4}>
                  {[
                    "Bodimo prijazne in spoštljive do vseh članic.",
                    "Delimo svoje izkušnje, ne ukazov ali sodb.",
                    "Zdravstvene nasvete vedno prepustimo strokovnjakom.",
                    "Delimo le preverjene in zanesljive vire.",
                    "V skupnosti ni prostora za politiko, oglase ali spam.",
                    "Skrb vzbujajoče vsebine lahko prijaviš moderatorjem."
                  ].map((item, i) => (
                    <ListItem key={i} display="flex" alignItems="flex-start">
                      <ListIcon as={CheckCircle} color="#EC5F8C" mt="4px" />
                      <Text color="#5F5F5F">{item}</Text>
                    </ListItem>
                  ))}
                </List>
              </Box>

              <Text fontWeight="medium" color="#2D2D2D">
                Tako skupaj ustvarjamo topel, varen in zaupanja vreden prostor.
              </Text>
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
                src={Image5}
                alt="Ilustracija varnosti"
                style={{ width: "100%", borderRadius: "1.5rem", objectFit: "contain" }}
              />
            </MotionBox>
          </MotionBox>

        </SimpleGrid>
      </Container>
    </Box>
  );
};

export default Varnost;
