
-- Allow admins to delete orders
CREATE POLICY "Admins can delete orders"
ON public.orders
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Allow users to delete their own pending orders
CREATE POLICY "Users can delete own pending orders"
ON public.orders
FOR DELETE
USING (auth.uid() = user_id AND status = 'pending');

-- Allow deletion of order items when order is deleted
CREATE POLICY "Admins can delete order items"
ON public.order_items
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can delete own order items"
ON public.order_items
FOR DELETE
USING (EXISTS (
  SELECT 1 FROM orders
  WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid()
));
