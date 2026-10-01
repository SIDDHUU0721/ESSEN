import { Request, Response, NextFunction } from 'express';
import { SupportTicket } from '../models/SupportTicket';
import { AuthRequest } from '../middleware/auth';

export class SupportController {
  public static async createTicket(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { category, subject, message, orderId, restaurantId, priority } = req.body;
      const ticketNumber = `TCK-${Date.now().toString().slice(-5)}`;

      const ticket = await SupportTicket.create({
        ticketNumber,
        customer: req.userId,
        restaurant: restaurantId,
        order: orderId,
        category,
        subject,
        priority: priority || 'MEDIUM',
        status: 'OPEN',
        messages: [
          {
            sender: req.userId as any,
            senderName: req.user?.name || 'Customer',
            senderRole: 'customer',
            message,
            timestamp: new Date(),
          },
        ],
      });

      res.status(201).json({
        success: true,
        message: 'Support ticket created. Our team will assist you shortly.',
        data: { ticket },
      });
    } catch (error) {
      next(error);
    }
  }

  public static async getMyTickets(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const tickets = await SupportTicket.find({ customer: req.userId })
        .populate('restaurant', 'name')
        .sort({ createdAt: -1 });

      res.status(200).json({
        success: true,
        data: { tickets },
      });
    } catch (error) {
      next(error);
    }
  }

  public static async addMessage(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { message } = req.body;

      const ticket = await SupportTicket.findById(id);
      if (!ticket) {
        res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Ticket not found' } });
        return;
      }

      ticket.messages.push({
        sender: req.userId as any,
        senderName: req.user?.name || 'User',
        senderRole: (req.userRole as any) || 'customer',
        message,
        timestamp: new Date(),
      });

      if (req.userRole === 'admin' || req.userRole === 'manager') {
        ticket.status = 'IN_PROGRESS';
      }

      await ticket.save();

      res.status(200).json({
        success: true,
        data: { ticket },
      });
    } catch (error) {
      next(error);
    }
  }
}
