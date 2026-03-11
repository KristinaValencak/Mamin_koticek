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

const PrivacyPolicy = () => {
  const sections = [
    {
      title: "1. Upravljavec osebnih podatkov",
      content: "Upravljavec osebnih podatkov je:",
      items: [
        "Ime / naziv: Mamin kotiček",
        "E-pošta: maminkoticek@gmail.com",
      ],
      additional: "Za vsa vprašanja glede varstva osebnih podatkov se lahko obrnete na zgornji kontakt.",
    },
    {
      title: "2. Katere osebne podatke zbiramo",
      content: "Forum lahko zbira naslednje osebne podatke:",
      items: [
        "uporabniško ime,",
        "e-poštni naslov,",
        "geslo (shranjeno v šifrirani/hashed obliki),",
        "IP naslov in tehnične podatke (npr. datum prijave),",
        "vsebine, ki jih uporabnik prostovoljno objavi na forumu (objave, komentarji).",
      ],
      additional: "Forum ne zbira posebnih vrst osebnih podatkov, razen če jih uporabnik prostovoljno razkrije v objavah.",
    },
    {
      title: "3. Namen obdelave podatkov",
      content: "Osebni podatki se obdelujejo za naslednje namene:",
      items: [
        "omogočanje registracije in prijave uporabnikov,",
        "delovanje foruma in komunikacijo med uporabniki,",
        "zagotavljanje varnosti sistema in preprečevanje zlorab,",
        "izboljšanje uporabniške izkušnje,",
        "obveščanje uporabnikov o pomembnih spremembah.",
      ],
    },
    {
      title: "4. Pravna podlaga za obdelavo",
      content: "Podatke obdelujemo na podlagi:",
      items: [
        "soglasja uporabnika, ki ga poda ob registraciji,",
        "pogodbene obveznosti, saj je obdelava potrebna za delovanje foruma,",
        "zakonitih interesov, kot je zagotavljanje varnosti sistema.",
      ],
    },
    {
      title: "5. Hramba podatkov",
      items: [
        "Osebni podatki se hranijo toliko časa, kolikor je potrebno za delovanje foruma.",
        "Po izbrisu uporabniškega računa se osebni podatki izbrišejo ali anonimizirajo, razen če zakon zahteva drugače.",
      ],
    },
    {
      title: "6. Posredovanje podatkov tretjim osebam",
      content: "Forum osebnih podatkov ne prodaja in ne posreduje tretjim osebam, razen kadar je to nujno za delovanje storitve (npr. ponudnik strežnika) ali kadar to zahteva zakon.",
    },
    {
      title: "7. Varovanje osebnih podatkov",
      content: "Upravljavec uporablja primerne tehnične in organizacijske ukrepe za zaščito osebnih podatkov, vključno z:",
      items: [
        "šifriranjem gesel (hashiranje),",
        "uporabo varne povezave (HTTPS),",
        "omejenim dostopom do baze podatkov,",
        "rednimi varnostnimi posodobitvami sistema.",
      ],
    },
    {
      title: "8. Pravice uporabnikov",
      content: "Uporabniki imajo naslednje pravice:",
      items: [
        "pravico do dostopa do svojih osebnih podatkov,",
        "pravico do popravka netočnih podatkov,",
        "pravico do izbrisa podatkov (pravica do pozabe),",
        "pravico do omejitve obdelave,",
        "pravico do prenosljivosti podatkov,",
        "pravico do preklica soglasja.",
      ],
      additional: "Zahteve lahko pošljete na kontaktni e-mail upravljavca.",
    },
    {
      title: "9. Piškotki",
      items: [
        "Forum lahko uporablja nujne piškotke za pravilno delovanje spletne strani.",
        "Piškotki ne vsebujejo osebnih podatkov in ne omogočajo identifikacije uporabnika brez njegovega soglasja.",
      ],
    },
    {
      title: "10. Kršitve varnosti podatkov",
      content: "V primeru kršitve varnosti osebnih podatkov bo upravljavec ravnal v skladu z GDPR in po potrebi obvestil pristojni organ ter prizadete uporabnike.",
    },
    {
      title: "11. Spremembe politike zasebnosti",
      items: [
        "Upravljavec si pridržuje pravico do spremembe te politike zasebnosti.",
        "Spremembe bodo objavljene na tej strani in začnejo veljati z dnem objave.",
      ],
    },
    {
      title: "12. Kontakt",
      content: "Za vprašanja ali uveljavljanje pravic glede varstva osebnih podatkov pišite na: maminkoticek@gmail.com",
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
              Politika zasebnosti
            </Heading>
            <Text fontSize="sm" color="gray.500">
              Datum veljavnosti: 15. januar 2026
            </Text>
          </VStack>

          <Divider borderColor="gray.200" />

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
              Ta politika pojasnjuje, kako Mamin kotiček zbira, uporablja, hrani in varuje osebne podatke v skladu z GDPR in veljavno zakonodajo Republike Slovenije.
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
              Z uporabo foruma soglašate s to politiko zasebnosti.
            </Text>
          </Box>
        </VStack>
      </Container>
      <Footer />
    </Box>
  );
};

export default PrivacyPolicy;
