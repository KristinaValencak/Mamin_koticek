import React from "react";
import { Box, Container, SimpleGrid, Heading, Text, Stack } from "@chakra-ui/react";
import { motion } from "framer-motion";
import FirstSectionImg from "../../assets/FirstSectionImg.webp";

const MotionBox = motion(Box);
const MotionImage = motion("img");

const MojaZgodba = () => {
  return (
    <Box as="section" id="moja-zgodba" py={{ base: 20, md: 28 }} bg="linear-gradient(180deg, #FFFFFF 0%, #FFF8FA 100%)">
      <Container maxW="container.xl">
        <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={{ base: 14, md: 20 }} alignItems="center">
          
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
              maxW={{ base: "95%", md: "430px", lg: "480px" }}
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
                src={FirstSectionImg}
                alt="Mami z hčerko"
                style={{ width: "100%", borderRadius: "1.5rem", objectFit: "cover" }}
              />
            </MotionBox>
          </MotionBox>

          <MotionBox initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: "easeOut", delay: 0.15 }} viewport={{ once: true }}>
            <Stack spacing={8}>
              <Heading as="h2" fontSize={{ base: "2.5rem", md: "3rem" }} lineHeight="1.1" fontWeight="extrabold" color="#2D2D2D">
                Moja zgodba
              </Heading>

              <Text fontSize="xl" fontWeight="semibold" color="#EC5F8C">
                Zakaj je nastal Mamin kotiček
              </Text>

              <Stack spacing={5} maxW="2xl">
                <Text fontSize="md" color="#5F5F5F">
                  Ko sem prvič postala mama, je bilo vse novo. Na porodniškem dopustu sem se srečevala z vprašanji in izzivi, ki jih prej nisem poznala – od kolik in vročine do uvajanja hrane in neprespanih noči. Pogosto sem se počutila izgubljeno in sama.
                </Text>

                <Text fontSize="md" color="#5F5F5F">
                  Manjkala mi je družba, pogovori in prijateljice, ki bi razumele, kaj preživljam. Prav zato danes razumem vsako mamico in jo občudujem – ker je materinstvo čudovito, a hkrati tudi zelo zahtevno.
                </Text>

                <Text fontSize="md" color="#5F5F5F">
                  Iz te izkušnje se je rodila ideja za Mamin kotiček – varen prostor, kjer se lahko srečamo, si damo podporo in odkrito spregovorimo o vsem, kar prinaša materinstvo. Tukaj nisi sama.
                </Text>
              </Stack>
            </Stack>
          </MotionBox>

        </SimpleGrid>
      </Container>
    </Box>
  );
};

export default MojaZgodba;
