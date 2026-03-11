import { Box, Text, Spinner, VStack } from "@chakra-ui/react";
import { PostCard } from "./PostCard";

export const PostList = ({ posts, postLikes, likingPosts, onLike, onOpen, onReport, navigate, loadingMore, hasMore, searchQuery }) => (
  <>
    {posts.map((p) => (
      <PostCard key={p.id} post={p} postLikes={postLikes} likingPosts={likingPosts} onLike={onLike} onOpen={onOpen} onReport={onReport} navigate={navigate} />
    ))}
    {!searchQuery && loadingMore && (
      <Box py={8} textAlign="center"><Spinner color="#EC5F8C" size="lg" /></Box>
    )}
    {!searchQuery && !hasMore && posts.length > 0 && (
      <Box py={8} textAlign="center" color="gray.500"><Text fontSize="sm">Ni več objav</Text></Box>
    )}
  </>
);
