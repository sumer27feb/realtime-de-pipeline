const METRICS_API_URL =
  process.env.NEXT_PUBLIC_METRICS_API_URL ?? "http://127.0.0.1:8001";

async function fetchMetrics<T>(endpoint: string): Promise<T> {
  const response = await fetch(`${METRICS_API_URL}${endpoint}`);

  if (!response.ok) {
    let message = `Metrics API request failed: ${response.status}`;

    try {
      const body = await response.json();

      if (typeof body.detail === "string") {
        message = body.detail;
      }
    } catch {
      // Keep the default error message.
    }

    throw new Error(message);
  }

  return response.json();
}

// --------------------------------------------------
// Ecommerce Overview
// --------------------------------------------------

export interface EcommerceOverview {
  total_users: number;
  total_product_views: number;
  unique_viewers: number;
  total_orders: number;
  total_payment_attempts: number;
  successful_payments: number;
  order_value: number;
  successful_revenue: number;
  average_order_value: number;
  view_to_order_rate: number;
  payment_success_rate: number;
}

export function getOverview(): Promise<EcommerceOverview> {
  return fetchMetrics<EcommerceOverview>("/api/metrics/overview");
}

// --------------------------------------------------
// Product Performance
// --------------------------------------------------

export interface ProductPerformance {
  product_id: string;
  product_name: string;
  category: string;
  views: number;
  unique_viewers: number;
  orders: number;
  units_sold: number;
  order_value: number;
  successful_revenue: number;
  conversion_rate: number;
}

export function getProductPerformance(): Promise<ProductPerformance[]> {
  return fetchMetrics<ProductPerformance[]>("/api/metrics/products");
}

// --------------------------------------------------
// Payment Performance
// --------------------------------------------------

export interface PaymentPerformance {
  payment_mode: string;
  payment_provider: string;
  total_attempts: number;
  successful_attempts: number;
  failed_attempts: number;
  pending_attempts: number;
  total_payment_amount: number;
  successful_payment_amount: number;
  success_rate: number;
  failure_rate: number;
  pending_rate: number;
}

export function getPaymentPerformance(): Promise<PaymentPerformance[]> {
  return fetchMetrics<PaymentPerformance[]>("/api/metrics/payments");
}

// --------------------------------------------------
// Conversion Funnel
// --------------------------------------------------

export interface ConversionFunnel {
  total_users: number;
  total_product_views: number;
  total_orders: number;
  total_payment_attempts: number;
  successful_payments: number;
  views_per_user: number;
  view_to_order_rate: number;
  payment_attempts_per_order: number;
  payment_success_rate: number;
  view_to_successful_payment_rate: number;
}

export function getConversionFunnel(): Promise<ConversionFunnel> {
  return fetchMetrics<ConversionFunnel>("/api/metrics/conversion");
}

// --------------------------------------------------
// Event Activity
// --------------------------------------------------

export interface EventActivity {
  window_start: string;
  window_end: string;
  event_type: string;
  event_count: number;
  unique_users: number;
  events_per_active_user: number;
}

export function getEventActivity(): Promise<EventActivity[]> {
  return fetchMetrics<EventActivity[]>("/api/metrics/activity");
}
