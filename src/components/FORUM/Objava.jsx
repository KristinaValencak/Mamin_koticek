import { useState } from "react";
import {
  Box, Heading, Text, VStack, HStack,
  Skeleton, IconButton, Button, Avatar, Textarea, FormControl,
  FormErrorMessage, useToast,
  Menu, MenuButton, MenuList, MenuItem,
  useDisclosure,
  Checkbox,
  Flex
} from "@chakra-ui/react";
import CommentsList from "./Comments/CommentsList";
import { usePost } from "../../hooks/posts/usePost";
import { useComments } from "../../hooks/comments/useComments";
import { useCommentLikes } from "../../hooks/comments/useCommentLikes";
import { API_BASE } from "../../api/config";

import { BsThreeDotsVertical } from "react-icons/bs";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import { FaComment } from "react-icons/fa";
import ReportPostModal from "./Report/ReportPostModal";
import ReportCommentModal from "./Report/ReportCommentModal";
import { useNavigate } from "react-router-dom";
import { FaStar, FaRegStar } from "react-icons/fa";

export default function Objava({ postId, onBack }) {
  const { post, loading: loadingPost, error, likes, liking, handleLike, deletePost, toggleFeature, setPost } = usePost(postId);
  const { comments, loading: loadingComments, loadingMore, hasMore, totalCount, loadMoreComments, addComment, deleteComment, toggleFeature: toggleCommentFeature, reloadComments } = useComments(postId);
  const { commentLikes, likingComments, handleLike: handleCommentLike } = useCommentLikes(comments);

  const [replyOpen, setReplyOpen] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [isCommentAnonymous, setIsCommentAnonymous] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const toast = useToast();
  const navigate = useNavigate();

  const { isOpen: isReportOpen, onOpen: onReportOpen, onClose: onReportClose } = useDisclosure();
  const { isOpen: isReportCommentOpen, onOpen: onReportCommentOpen, onClose: onReportCommentClose } = useDisclosure();
  const [reportingComment, setReportingComment] = useState(null);

  const [user] = useState(() => {
    try {
      const stored = localStorage.getItem("user");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const isAdmin = user?.isAdmin === true;

  const formatDate = (iso) =>
    new Date(iso).toLocaleString(undefined, {
      year: "numeric", month: "short", day: "2-digit",
      hour: "2-digit", minute: "2-digit",
    });

  const handleSubmit = async () => {
    if (!replyText.trim()) return;
    setSubmitting(true);
    const newComment = await addComment(replyText.trim(), isCommentAnonymous);
    if (newComment) {
      setReplyText("");
      setIsCommentAnonymous(false);
      setReplyOpen(false);
    }
    setSubmitting(false);
  };

  const handleCommentDelete = async (commentId) => {
    if (!confirm("Ali ste prepričani, da želite izbrisati ta komentar?")) return;
    await deleteComment(commentId);
  };

  const handleCommentFeature = async (commentId, isFeatured) => {
    await toggleCommentFeature(commentId, isFeatured);
  };

  const handleReplyAdded = async () => {
    await reloadComments();
  };

  const handlePostDelete = async () => {
    if (!confirm("Ali ste prepričani, da želite izbrisati to objavo?")) return;
    const deleted = await deletePost();
    if (deleted) {
      if (onBack) onBack();
      else navigate("/");
    }
  };

  const handlePostFeature = async () => {
    await toggleFeature(!post.isFeatured);
  };

  return (
    <VStack align="stretch" spacing={4}>
      {error && <Box color="red.600" fontSize="sm">{error}</Box>}

      {loadingPost ? (
        <Skeleton height="160px" borderRadius="md" />
      ) : post ? (
        <Box className="forum-objava-detail" position="relative">
          {post.isFeatured && (
            <Box position="absolute" top="-8px" right="12px" zIndex={10}>
              <FaStar size="16px" color="#FFD700" title="Najboljša objava tedna" />
            </Box>
          )}

          <Box className="forum-post-card-header">
            <HStack justify="space-between" align="center" w="full">
              <HStack spacing={3} flex="1">
                <Avatar
                  name={post.author || "Uporabnik"}
                  size="sm"
                  bg="gray.300"
                  cursor={post.userId ? "pointer" : "default"}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (post.userId) navigate(`/user/${post.userId}`);
                  }}
                />
                <Box
                  as="span"
                  color="#262626"
                  fontWeight="600"
                  fontSize="sm"
                  cursor={post.userId ? "pointer" : "default"}
                  _hover={post.userId ? { color: "gray.600" } : {}}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (post.userId) navigate(`/user/${post.userId}`);
                  }}
                >
                  {post.author || "neznano"}
                </Box>
              </HStack>
              <Menu placement="bottom-end">
                <MenuButton
                  as={IconButton}
                  icon={<BsThreeDotsVertical />}
                  variant="ghost"
                  size="sm"
                  onClick={(e) => e.stopPropagation()}
                  _hover={{ bg: "gray.100" }}
                  aria-label="Možnosti"
                />
                <MenuList>
                  <MenuItem onClick={onReportOpen}>
                    Prijavi neprimerno objavo
                  </MenuItem>
                  {isAdmin && (
                    <>
                      <MenuItem
                        color="red.600"
                        onClick={handlePostDelete}
                      >
                        Izbriši objavo (Admin)
                      </MenuItem>
                      <MenuItem
                        icon={post.isFeatured ? <FaRegStar /> : <FaStar />}
                        onClick={handlePostFeature}
                      >
                        {post.isFeatured ? "Odstrani zvezdico" : "Označi kot najboljšo tedna"}
                      </MenuItem>
                    </>
                  )}
                </MenuList>
              </Menu>
            </HStack>
          </Box>

          <Box>
            <Heading className="forum-post-card-title" as="h1" fontSize="1rem" fontWeight="600">{post.title}</Heading>
          </Box>

          <Box className="forum-post-card-content">
            <Text className="forum-objava-body" whiteSpace="pre-wrap">{post.content}</Text>
          </Box>

          <Box className="forum-post-card-footer">
            <HStack spacing={4} fontSize="xs" color="gray.500" justify="space-between">
              <Text>{formatDate(post.createdAt)}</Text>
              <HStack spacing={3}>
                <HStack spacing={1}>
                  <IconButton
                    icon={likes.isLiked ? <FaHeart /> : <FaRegHeart />}
                    aria-label={likes.isLiked ? "Odlajkaj" : "Lajkaj"}
                    onClick={(e) => { e.stopPropagation(); handleLike(); }}
                    isLoading={liking}
                    color={likes.isLiked ? "#ed4956" : "gray.600"}
                    variant="ghost"
                    size="xs"
                  />
                  <Text as="span" color="gray.600">{likes.count}</Text>
                </HStack>
                <HStack spacing={1}>
                  <FaComment size="12px" color="gray" />
                  <Text as="span" color="gray.600">{comments.length}</Text>
                </HStack>
              </HStack>
            </HStack>
          </Box>

          <Flex py={2} px={5} justify="flex-end">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setReplyOpen((v) => !v)}
              color="gray.500"
              fontWeight="500"
              _hover={{ color: "#262626" }}
            >
              Dodaj komentar
            </Button>
          </Flex>


          {replyOpen && (
            <Box className="forum-post-reply">
              <FormControl isInvalid={!replyText.trim() && replyText.length > 0}>
                <Textarea
                  placeholder="Napiši komentar…"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  rows={4}
                  className="forum-reply-textarea"
                />
                {!replyText.trim() && replyText.length > 0 && (
                  <FormErrorMessage>Vsebina je obvezna.</FormErrorMessage>
                )}
              </FormControl>
              <FormControl mt={3}>
                <Checkbox
                  isChecked={isCommentAnonymous}
                  onChange={(e) => setIsCommentAnonymous(e.target.checked)}
                  colorScheme="brand"
                >
                  <Text fontSize="sm">Objavi kot anonimen član</Text>
                </Checkbox>
                <Text fontSize="xs" color="gray.500" mt={1}>
                  Tvojo ime bo videl/a samo administrator, drugi bodo videli "Anonimen član"
                </Text>
              </FormControl>
              <HStack mt={3} justify="flex-end" spacing={3}>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => { setReplyOpen(false); setReplyText(""); setIsCommentAnonymous(false); }}
                  color="gray.600"
                  _hover={{ color: "#262626" }}
                >
                  Prekliči
                </Button>
                <Button
                  size="sm"
                  onClick={handleSubmit}
                  isLoading={submitting}
                  isDisabled={!replyText.trim()}
                  bg="#EC5F8C"
                  color="white"
                  fontWeight="500"
                  _hover={{ bg: "#d94b7a" }}
                  _disabled={{ opacity: 0.5 }}
                >
                  Objavi
                </Button>
              </HStack>
            </Box>
          )}
        </Box>
      ) : (
        <Text color="gray.600">Objave ni mogoče prikazati.</Text>
      )
      }


      <CommentsList
        comments={comments}
        loadingComments={loadingComments}
        loadingMore={loadingMore}
        hasMore={hasMore}
        totalCount={totalCount}
        onLoadMore={loadMoreComments}
        postId={postId}
        isAdmin={isAdmin}
        user={user}
        commentLikes={commentLikes}
        likingComments={likingComments}
        onLike={handleCommentLike}
        onDelete={handleCommentDelete}
        onFeature={handleCommentFeature}
        onReplyAdded={handleReplyAdded}
        onReportComment={(comment) => { setReportingComment(comment); onReportCommentOpen(); }}
      />

      <ReportPostModal
        isOpen={isReportOpen}
        onClose={onReportClose}
        postId={postId}
        postTitle={post?.title}
        postAuthor={post?.author || post?.user?.username}
        apiBase={API_BASE}
      />
      <ReportCommentModal
        isOpen={isReportCommentOpen}
        onClose={() => { onReportCommentClose(); setReportingComment(null); }}
        commentId={reportingComment?.id}
        commentContent={reportingComment?.content}
        commentAuthor={reportingComment?.user?.username}
        apiBase={API_BASE}
      />
    </VStack >
  );
}