/**
 * Messaging Service
 * 
 * Backend service for handling in-app messaging between
 * coaches and learners, including notifications.
 * 
 * @module messagingService
 */

import sgMail from '@sendgrid/mail';

// Initialize SendGrid
sgMail.setApiKey(process.env.SENDGRID_API_KEY || '');

// Types
interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderRole: 'coach' | 'learner';
  content: string;
  attachments?: Attachment[];
  createdAt: string;
  readAt?: string;
}

interface Attachment {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
}

interface Conversation {
  id: string;
  participants: Participant[];
  lastMessage?: Message;
  unreadCount: number;
  createdAt: string;
  updatedAt: string;
}

interface Participant {
  id: string;
  name: string;
  email: string;
  role: 'coach' | 'learner';
  avatar?: string;
  isOnline: boolean;
  notificationPreferences: {
    email: boolean;
    push: boolean;
  };
}

// Messaging Service Class
export class MessagingService {
  async createConversation(coachId: string, learnerId: string): Promise<Conversation> {
    const conversationId = `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const conversation: Conversation = {
      id: conversationId,
      participants: [],
      unreadCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await this.storeConversation(conversation);
    return conversation;
  }

  async sendMessage(conversationId: string, senderId: string, content: string): Promise<Message> {
    const messageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const sender = await this.getUserById(senderId);

    const message: Message = {
      id: messageId,
      conversationId,
      senderId,
      senderName: sender.name,
      senderRole: sender.role,
      content,
      createdAt: new Date().toISOString(),
    };

    await this.storeMessage(message);
    await this.updateConversationLastMessage(conversationId, message);
    await this.sendNotifications(conversationId, message);

    return message;
  }

  async getMessages(conversationId: string, limit = 50): Promise<Message[]> {
    const response = await fetch(`/api/db/messages?conversationId=${conversationId}&limit=${limit}`);
    return response.json();
  }

  async getConversations(userId: string): Promise<Conversation[]> {
    const response = await fetch(`/api/db/conversations?userId=${userId}`);
    return response.json();
  }

  async markAsRead(conversationId: string, userId: string): Promise<void> {
    await fetch('/api/db/messages/mark-read', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ conversationId, userId, readAt: new Date().toISOString() }),
    });
  }

  private async sendNotifications(conversationId: string, message: Message): Promise<void> {
    const conversation = await this.getConversationById(conversationId);
    const recipient = conversation.participants.find((p) => p.id !== message.senderId);

    if (!recipient) return;

    if (recipient.notificationPreferences.email) {
      await this.sendEmailNotification(recipient, message);
    }

    if (recipient.notificationPreferences.push) {
      await this.sendPushNotification(recipient, message);
    }
  }

  private async sendEmailNotification(recipient: Participant, message: Message): Promise<void> {
    const senderLabel = message.senderRole === 'coach' ? 'Votre coach' : 'Votre apprenant';

    const emailContent = {
      to: recipient.email,
      from: { email: 'messages@rusingacademy.com', name: 'RusingÂcademy' },
      subject: `${senderLabel} ${message.senderName} vous a envoyé un message`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #1A1A1A; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #1E3A5F; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #FFFFFF; padding: 25px; border: 1px solid #E5E7EB; }
            .message-box { background: #F8F9FA; padding: 15px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #C9A227; }
            .cta-button { display: inline-block; background: #C9A227; color: white; padding: 12px 25px; text-decoration: none; border-radius: 8px; font-weight: 600; }
            .footer { background: #F8F9FA; padding: 15px; text-align: center; font-size: 12px; color: #6B7280; border-radius: 0 0 8px 8px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2 style="margin: 0;">Nouveau Message</h2>
            </div>
            <div class="content">
              <p>Bonjour ${recipient.name},</p>
              <p>${senderLabel} <strong>${message.senderName}</strong> vous a envoyé un message :</p>
              <div class="message-box">
                <p style="margin: 0; font-style: italic;">"${message.content.substring(0, 200)}${message.content.length > 200 ? '...' : ''}"</p>
              </div>
              <center>
                <a href="https://rusingacademy.com/portal/messages" class="cta-button">Répondre au Message</a>
              </center>
            </div>
            <div class="footer">
              <p>© 2026 Rusinga International Consulting Ltd.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    try {
      await sgMail.send(emailContent);
      console.log(`[MessagingService] Email notification sent to ${recipient.email}`);
    } catch (error) {
      console.error('[MessagingService] Failed to send email notification:', error);
    }
  }

  private async sendPushNotification(recipient: Participant, message: Message): Promise<void> {
    const notification = {
      userId: recipient.id,
      title: `Message de ${message.senderName}`,
      body: message.content.substring(0, 100) + (message.content.length > 100 ? '...' : ''),
      icon: '/icons/message-notification.png',
      data: { type: 'new_message', conversationId: message.conversationId, messageId: message.id },
      url: `https://rusingacademy.com/portal/messages?conversation=${message.conversationId}`,
    };

    try {
      await fetch('/api/notifications/push', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(notification),
      });
      console.log(`[MessagingService] Push notification sent to ${recipient.id}`);
    } catch (error) {
      console.error('[MessagingService] Failed to send push notification:', error);
    }
  }

  private async getUserById(userId: string): Promise<any> {
    const response = await fetch(`/api/db/users/${userId}`);
    return response.json();
  }

  private async getConversationById(conversationId: string): Promise<Conversation> {
    const response = await fetch(`/api/db/conversations/${conversationId}`);
    return response.json();
  }

  private async storeConversation(conversation: Conversation): Promise<void> {
    await fetch('/api/db/conversations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(conversation),
    });
  }

  private async storeMessage(message: Message): Promise<void> {
    await fetch('/api/db/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(message),
    });
  }

  private async updateConversationLastMessage(conversationId: string, message: Message): Promise<void> {
    await fetch(`/api/db/conversations/${conversationId}/last-message`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lastMessage: message, updatedAt: new Date().toISOString() }),
    });
  }
}

export const messagingService = new MessagingService();
export default messagingService;
