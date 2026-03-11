import React from "react";
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  Divider,
  List,
  ListItem,
} from "@chakra-ui/react";
import Footer from "../Footer/Footer";

const TermsOfService = () => {
  const sections = [
    {
      title: "1. Splošno",
      content: "Forum je namenjen druženju, izmenjavi izkušenj in informacij med mamicami. Z uporabo foruma se strinjate, da boste spoštovali pravila, zakonodajo in pravice drugih uporabnikov.",
    },
    {
      title: "2. Registracija in račun",
      items: [
        "Za uporabo določenih funkcij foruma morate ustvariti račun.",
        "Podatki, ki jih navedete ob registraciji (ime, e-pošta, geslo), morajo biti resnični.",
        "Uporabnik je odgovoren za varnost svojega gesla in za vse aktivnosti, ki se zgodijo preko njegovega računa.",
        "Forum si pridržuje pravico do začasnega ali trajnega onemogočanja računa, če pride do kršitve teh pogojev.",
      ],
    },
    {
      title: "3. Uporaba foruma",
      content: "Uporabniki se strinjajo, da ne bodo objavljali vsebin, ki so:",
      items: [
        "sovražne, diskriminatorne, žaljive ali nasilne;",
        "oglaševalske ali spam vsebine;",
        "kršile avtorskih pravic ali drugih pravic tretjih oseb;",
        "vsebine, ki razkriva osebne podatke drugih brez njihovega soglasja.",
      ],
      additional: "Forum lahko odstrani ali premakne vsebine, ki kršijo pravila ali niso primerne za forum, brez predhodnega obvestila.",
    },
    {
      title: "4. Pravice do vsebine",
      items: [
        "Vse vsebine, ki jih uporabniki objavijo na forumu, ostanejo v njihovi lasti, vendar z objavo uporabnik daje forumu pravico, neizključno in brezplačno, da te vsebine prikaže, distribuira ali deli v okviru delovanja foruma.",
        "Uporabniki se strinjajo, da forum lahko uporablja njihove objave za promocijske ali administrativne namene.",
      ],
    },
    {
      title: "5. Zaščita osebnih podatkov",
      items: [
        "Forum zbira in obdeluje osebne podatke v skladu z našo Politiko zasebnosti, ki je sestavni del teh pogojev.",
        "Z uporabo foruma soglašate z zbiranjem, obdelavo in shranjevanjem podatkov, kot je opisano v Politiki zasebnosti.",
      ],
    },
    {
      title: "6. Omejitev odgovornosti",
      items: [
        "Forum se trudi, da bo vsebina točna in ažurna, vendar ne prevzema odgovornosti za napake, napačne informacije ali škodo, ki bi nastala zaradi uporabe vsebin.",
        "Forum ne odgovarja za vsebine, ki jih objavijo uporabniki, ali za interakcije med uporabniki.",
      ],
    },
    {
      title: "7. Prenos in spremembe pogojev",
      items: [
        "Forum si pridržuje pravico do spremembe teh pogojev uporabe kadarkoli.",
        "Spremembe začnejo veljati z objavo na forumu. Nadaljnja uporaba foruma pomeni, da se strinjate z novimi pogoji.",
      ],
    },
    {
      title: "8. Reševanje sporov",
      items: [
        "V primeru spora bodo uporabniki poskušali spor rešiti sporazumno.",
        "Če dogovor ni mogoč, velja zakonodaja Republike Slovenije (ali država, kjer forum deluje).",
      ],
    },
    {
      title: "9. Kontakt",
      content: "Za vsa vprašanja glede teh pogojev uporabe nas lahko kontaktirate na: maminkoticek@gmail.com",
    },
  ];

  return (
    <Box minH="100vh" bg="gray.50">
      <Container maxW="container.lg" py={{ base: 10, md: 14 }} px={{ base: 4, md: 6 }}>
        <VStack align="stretch" spacing={8}>
          <VStack align="stretch" spacing={2}>
            <Heading
              as="h1"
              fontSize={{ base: "xl", md: "2xl" }}
              fontWeight="700"
              color="gray.800"
              letterSpacing="-0.02em"
            >
              Pogoji uporabe
            </Heading>
            <Text fontSize="sm" color="gray.500">
              Datum veljavnosti: 15. januar 2026
            </Text>
          </VStack>

          <Divider borderColor="gray.200" />

          {/* Introduction */}
          <Box
            bg="white"
            rounded="2px"
            p={{ base: 5, md: 6 }}
            border="1px solid"
            borderColor="gray.200"
            borderLeft="3px solid"
            borderLeftColor="#EC5F8C"
            boxShadow="0 1px 3px rgba(0,0,0,0.06)"
          >
            <Text fontSize="sm" color="gray.600" lineHeight="1.7">
              Dobrodošli na forumu Mamin kotiček. Z uporabo foruma soglašate s temi pogoji. Prosimo, da jih preberete, preden ustvarite račun ali objavljate.
            </Text>
          </Box>

          <VStack align="stretch" spacing={5}>
            {sections.map((section, index) => (
              <Box
                key={index}
                bg="white"
                rounded="2px"
                p={{ base: 5, md: 6 }}
                border="1px solid"
                borderColor="gray.200"
                borderLeft="3px solid"
                borderLeftColor="#EC5F8C"
                boxShadow="0 1px 3px rgba(0,0,0,0.06)"
              >
                <VStack align="stretch" spacing={3}>
                  <Heading as="h2" size="sm" fontWeight="700" color="gray.800">
                    {section.title}
                  </Heading>

                  {section.content && (
                    <Text fontSize="sm" color="gray.600" lineHeight="1.7">
                      {section.content}
                    </Text>
                  )}

                  {section.items && (
                    <List spacing={2}>
                      {section.items.map((item, i) => (
                        <ListItem
                          key={i}
                          fontSize="sm"
                          color="gray.600"
                          lineHeight="1.7"
                          display="flex"
                          alignItems="flex-start"
                          gap={2}
                        >
                          <Box as="span" mt={1.5} w="4px" h="4px" rounded="full" bg="#EC5F8C" flexShrink={0} />
                          {item}
                        </ListItem>
                      ))}
                    </List>
                  )}

                  {section.additional && (
                    <Text fontSize="sm" color="gray.600" lineHeight="1.7" fontStyle="italic">
                      {section.additional}
                    </Text>
                  )}
                </VStack>
              </Box>
            ))}
          </VStack>

          <Box pt={4} borderTop="1px solid" borderColor="gray.200">
            <Text fontSize="xs" color="gray.500" textAlign="center">
              Z registracijo in uporabo foruma soglašate s temi pogoji.
            </Text>
          </Box>
        </VStack>
      </Container>
      <Footer />
    </Box>
  );
};

export default TermsOfService;
