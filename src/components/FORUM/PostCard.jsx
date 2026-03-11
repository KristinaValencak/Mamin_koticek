import { Box, HStack, Avatar, IconButton, Heading, Text, Menu, MenuButton, MenuList, MenuItem } from "@chakra-ui/react";
import { BsThreeDotsVertical } from "react-icons/bs";
import { FaHeart, FaRegHeart, FaComment, FaStar } from "react-icons/fa";
import { formatDate } from "../../utils/helpers";

export const PostCard = ({ post, postLikes, likingPosts, onLike, onOpen, onReport, navigate }) => (
  <Box className="forum-post-card" onClick={() => onOpen(post)}>
    <Box className="forum-post-card-header" mb={3}>
      <HStack justify="space-between" align="center" w="full">
        <HStack spacing={3} flex="1">
          <Avatar name={post.author || "Uporabnik"} size="sm" bgGradient="linear(135deg, #EC5F8C 0%, #F48FB1 100%)" cursor="pointer" onClick={(e) => { e.stopPropagation(); const authorId = post.userId || post.user_id; if (authorId) navigate(`/user/${authorId}`); }} _hover={{ transform: "scale(1.1)", transition: "all 0.2s" }} />
          <Box as="span" color="gray.800" fontWeight="600" fontSize="sm" cursor="pointer" _hover={{ color: "#EC5F8C", textDecoration: "underline" }} onClick={(e) => { e.stopPropagation(); const authorId = post.userId || post.user_id; if (authorId) navigate(`/user/${authorId}`); }}>{post.author || "neznano"}</Box>
        </HStack>
        <Menu placement="bottom-end">
          <MenuButton as={IconButton} icon={<BsThreeDotsVertical />} variant="ghost" size="sm" onClick={(e) => e.stopPropagation()} _hover={{ bg: "gray.100" }} aria-label="Možnosti" />
          <MenuList>
            <MenuItem onClick={(e) => { e.stopPropagation(); onReport(post); }}>Prijavi neprimerno objavo</MenuItem>
          </MenuList>
        </Menu>
      </HStack>
    </Box>
    <Box mb={2}>
      <HStack spacing={2} align="center">
        {post.isFeatured && <FaStar size="18px" color="#FFD700" title="Najboljša objava tedna" style={{ flexShrink: 0 }} />}
        <Heading className="forum-post-card-title" flex="1" fontSize="lg">{post.title}</Heading>
      </HStack>
    </Box>
    <Box className="forum-post-card-content" mb={3}>
      <Text fontSize="sm" color="gray.700" noOfLines={3} lineHeight="1.6">{post.content}</Text>
    </Box>
    <Box className="forum-post-card-footer">
      <HStack spacing={3} color="gray.500" fontSize="xs" justify="space-between">
        <HStack spacing={3}><Box>{formatDate(post.createdAt)}</Box></HStack>
        <HStack spacing={3}>
          <HStack spacing={1}>
            <IconButton icon={postLikes[post.id]?.isLiked ? <FaHeart /> : <FaRegHeart />} aria-label={postLikes[post.id]?.isLiked ? "Odlajkaj" : "Lajkaj"} onClick={(e) => onLike(post.id, e)} isLoading={likingPosts[post.id]} color={postLikes[post.id]?.isLiked ? "red.500" : "gray.500"} variant="ghost" size="xs" _hover={{ color: "red.500" }} />
            <Text fontSize="xs" color="gray.600" fontWeight="500">{postLikes[post.id]?.count || 0}</Text>
          </HStack>
          <HStack spacing={1}>
            <FaComment size="12px" color="gray" />
            <Text fontSize="xs" color="gray.600" fontWeight="500">{postLikes[post.id]?.commentCount ?? post.commentCount ?? 0}</Text>
          </HStack>
        </HStack>
      </HStack>
    </Box>
  </Box>
);
