import { useState } from "react";
import { Box, Container, VStack, Heading, Text, FormControl, FormLabel, Input, Button, Link, HStack } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import Footer from "../../Footer/Footer";
import Swal from 'sweetalert2';
import { FiMail, FiArrowLeft } from "react-icons/fi";
import { API_BASE } from "../../../api/config";

const emailOk = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const valid = emailOk(email);
  const onChange = (e) => setEmail(e.target.value);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!valid) return;

    try {
      setLoading(true);

      const res = await fetch(`${API_BASE}/api/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await res.json();

      if (res.ok) {
        Swal.fire({
          icon: 'success',
          title: 'Email poslan!',
          html: `
            <p>${data.message}</p>
            <p style="margin-top: 10px; font-size: 14px; color: #666;">
              Preveri svoj email (tudi mapo z neželeno pošto) in sledi navodilom za ponastavitev gesla.
            </p>
          `,
          confirmButtonColor: '#EC5F8C',
          confirmButtonText: 'V redu'
        }).then(() => {
          navigate("/prijava");
        });
      } else {
        throw new Error(data.message || "Napaka pri pošiljanju emaila.");
      }
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Napaka',
        text: err.message || "Napaka pri pošiljanju emaila.",
        confirmButtonColor: '#EC5F8C',
        confirmButtonText: 'V redu'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box minH="100vh" display="flex" flexDirection="column" position="relative" overflow="hidden" bgGradient="linear(to-br, #fafafa, #f5f5f5, #fafafa)">
      <Container maxW="450px" flex="1" display="flex" alignItems="center" py={{ base: 12, md: 20 }} position="relative" zIndex={1}>
        <VStack as="form" onSubmit={onSubmit} spacing={8} w="full" align="stretch">
          <VStack spacing={3} align="center" textAlign="center">
            <Heading fontSize={{ base: "3xl", md: "4xl" }} fontWeight="800" bgGradient="linear(135deg, #D94B8C 0%, #EC5F8C 50%, #F48FB1 100%)" bgClip="text" letterSpacing="-0.02em">Pozabljeno geslo?</Heading>
            <Text fontSize="md" color="gray.600" fontWeight="500">Vnesi svoj email in poslali ti bomo navodila za ponastavitev gesla</Text>
          </VStack>
          <VStack spacing={6} w="full">
            <FormControl isRequired>
              <FormLabel fontSize="sm" fontWeight="600" color="gray.700" mb={2} display="flex" alignItems="center" gap={2}>
                <FiMail size={16} />
                Email
              </FormLabel>
              <Input type="email" value={email} onChange={onChange}
                placeholder="ana@example.com"
                size="lg"
                variant="flushed"
                borderBottomWidth="2px"
                borderColor={email && !valid ? "red.400" : "gray.300"}
                _hover={{
                  borderColor: email && !valid ? "red.400" : "gray.400"
                }}
                _focus={{
                  borderColor: email && !valid ? "red.500" : "brand.500",
                  boxShadow: "none"
                }}
                fontSize="md"
                py={3}
                bg="transparent"
                transition="all 0.2s"
              />
              {email && !valid && (
                <Text fontSize="xs" color="red.500" mt={1}>
                  Vnesite veljaven email naslov
                </Text>
              )}
            </FormControl>

            <Button
              type="submit"
              isDisabled={!valid}
              isLoading={loading}
              w="full"
              h="54px"
              bgGradient="linear(135deg, #EC5F8C 0%, #F48FB1 100%)"
              color="white"
              fontSize="md"
              fontWeight="600"
              _hover={{
                bgGradient: "linear(135deg, #D94B8C 0%, #EC5F8C 100%)",
                transform: "translateY(-2px)",
                boxShadow: "0 8px 24px rgba(236, 95, 140, 0.25)"
              }}
              _active={{
                transform: "translateY(0)"
              }}
              transition="all 0.2s"
              mt={2}
            >
              Pošlji navodila
            </Button>
          </VStack>

          <HStack spacing={4} w="full" justify="center">
            <Link
              href="/prijava"
              color="brand.500"
              fontWeight="600"
              _hover={{ textDecoration: "underline" }}
              display="flex"
              alignItems="center"
              gap={2}
            >
              <FiArrowLeft size={16} />
              Nazaj na prijavo
            </Link>
          </HStack>
        </VStack>
      </Container>
      <Footer />
    </Box>
  );
};

export default ForgotPassword;