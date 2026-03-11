import { useState } from "react";
import {
    Box, HStack, VStack, Text, Avatar, IconButton, Button,
    Menu, MenuButton, MenuList, MenuItem, Collapse, FormControl, Checkbox, Textarea
} from "@chakra-ui/react";
import { FaHeart, FaRegHeart, FaComment, FaStar, FaRegStar, FaChevronDown, FaChevronUp } from "react-icons/fa";
import { BsThreeDotsVertical } from "react-icons/bs";
import { API_BASE } from "../../../api/config";
import { useToast } from "@chakra-ui/react";

export default function CommentCard({
    comment,
    postId,
    isAdmin,
    user,
    commentLikes,
    likingComments,
    onLike,
    onDelete,
    onFeature,
    onReplyAdded,
    onReport,
    repliesExpanded,
    onToggleReplies
}) {
    const [replyFormOpen, setReplyFormOpen] = useState(false);
    const [replyText, setReplyText] = useState("");
    const [isAnonymous, setIsAnonymous] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const toast = useToast();

    const replyCount = comment.replies?.length || 0;

    const formatDate = (iso) =>
        new Date(iso).toLocaleString(undefined, {
            year: "numeric", month: "short", day: "2-digit",
            hour: "2-digit", minute: "2-digit",
        });

    const handleSubmitReply = async () => {
        if (!replyText.trim()) return;
        if (!user) {
            toast({ status: "warning", title: "Za odgovor se morate prijaviti." });
            return;
        }
        setSubmitting(true);
        try {
            const res = await fetch(`${API_BASE}/api/comments/${comment.id}/replies`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ content: replyText.trim(), isAnonymous }),
            });
            if (res.ok) {
                setReplyText("");
                setIsAnonymous(false);
                setReplyFormOpen(false);
                onReplyAdded?.();
                toast({ status: "success", title: "Odgovor dodan." });
            } else {
                toast({ status: "error", title: "Napaka pri dodajanju odgovora." });
            }
        } catch (e) {
            toast({ status: "error", title: "Napaka pri dodajanju odgovora." });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Box py={3}>
            <HStack align="flex-start" spacing={3}>
                <Avatar
                    size="sm"
                    name={comment.user?.username || "Anonimen"}
                    bgGradient="linear(135deg, #EC5F8C 0%, #F48FB1 100%)"
                />
                <VStack align="stretch" spacing={1} flex="1">
                    <HStack justify="space-between" align="center" w="full">
                        <HStack spacing={2}>
                            <Text fontSize="sm" fontWeight="600">
                                {comment.user?.username || "Anonimen član"}
                            </Text>
                            <Text fontSize="xs" color="gray.400">
                                {formatDate(comment.createdAt)}
                            </Text>
                            {comment.isFeatured && (
                                <Box as="span" title="Najboljši komentar tedna">
                                    <FaStar size="12px" color="#FFD700" />
                                </Box>
                            )}
                        </HStack>
                        <Menu placement="bottom-end">
                            <MenuButton
                                as={IconButton}
                                icon={<BsThreeDotsVertical />}
                                variant="ghost"
                                size="xs"
                                aria-label="Možnosti"
                                onClick={(e) => e.stopPropagation()}
                            />
                            <MenuList>
                                <MenuItem onClick={() => onReport && onReport(comment)}>
                                    Prijavi neprimeren komentar
                                </MenuItem>
                                {isAdmin && (
                                    <>
                                        <MenuItem color="red.600" onClick={() => onDelete?.(comment.id)}>
                                            Izbriši komentar (Admin)
                                        </MenuItem>
                                        <MenuItem
                                            icon={comment.isFeatured ? <FaRegStar /> : <FaStar />}
                                            onClick={() => onFeature?.(comment.id, !comment.isFeatured)}
                                        >
                                            {comment.isFeatured ? "Odstrani zvezdico" : "Označi kot najboljši tedna"}
                                        </MenuItem>
                                    </>
                                )}
                            </MenuList>
                        </Menu>
                    </HStack>

                    <Text fontSize="sm" color="gray.800" lineHeight="1.5" whiteSpace="pre-wrap">
                        {comment.content}
                    </Text>

                    <HStack spacing={4} pt={1}>
                        <HStack spacing={1}>
                            <IconButton
                                size="xs"
                                variant="ghost"
                                icon={commentLikes?.[comment.id]?.isLiked ? <FaHeart /> : <FaRegHeart />}
                                onClick={(e) => onLike?.(comment.id, e)}
                                isLoading={likingComments?.[comment.id]}
                                color={commentLikes?.[comment.id]?.isLiked ? "#EC5F8C" : "gray.500"}
                            />
                            <Text fontSize="xs">{commentLikes?.[comment.id]?.count || 0}</Text>
                        </HStack>

                        {replyCount > 0 && (
                            <Button
                                size="xs"
                                variant="ghost"
                                fontWeight="normal"
                                fontSize="xs"
                                color="gray.500"
                                rightIcon={repliesExpanded ? <FaChevronUp size="10px" /> : <FaChevronDown size="10px" />}
                                onClick={onToggleReplies}
                                _hover={{ color: "#EC5F8C", bg: "rgba(236, 95, 140, 0.08)" }}
                            >
                                {replyCount} {replyCount === 1 ? "odgovor" : replyCount === 2 ? "odgovora" : "odgovorov"}
                            </Button>
                        )}

                        <Button
                            size="xs"
                            variant="ghost"
                            leftIcon={<FaComment size="10px" />}
                            onClick={() => setReplyFormOpen((v) => !v)}
                        >
                            Odgovori
                        </Button>
                    </HStack>

                    <Collapse in={replyFormOpen} animateOpacity>
                        <Box mt={3} pt={3} borderTop="1px solid" borderColor="gray.100">
                            <FormControl mb={2}>
                                <Textarea
                                    value={replyText}
                                    onChange={(e) => setReplyText(e.target.value)}
                                    placeholder="Napiši odgovor…"
                                    rows={3}
                                    size="sm"
                                    borderRadius="8px"
                                    borderColor="gray.200"
                                    _focus={{ borderColor: "#EC5F8C" }}
                                />
                            </FormControl>
                            <FormControl mb={2}>
                                <Checkbox
                                    size="sm"
                                    isChecked={isAnonymous}
                                    onChange={(e) => setIsAnonymous(e.target.checked)}
                                >
                                    <Text fontSize="xs">Objavi kot anonimen član</Text>
                                </Checkbox>
                            </FormControl>
                            <HStack spacing={2}>
                                <Button size="xs" variant="ghost" onClick={() => { setReplyFormOpen(false); setReplyText(""); }}>
                                    Prekliči
                                </Button>
                                <Button
                                    size="xs"
                                    bgGradient="linear(135deg, #EC5F8C 0%, #F48FB1 100%)"
                                    color="white"
                                    onClick={handleSubmitReply}
                                    isLoading={submitting}
                                    isDisabled={!replyText.trim()}
                                >
                                    Objavi
                                </Button>
                            </HStack>
                        </Box>
                    </Collapse>
                </VStack>
            </HStack>
        </Box>
    );
}
