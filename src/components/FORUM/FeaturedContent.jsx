import { Box, HStack, Text, Button, VStack, Skeleton } from "@chakra-ui/react";
import { FaStar, FaDownload, FaHeart } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

export const FeaturedContent = ({ featuredPost, featuredComment, loadingPost, loadingComment, onDownload }) => {
  const navigate = useNavigate();
  return (
    <>
      {loadingPost ? (
        <Skeleton height="100px" borderRadius="md" />
      ) : featuredPost ? (
        <Box p={3} border="1px solid" borderColor="#efefef" bg="#fff" _hover={{ bg: "#fafafa" }} cursor="pointer" onClick={() => navigate(`/post/${featuredPost.id}`)}>
          <HStack align="flex-start" spacing={3}>
            <Box as="span" pt={1} color="#FFD700"><FaStar size={18} /></Box>
            <Box flex="1">
              <HStack spacing={2} mb={1}><Text fontSize="sm" fontWeight="600" color="#EC5F8C">Najboljša objava tedna</Text></HStack>
              <Text fontSize="sm" color="gray.700" fontWeight="600" mb={1} noOfLines={2}>{featuredPost.title}</Text>
              <Text fontSize="sm" color="gray.600" mb={2} noOfLines={3}>{featuredPost.content}</Text>
              {featuredPost.author && <Text fontSize="xs" color="gray.500" mb={2}>— {featuredPost.author}</Text>}
              <Button size="sm" variant="link" color="#EC5F8C" fontWeight="600" fontSize="sm" p={0} h="auto">Preberi več celotno objavo</Button>
            </Box>
          </HStack>
        </Box>
      ) : (
        <Box p={3} border="1px solid" borderColor="#efefef" bg="#fafafa">
          <HStack align="flex-start" spacing={3}>
            <Box as="span" pt={0.5} color="gray.400"><FaStar size={14} /></Box>
            <Box flex="1"><Text fontSize="sm" fontWeight="600" color="gray.600" mb={0.5}>Najboljša objava tedna</Text><Text fontSize="xs" color="gray.500">Ta teden še ni izbrana.</Text></Box>
          </HStack>
        </Box>
      )}
      {loadingComment ? (
        <Skeleton height="120px" borderRadius="md" />
      ) : featuredComment ? (
        <Box p={3} border="1px solid" borderColor="#efefef" bg="#fff" cursor="pointer" _hover={{ bg: "#fafafa" }} onClick={() => { if (featuredComment.postId) navigate(`/forum?post=${featuredComment.postId}`); }}>
          <HStack spacing={3} align="flex-start">
            <Box as="span" pt={1} color="#FFD700"><FaStar size={20} /></Box>
            <Box flex="1">
              <HStack spacing={2} mb={1}><Text fontSize="sm" fontWeight="600" color="#EC5F8C">Najboljši komentar tedna</Text></HStack>
              {featuredComment.postTitle && <Text fontSize="xs" color="gray.500" mb={1} fontStyle="italic" noOfLines={1}>Objava: {featuredComment.postTitle}</Text>}
              <Text fontSize="sm" color="gray.700" mb={2} noOfLines={3} lineHeight="1.5">{featuredComment.content}</Text>
              {featuredComment.author && <Text fontSize="xs" color="gray.500" mb={2}>— {featuredComment.author}</Text>}
              <Button size="sm" variant="link" color="#EC5F8C" fontWeight="600" fontSize="sm" p={0} h="auto" onClick={(e) => { e.stopPropagation(); if (featuredComment.postId) navigate(`/post/${featuredComment.postId}`); }}>Preberi celoten komentar →</Button>
            </Box>
          </HStack>
        </Box>
      ) : (
        <Box p={3} border="1px solid" borderColor="#efefef" bg="#fafafa">
          <HStack spacing={3} align="flex-start">
            <Box as="span" pt={0.5} color="gray.400"><FaStar size={14} /></Box>
            <Box flex="1"><Text fontSize="sm" fontWeight="600" color="gray.600" mb={0.5}>Najboljši komentar tedna</Text><Text fontSize="xs" color="gray.500">Ta teden še ni izbran.</Text></Box>
          </HStack>
        </Box>
      )}
      <Box p={3} border="1px solid" borderColor="#efefef" bg="#fff">
        <HStack spacing={3} align="start">
          <Box as="span" pt={1} color="#EC5F8C"><FaDownload size={18} /></Box>
          <Box flex="1">
            <Text fontSize="sm" fontWeight="600" mb={1}>Prenosi za mamice</Text>
            <Text fontSize="sm" color="gray.600" mb={3}>Uporabni checklisti in planerji, npr. seznam za porodnišnico.</Text>
            <VStack spacing={2} align="stretch">
              <Button size="sm" variant="outline" onClick={() => onDownload("Seznam za porodnišnico (PDF)")} borderRadius="6px" borderColor="#dbdbdb" _hover={{ borderColor: "#a8a8a8", bg: "#fafafa" }}>Prenesi seznam</Button>
              <Button size="sm" variant="outline" onClick={() => onDownload("Tedenski planer obrokov (PDF)")} borderRadius="6px" borderColor="#dbdbdb" _hover={{ borderColor: "#a8a8a8", bg: "#fafafa" }}>Prenesi planer</Button>
            </VStack>
          </Box>
        </HStack>
      </Box>
      <Box p={3} border="1px solid" borderColor="#efefef" bg="#fafafa">
        <HStack spacing={3} align="flex-start">
          <Box as="span" pt={0.5} color="#EC5F8C"><FaHeart size={16} /></Box>
          <Box flex="1">
            <Text fontSize="sm" fontWeight="600" mb={1} color="#262626">Podpri Mamin kotiček</Text>
            <Text fontSize="xs" color="gray.600" mb={3}>Pomagaj ohranjati skupnost.</Text>
            <Button size="sm" as="a" href="https://buymeacoffee.com/maminkoticek" target="_blank" rel="noopener noreferrer" bg="#EC5F8C" color="white" width="full" borderRadius="6px" fontWeight="500" _hover={{ bg: "#d94b7a" }}>Doniraj</Button>
          </Box>
        </HStack>
      </Box>
    </>
  );
};
