/**
 * Send a message with optional attachments.
 * Handles upload, Firestore write, DM/channel touch, and markRead.
 */
import {
  sendMessage as sendMessageToFirestore,
  uploadAttachment,
  touchDmLastMessage,
  touchChannelLastMessage,
  markRead,
} from "@/lib";

export async function sendMessageWithAttachments({
  serverId,
  channelId,
  content,
  attachments,
  replyTarget,
  firebaseUser,
  userDoc,
}) {
  const trimmed = content.trim();

  // Upload attachments first
  const uploadedAttachments = await Promise.all(
    attachments.map(async (att) => {
      const url = await uploadAttachment(serverId, channelId, att.file);
      return {
        url,
        type: att.type,
        name: att.file.name,
        size: att.file.size,
      };
    }),
  );

  const replyTo = replyTarget
    ? {
        messageId: replyTarget.id,
        authorId: replyTarget.authorId,
        authorName: replyTarget.authorName,
        authorAvatar: replyTarget.authorAvatar ?? null,
        content: (replyTarget.content ?? "").slice(0, 100),
      }
    : null;

  await sendMessageToFirestore(serverId, channelId, {
    content: trimmed,
    authorId: firebaseUser.uid,
    authorName:
      userDoc?.displayName ?? firebaseUser.displayName ?? "Nutzer",
    authorAvatar: userDoc?.avatarUrl ?? null,
    type: replyTo ? "reply" : "default",
    replyTo,
    attachments: uploadedAttachments,
    reactions: {},
  });

  if (!serverId) {
    await touchDmLastMessage(channelId, {
      content: trimmed || (uploadedAttachments.length ? "📎 Anhang" : ""),
      authorId: firebaseUser.uid,
    });
  } else {
    await touchChannelLastMessage(serverId, channelId);
  }

  // Sending counts as having read up to this point
  await markRead(firebaseUser.uid, channelId);
}