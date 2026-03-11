import { useState } from "react";
import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    ModalCloseButton,
    Button,
    VStack,
    Text,
    FormControl,
    Textarea,
    useToast
} from "@chakra-ui/react";
import { API_BASE } from "../../../api/config";

const ReportCommentModal = ({
    isOpen,
    onClose,
    commentId,
    commentContent,
    commentAuthor,
    apiBase = API_BASE
}) => {
    const [reportReason, setReportReason] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const toast = useToast();

    const handleSubmit = async () => {
        if (!reportReason.trim() || !commentId) return;

        setSubmitting(true);
        try {
            const res = await fetch(`${apiBase}/api/comments/${commentId}/report`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    reason: reportReason.trim(),
                    commentContent: commentContent || "Neznano",
                    commentAuthor: commentAuthor || "Neznano",
                    commentId: commentId
                })
            });

            if (!res.ok) throw new Error("Napaka pri pošiljanju prijave");

            toast({
                status: "success",
                title: "Prijava poslana",
                description: "Hvala za prijavo. Preverili bomo komentar.",
                duration: 3000
            });

            handleClose();
        } catch (err) {
            console.error(err);
            toast({
                status: "error",
                title: "Napaka",
                description: "Prijave ni bilo mogoče poslati. Prosim poskusite znova.",
            });
        } finally {
            setSubmitting(false);
        }
    };

    const handleClose = () => {
        setReportReason("");
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={handleClose}>
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>Prijavi neprimeren komentar</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <VStack spacing={4} align="stretch">
                        <Text fontSize="sm" color="gray.600">
                            Zakaj je ta komentar neprimeren?
                        </Text>
                        <FormControl isRequired>
                            <Textarea
                                value={reportReason}
                                onChange={(e) => setReportReason(e.target.value)}
                                placeholder="Prosimo, opišite zakaj menite, da je ta komentar neprimeren..."
                                rows={6}
                                focusBorderColor="brand.500"
                            />
                        </FormControl>
                    </VStack>
                </ModalBody>
                <ModalFooter>
                    <Button variant="ghost" mr={3} onClick={handleClose}>
                        Prekliči
                    </Button>
                    <Button
                        bg="brand.500"
                        color="white"
                        _hover={{ bg: "brand.600" }}
                        onClick={handleSubmit}
                        isLoading={submitting}
                        isDisabled={!reportReason.trim()}
                    >
                        Pošlji prijavo
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};

export default ReportCommentModal;