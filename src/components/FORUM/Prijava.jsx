import { useState, useMemo } from "react";
import {
  Box, Container, VStack, Heading, Text, FormControl, FormLabel,
  Input, Button, Link, HStack, Divider
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import Footer from "../Footer/Footer";
import Swal from 'sweetalert2';
import { FiMail, FiLock, FiArrowRight } from "react-icons/fi";
import { API_BASE } from "../../api/config";

const emailOk = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
const userOk = (v) => v.trim().length >= 3;
const passOk = (v) => v.length >= 8;

const Prijava = () => {
  const [form, setForm] = useState({ identifier: "", password: "" });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const valid = {
    identifier: form.identifier.includes("@") ? emailOk(form.identifier) : userOk(form.identifier),
    password: passOk(form.password),
  };
  const allValid = useMemo(() => Object.values(valid).every(Boolean), [valid]);

  const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!allValid) return;

    try {
      setLoading(true);

      const res = await fetch(`${API_BASE}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: 'include',
        body: JSON.stringify({
          identifier: form.identifier.trim(),
          password: form.password,
        }),
      });

      if (res.status === 401) {
        const d = await res.json().catch(() => ({}));
        Swal.fire({
          icon: 'error',
          title: 'Napaka pri prijavi',
          text: d.message || "Napačni prijavni podatki.",
          confirmButtonColor: '#EC5F8C',
          confirmButtonText: 'V redu'
        });
        return;
      }

      if (res.status === 403) {
        const d = await res.json();
        if (!d.emailVerified) {
          const result = await Swal.fire({
            icon: 'warning',
            title: 'Email ni verificiran',
            html: `
              <p>${d.message}</p>
              <p>Želiš ponovno prejeti verifikacijski email?</p>
            `,
            showCancelButton: true,
            confirmButtonColor: '#EC5F8C',
            cancelButtonColor: '#gray',
            confirmButtonText: 'Pošlji ponovno',
            cancelButtonText: 'Prekliči'
          });

          if (result.isConfirmed) {
            try {
              const resendRes = await fetch(`${API_BASE}/api/resend-verification`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: d.email }),
              });

              const resendData = await resendRes.json();

              if (resendRes.ok) {
                Swal.fire({
                  icon: 'success',
                  title: 'Email poslan!',
                  text: resendData.message,
                  confirmButtonColor: '#EC5F8C',
                });
              } else {
                throw new Error(resendData.message);
              }
            } catch (err) {
              Swal.fire({
                icon: 'error',
                title: 'Napaka',
                text: err.message || "Napaka pri pošiljanju emaila.",
                confirmButtonColor: '#EC5F8C',
              });
            }
          }
          return;
        }
      }

      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.message || "Napaka pri prijavi.");
      }

      const payload = await res.json();
      const { id, username, email, isAdmin } = payload || {};

      if (!id || !username || !email) {
        throw new Error("Manjkajoči podatki v odgovoru (id/username/email).");
      }

      localStorage.setItem("user", JSON.stringify({
        id,
        username,
        email,
        isAdmin: isAdmin || false
      }));

      window.dispatchEvent(new Event("auth-changed"));

      Swal.fire({
        icon: 'success',
        title: 'Uspešna prijava!',
        text: `Dobrodošel/a nazaj, ${username}!`,
        confirmButtonColor: '#EC5F8C',
        confirmButtonText: 'V redu',
        timer: 2000,
        timerProgressBar: true
      }).then(() => {
        navigate("/");
      });
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Napaka',
        text: err.message || "Napaka pri prijavi.",
        confirmButtonColor: '#EC5F8C',
        confirmButtonText: 'V redu'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      minH="100vh"
      display="flex"
      flexDirection="column"
      position="relative"
      overflow="hidden"
      bgGradient="linear(to-br, #fafafa, #f5f5f5, #fafafa)"
    >

      <Container maxW="450px" flex="1" display="flex" alignItems="center" py={{ base: 12, md: 20 }} position="relative" zIndex={1}>
        <VStack
          as="form"
          onSubmit={onSubmit}
          spacing={8}
          w="full"
          align="stretch"
        >
          {/* Header */}
          <VStack spacing={3} align="center" textAlign="center">
            <Heading
              fontSize={{ base: "3xl", md: "4xl" }}
              fontWeight="800"
              bgGradient="linear(135deg, #D94B8C 0%, #EC5F8C 50%, #F48FB1 100%)"
              bgClip="text"
              letterSpacing="-0.02em"
            >
              Dobrodošel nazaj
            </Heading>
            <Text fontSize="md" color="gray.600" fontWeight="500">
              Prijavi se in nadaljuj, kjer si ostal
            </Text>
          </VStack>

          <VStack spacing={6} w="full">
            <FormControl isRequired>
              <FormLabel
                fontSize="sm"
                fontWeight="600"
                color="gray.700"
                mb={2}
                display="flex"
                alignItems="center"
                gap={2}
              >
                <FiMail size={16} />
                Email ali uporabniško ime
              </FormLabel>
              <Input
                name="identifier"
                value={form.identifier}
                onChange={onChange}
                placeholder="ana@example.com"
                size="lg"
                variant="flushed"
                borderBottomWidth="2px"
                borderColor={form.identifier && !valid.identifier ? "red.400" : "gray.300"}
                _hover={{
                  borderColor: form.identifier && !valid.identifier ? "red.400" : "gray.400"
                }}
                _focus={{
                  borderColor: form.identifier && !valid.identifier ? "red.500" : "brand.500",
                  boxShadow: "none"
                }}
                fontSize="md"
                py={3}
                bg="transparent"
                transition="all 0.2s"
              />
              {form.identifier && !valid.identifier && (
                <Text fontSize="xs" color="red.500" mt={1}>
                  Vnesite veljaven email ali uporabniško ime (vsaj 3 znake)
                </Text>
              )}
            </FormControl>

            <FormControl isRequired>
              <FormLabel
                fontSize="sm"
                fontWeight="600"
                color="gray.700"
                mb={2}
                display="flex"
                alignItems="center"
                gap={2}
              >
                <FiLock size={16} />
                Geslo
              </FormLabel>
              <Input
                type="password"
                name="password"
                value={form.password}
                onChange={onChange}
                placeholder="••••••••"
                size="lg"
                variant="flushed"
                borderBottomWidth="2px"
                borderColor={form.password && !valid.password ? "red.400" : "gray.300"}
                _hover={{
                  borderColor: form.password && !valid.password ? "red.400" : "gray.400"
                }}
                _focus={{
                  borderColor: form.password && !valid.password ? "red.500" : "brand.500",
                  boxShadow: "none"
                }}
                fontSize="md"
                py={3}
                bg="transparent"
                transition="all 0.2s"
              />
              {form.password && !valid.password && (
                <Text fontSize="xs" color="red.500" mt={1}>
                  Geslo mora biti vsaj 8 znakov dolgo
                </Text>
              )}
            </FormControl>

            <Button
              type="submit"
              isDisabled={!allValid}
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
              rightIcon={<FiArrowRight />}
              mt={2}
            >
              Prijava
            </Button>
          </VStack>
          {/* Forgot Password Link */}
          <HStack justify="flex-end" w="full">
            <Link
              href="/forgot-password"
              color="brand.500"
              fontSize="sm"
              fontWeight="500"
              _hover={{ textDecoration: "underline" }}
            >
              Pozabljeno geslo?
            </Link>
          </HStack>

          <HStack spacing={4} w="full">
            <Divider borderColor="gray.300" />
            <Text fontSize="xs" color="gray.500" fontWeight="500" whiteSpace="nowrap">
              ALI
            </Text>
            <Divider borderColor="gray.300" />
          </HStack>

          {/* Footer */}
          <VStack spacing={3}>
            <Text fontSize="sm" color="gray.600">
              Nimaš računa?{" "}
              <Link
                href="/registracija"
                color="brand.500"
                fontWeight="600"
                _hover={{ textDecoration: "underline" }}
              >
                Ustvari račun
              </Link>
            </Text>
          </VStack>

          <HStack
            spacing={6}
            justify="center"
            pt={4}
            opacity={0.6}
            fontSize="xs"
            color="gray.500"
          >
            <HStack spacing={1}>
              <Box as="span">🔒</Box>
              <Text>Varno</Text>
            </HStack>
            <HStack spacing={1}>
              <Box as="span">⚡</Box>
              <Text>Hitro</Text>
            </HStack>
            <HStack spacing={1}>
              <Box as="span">✓</Box>
              <Text>Zanesljivo</Text>
            </HStack>
          </HStack>
        </VStack>
      </Container>
      <Footer />
    </Box>
  );
};

export default Prijava;