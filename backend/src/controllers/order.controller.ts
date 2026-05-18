import { Request, Response } from 'express';
import { z } from 'zod';
import { OrderService } from '../services/order.service';
import { ApiResponse } from '../utils/ApiResponse';
import { parsePagination } from '../utils/pagination';
import { OrderStatus } from '../constants/orderStatus';

const orderService = new OrderService();

const addressSchema = z.object({
  line1: z.string().min(1),
  line2: z.string().optional(),
  city: z.string().min(1),
  state: z.string().min(1),
  postalCode: z.string().min(1),
  country: z.string().min(1),
});

export class OrderController {
  create = async (req: Request, res: Response): Promise<void> => {
    const { shippingAddress, couponCode, notes } = z
      .object({
        shippingAddress: addressSchema,
        couponCode: z.string().optional(),
        notes: z.string().max(500).optional(),
      })
      .parse(req.body);

    const order = await orderService.create({
      userId: req.user!.sub,
      shippingAddress,
      couponCode,
      notes,
    });

    ApiResponse.created(res, order, 'Order placed successfully');
  };

  listUserOrders = async (req: Request, res: Response): Promise<void> => {
    const pagination = parsePagination(req);
    const { orders, meta } = await orderService.listByUser(req.user!.sub, pagination);
    ApiResponse.paginated(res, orders, meta);
  };

  getById = async (req: Request, res: Response): Promise<void> => {
    const order = await orderService.getById(req.params.id, req.user!.sub);
    ApiResponse.success(res, order);
  };

  cancel = async (req: Request, res: Response): Promise<void> => {
    const order = await orderService.cancel(req.params.id, req.user!.sub);
    ApiResponse.success(res, order, 'Order cancelled');
  };

  updateStatus = async (req: Request, res: Response): Promise<void> => {
    const { status, note } = z
      .object({ status: z.nativeEnum(OrderStatus), note: z.string().optional() })
      .parse(req.body);
    const order = await orderService.updateStatus(req.params.id, status, note);
    ApiResponse.success(res, order, 'Status updated');
  };
}
