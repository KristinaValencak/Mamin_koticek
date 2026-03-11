import { useState, useEffect, useCallback } from "react";
import { Box, Grid, GridItem, VStack, Container, Skeleton, Text, Collapse } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@chakra-ui/react";
import { useDisclosure } from "@chakra-ui/react";
import Footer from "../Footer/Footer";
import Objava from "../FORUM/Objava";
import NovaObjava from "../FORUM/NovaObjava";
import AIChat from "../FORUM/AIChat";
import ReportPostModal from "../FORUM/Report/ReportPostModal";
import { useCategories } from "../../hooks/forum/useCategories";
import { useForumPosts } from "../../hooks/forum/useForumPosts";
import { usePostLikes } from "../../hooks/forum/usePostLikes";
import { useFeaturedContent } from "../../hooks/forum/useFeaturedContent";
import { useForumFilters } from "../../hooks/forum/useForumFilters";
import { usePostSearch } from "../../hooks/posts/usePostSearch";
import { usePostTitle } from "../../hooks/posts/usePostTitle";
import { useInfiniteScroll } from "../../hooks/forum/useInfiniteScroll";
import { ForumSidebar } from "./ForumSidebar";
import { ForumHeader } from "./ForumHeader";
import { PostList } from "./PostList";
import { SearchInput } from "./SearchInput";
import { FeaturedContent } from "./FeaturedContent";
import { FloatingButtons } from "./FloatingButtons";
import { API_BASE } from "../../api/config";

export default function Forum() {
  const { isOpen: isReportOpen, onOpen: onReportOpen, onClose: onReportClose } = useDisclosure();
  const [reportingPost, setReportingPost] = useState(null);
  const [showNewPostForm, setShowNewPostForm] = useState(false);
  const [isAIChatOpen, setIsAIChatOpen] = useState(false);
  const navigate = useNavigate();
  const toast = useToast();

  const { categories } = useCategories();
  const { selectedCategory, view, searchQuery, setSearchQuery, handleSelectCategory, goLatest, goTop, selectedPostId, searchParams, setSearchParams } = useForumFilters(categories);
  const { items, loading, loadingMore, hasMore, error, loadItems, reset } = useForumPosts(selectedCategory, view);
  const { postLikes, likingPosts, handleLike, updateLikesFromPosts } = usePostLikes();
  const { featuredPost, featuredComment, loadingPost, loadingComment } = useFeaturedContent();
  const selectedPostTitle = usePostTitle(selectedPostId);
  const filteredItems = usePostSearch(items, searchQuery);

  useEffect(() => {
    const newPost = searchParams.get("new");
    if (newPost === "true") {
      setShowNewPostForm(true);
      const params = new URLSearchParams(searchParams);
      params.delete("new");
      setSearchParams(params, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  useEffect(() => {
    if (showNewPostForm && searchParams.get("cat") && searchParams.get("new") !== "true") {
      setShowNewPostForm(false);
    }
  }, [searchParams, showNewPostForm]);

  useEffect(() => {
    if (items.length > 0) updateLikesFromPosts(items);
  }, [items, updateLikesFromPosts]);

  useEffect(() => {
    if (!searchQuery) loadItems(false);
  }, [selectedCategory?.slug, view, searchQuery, loadItems]);

  useInfiniteScroll(loadItems, hasMore, loading, loadingMore, searchQuery);

  const openPost = useCallback((p) => {
    const params = new URLSearchParams(searchParams);
    params.set("post", p.id);
    setSearchParams(params);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [searchParams, setSearchParams]);

  const closePost = useCallback(() => {
    const params = new URLSearchParams(searchParams);
    params.delete("post");
    setSearchParams(params);
  }, [searchParams, setSearchParams]);

  const handleDownload = useCallback((name) => {
    toast({ title: "Prenos pripravljen", description: `${name} - pripravljen za prenos.`, status: "info", duration: 3500, isClosable: true });
  }, [toast]);

  const handleNewPostSuccess = useCallback(() => {
    reset();
    setShowNewPostForm(false);
  }, [reset]);

  const handleNewPostCancel = useCallback(() => {
    setShowNewPostForm(false);
  }, []);

  const handleNewPostClick = useCallback(() => {
    setShowNewPostForm(!showNewPostForm);
    if (!showNewPostForm) window.scrollTo({ top: 0, behavior: "smooth" });
  }, [showNewPostForm]);

  return (
    <>
      <Container maxW="8xl" mx="auto" px={{ base: 4, md: 8 }} py={6} mt={{ base: 0, md: 8 }} mb={8}>
        <Box mb={8}></Box>
        <Grid templateColumns={{ base: "1fr", md: "280px 1fr 340px" }} gap={8} alignItems="start">
          <GridItem display={{ base: "none", md: "block" }}>
            <ForumSidebar selectedCategory={selectedCategory} view={view} onSelectCategory={handleSelectCategory} onGoLatest={goLatest} onGoTop={goTop} categories={categories} />
          </GridItem>
          <GridItem>
            <VStack align="stretch" spacing={4}>
              <ForumHeader selectedPostId={selectedPostId} selectedCategory={selectedCategory} selectedPostTitle={selectedPostTitle} onClose={closePost} />
              {selectedPostId ? (
                <Objava postId={selectedPostId} onBack={closePost} />
              ) : (
                <>
                  <Collapse in={showNewPostForm} animateOpacity>
                    <Box bg="linear-gradient(145deg, #ffffff 0%, #fafbfc 100%)" borderRadius="20px" boxShadow="0 4px 20px rgba(0, 0, 0, 0.06), 0 1px 4px rgba(0, 0, 0, 0.04)" border="1px solid" borderColor="rgba(236, 95, 140, 0.1)" p={6} pt={8} mb={4} position="relative" overflow="hidden">
                      <NovaObjava apiBase={API_BASE} onSuccess={handleNewPostSuccess} onCancel={handleNewPostCancel} hideBackButton={true} showInCard={false} />
                    </Box>
                  </Collapse>
                  <SearchInput value={searchQuery} onChange={setSearchQuery} placeholder="Išči po forumu..." display={{ base: "block", md: "none" }} />
                  {error && <Box color="red.600" fontSize="sm">{error}</Box>}
                  {loading ? (
                    <>
                      <Skeleton height="84px" borderRadius="md" />
                      <Skeleton height="84px" borderRadius="md" />
                      <Skeleton height="84px" borderRadius="md" />
                    </>
                  ) : filteredItems.length === 0 ? (
                    <Text color="gray.600">{searchQuery ? "Ni rezultatov za vaše iskanje." : "Ni objav."}</Text>
                  ) : (
                    <PostList posts={filteredItems} postLikes={postLikes} likingPosts={likingPosts} onLike={handleLike} onOpen={openPost} onReport={(p) => { setReportingPost(p); onReportOpen(); }} navigate={navigate} loadingMore={loadingMore} hasMore={hasMore} searchQuery={searchQuery} />
                  )}
                </>
              )}
            </VStack>
          </GridItem>
          <GridItem className="forum-promotion-column" display={{ base: "none", md: "block" }}>
            <VStack align="stretch" spacing={4}>
              <Box h="40px" display="flex" alignItems="center">
                <SearchInput value={searchQuery} onChange={setSearchQuery} placeholder="Išči..." display={{ base: "none", md: "block" }} />
              </Box>
              <Box bg="#fff" border="1px solid" borderColor="#efefef" borderRadius="0" p={4}>
                <VStack spacing={4} align="stretch">
                  <FeaturedContent featuredPost={featuredPost} featuredComment={featuredComment} loadingPost={loadingPost} loadingComment={loadingComment} onDownload={handleDownload} />
                </VStack>
              </Box>
            </VStack>
          </GridItem>
        </Grid>
        <FloatingButtons onNewPost={handleNewPostClick} onAIChat={() => setIsAIChatOpen(true)} show={!selectedPostId} />
        <AIChat isOpen={isAIChatOpen} onClose={() => setIsAIChatOpen(false)} />
      </Container>
      <Box display={{ base: "none", md: "block" }}><Footer /></Box>
      <ReportPostModal isOpen={isReportOpen} onClose={onReportClose} postId={reportingPost?.id} postTitle={reportingPost?.title} postAuthor={reportingPost?.author} apiBase={API_BASE} />
    </>
  );
}
