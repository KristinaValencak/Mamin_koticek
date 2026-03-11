import React from "react";
import { Box, Container, Heading, Text, VStack, Divider, List, ListItem } from "@chakra-ui/react";
import Footer from "../Footer/Footer";

const CookiesPolicy = () => {
    const sections = [
        {
            title: "1. Kaj so piškotki?",
            content: "Piškotki so majhne besedilne datoteke, ki se shranijo v tvojem brskalniku ob obisku spletne strani. Omogočajo delovanje osnovnih funkcionalnosti spletne strani.",
        },
        {
            title: "2. Katere piškotke uporabljamo?",
            content: "Naša spletna stran uporablja samo nujne (obvezne) piškotke, ki so potrebni za pravilno delovanje spletne strani.",
            items: [
                {
                    name: "auth_token",
                    description: "Sejni piškotek za avtentikacijo uporabnika (prijava in varna seja)",
                    purpose: "Namen: avtentikacija uporabnika",
                    type: "Vrsta: sejni piškotek",
                    duration: "Trajanje: do 2 uri ali do odjave",
                    access: "Dostop: HttpOnly (ni dostopen JavaScript kodi)",
                    note: "Brez tega piškotka prijava in uporaba foruma ne delujeta pravilno.",
                },
            ],
        },
        {
            title: "3. Ali uporabljamo piškotke za sledenje?",
            content: "Ne. Spletna stran ne uporablja piškotkov za oglaševanje, sledenje ali analitiko tretjih oseb. Uporabljamo samo nujne piškotke, potrebne za osnovno delovanje spletne strani.",
        },
        {
            title: "4. Upravljanje piškotkov",
            content: "Ker uporabljamo samo nujne piškotke, za njihovo uporabo ne potrebujemo tvojega izrecnega soglasja. Vendar pa lahko piškotke kadarkoli izbrišeš ali onemogočiš v nastavitvah svojega brskalnika.",
            items: [
                "Izbris ali onemogočitev piškotkov lahko vpliva na delovanje spletne strani.",
                "Nekatere funkcije foruma morda ne bodo delovale pravilno, če so piškotki onemogočeni.",
                "Za podrobnejše navodila o upravljanju piškotkov v tvojem brskalniku preveri pomoč brskalnika.",
            ],
        },
        {
            title: "5. Spremembe politike piškotkov",
            items: [
                "Pridržujemo si pravico do spremembe te politike piškotkov.",
                "Vse spremembe bodo objavljene na tej strani.",
                "Priporočamo, da občasno preveriš to stran za morebitne posodobitve.",
            ],
        },
        {
            title: "6. Kontakt",
            content: "Če imaš vprašanja glede uporabe piškotkov na naši spletni strani, nas lahko kontaktiraš na: maminkoticek@gmail.com",
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
                            🍪 Politika piškotkov
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
                            Ta spletna stran uporablja piškotke za zagotavljanje pravilnega delovanja in boljše uporabniške izkušnje.
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
                                        <List spacing={3}>
                                            {section.items.map((item, i) => (
                                                <ListItem
                                                    key={i}
                                                    fontSize="sm"
                                                    color="gray.600"
                                                    lineHeight="1.7"
                                                >
                                                    {typeof item === "string" ? (
                                                        <Box display="flex" alignItems="flex-start" gap={2}>
                                                            <Box as="span" mt={1.5} w="4px" h="4px" rounded="full" bg="#EC5F8C" flexShrink={0} />
                                                            {item}
                                                        </Box>
                                                    ) : (
                                                        <Box>
                                                            <Text fontWeight="600" color="gray.800" mb={1}>
                                                                {item.name}
                                                            </Text>
                                                            <VStack align="stretch" spacing={1} ml={4}>
                                                                <Text>{item.description}</Text>
                                                                <Text><strong>{item.purpose}</strong></Text>
                                                                <Text><strong>{item.type}</strong></Text>
                                                                <Text><strong>{item.duration}</strong></Text>
                                                                <Text><strong>{item.access}</strong></Text>
                                                                {item.note && (
                                                                    <Text fontStyle="italic" color="gray.500">
                                                                        {item.note}
                                                                    </Text>
                                                                )}
                                                            </VStack>
                                                        </Box>
                                                    )}
                                                </ListItem>
                                            ))}
                                        </List>
                                    )}
                                </VStack>
                            </Box>
                        ))}
                    </VStack>

                    <Box pt={4} borderTop="1px solid" borderColor="gray.200">
                        <Text fontSize="xs" color="gray.500" textAlign="center">
                            Z uporabo spletne strani se strinjaš z uporabo nujnih piškotkov.
                        </Text>
                    </Box>
                </VStack>
            </Container>
            <Footer />
        </Box>
    );
};

export default CookiesPolicy;