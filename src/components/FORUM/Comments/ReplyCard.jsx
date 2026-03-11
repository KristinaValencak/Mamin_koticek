import { Box, HStack, VStack, Text, Avatar, IconButton } from "@chakra-ui/react";
import { FaHeart, FaRegHeart } from "react-icons/fa";

const formatDate = (iso) =>
    new Date(iso).toLocaleString(undefined, {
        year: "numeric", month: "short", day: "2-digit",
        hour: "2-digit", minute: "2-digit",
    });

export default function ReplyCard({ reply, commentLikes, likingComments, onLike }) {
    return (
        <Box pl={10} py={2} position="relative">
            <Box position="absolute" left="18px" top="0" bottom="0" w="2px" bg="gray.200" />

            <HStack align="flex-start" spacing={2}>
                <Avatar
                    size="xs"
                    name={reply.user?.username || "Anonimen"}
                    bgGradient="linear(135deg, #EC5F8C 0%, #F48FB1 100%)"
                />
                <VStack align="stretch" spacing={0} flex="1">
                    <HStack spacing={2}>
                        <Text fontSize="xs" fontWeight="600">
                            {reply.user?.username || "Anonimen član"}
                        </Text>
                        <Text fontSize="xs" color="gray.400">
                            {formatDate(reply.createdAt)}
                        </Text>
                    </HStack>
                    <Text fontSize="sm" color="gray.700" pt={0.5}>
                        {reply.content}
                    </Text>
                    <HStack spacing={2} pt={1}>
                        <IconButton
                            size="xs"
                            variant="ghost"
                            icon={commentLikes?.[reply.id]?.isLiked ? <FaHeart /> : <FaRegHeart />}
                            onClick={(e) => onLike?.(reply.id, e)}
                            isLoading={likingComments?.[reply.id]}
                            color={commentLikes?.[reply.id]?.isLiked ? "#EC5F8C" : "gray.500"}
                        />
                        <Text fontSize="xs">{commentLikes?.[reply.id]?.count || 0}</Text>
                    </HStack>
                </VStack>
            </HStack>
        </Box>
    );
}
