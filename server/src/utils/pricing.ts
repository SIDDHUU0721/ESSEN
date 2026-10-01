import { IMenuItem } from '../models/MenuItem';
import { IOrderItemSnapshot, IOrderPricingSnapshot, OrderType } from '../models/Order';

export interface CartInputItem {
  menuItemId: string;
  quantity: number;
  selectedCustomizations?: Array<{
    groupName: string;
    optionName: string;
  }>;
  specialInstructions?: string;
}

export const calculateOrderPricing = (
  itemsWithDetails: Array<{ itemDoc: IMenuItem; input: CartInputItem }>,
  orderType: OrderType,
  discountAmount = 0,
  couponCode?: string,
  tipAmount = 0
): { items: IOrderItemSnapshot[]; pricing: IOrderPricingSnapshot } => {
  const itemSnapshots: IOrderItemSnapshot[] = [];
  let itemTotal = 0;

  for (const { itemDoc, input } of itemsWithDetails) {
    let unitPrice = itemDoc.price;
    const validatedCustomizations: Array<{ groupName: string; optionName: string; price: number }> = [];

    if (input.selectedCustomizations && input.selectedCustomizations.length > 0) {
      for (const sel of input.selectedCustomizations) {
        const group = itemDoc.customizationGroups.find((g) => g.name === sel.groupName);
        if (group) {
          const option = group.options.find((o) => o.name === sel.optionName);
          if (option) {
            unitPrice += option.price;
            validatedCustomizations.push({
              groupName: group.name,
              optionName: option.name,
              price: option.price,
            });
          }
        }
      }
    }

    const itemSubtotal = unitPrice * input.quantity;
    const taxRate = 5; // Standard 5% GST on Restaurant Food
    const taxAmount = Number(((itemSubtotal * taxRate) / 100).toFixed(2));

    itemTotal += itemSubtotal;

    itemSnapshots.push({
      menuItemId: itemDoc._id as any,
      name: itemDoc.name,
      image: itemDoc.image,
      quantity: input.quantity,
      unitPrice,
      taxRate,
      taxAmount,
      customizations: validatedCustomizations,
      specialInstructions: input.specialInstructions,
      itemTotal: itemSubtotal,
    });
  }

  // Ensure discount does not exceed item total
  const finalDiscount = Math.min(discountAmount, itemTotal);
  const taxableAmount = Math.max(0, itemTotal - finalDiscount);

  // Applicable taxes: 5% total (2.5% CGST + 2.5% SGST)
  const applicableTaxes = Number(((taxableAmount * 5) / 100).toFixed(2));

  // Service charge: 5% for dine-in, ₹0 for online
  const serviceCharge = orderType === 'dine_in' ? Number(((taxableAmount * 5) / 100).toFixed(2)) : 0;

  // Delivery fee: ₹40 for online delivery orders under ₹500, free above ₹500
  const deliveryFee = orderType === 'online' ? (itemTotal >= 500 ? 0 : 40) : 0;

  // Packaging fee: ₹20 for online/takeaway orders
  const packagingFee = orderType === 'online' || orderType === 'takeaway' ? 20 : 0;

  const validTip = Math.max(0, tipAmount);

  const grandTotal = Number(
    (taxableAmount + applicableTaxes + serviceCharge + deliveryFee + packagingFee + validTip).toFixed(2)
  );

  return {
    items: itemSnapshots,
    pricing: {
      itemTotal: Number(itemTotal.toFixed(2)),
      discountAmount: Number(finalDiscount.toFixed(2)),
      couponCode,
      taxableAmount: Number(taxableAmount.toFixed(2)),
      applicableTaxes,
      serviceCharge,
      deliveryFee,
      packagingFee,
      tipAmount: Number(validTip.toFixed(2)),
      grandTotal,
    },
  };
};
