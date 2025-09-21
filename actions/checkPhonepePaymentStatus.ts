"use server";

import { phonepeClient } from "@/lib/phonepe";
import { StandardCheckoutStatusRequest } from 'pg-sdk-node';

export async function checkPhonepePaymentStatus({
  merchantOrderId,
}: {
  merchantOrderId: string;
}) {
  try {
    const request = StandardCheckoutStatusRequest.builder()
      .merchantOrderId(merchantOrderId)
      .build();

    const response = await phonepeClient.status(request);
    
    return {
      orderId: response.order_id,
      merchantOrderId: response.merchant_order_id,
      state: response.state,
      amount: response.amount,
      code: response.code,
      message: response.message,
      data: response.data,
    };
  } catch (error) {
    console.error("PhonePe status check error:", error);
    throw new Error("Failed to check PhonePe payment status");
  }
}
