const PRODUCER_API =
  process.env.NEXT_PUBLIC_PRODUCER_API_URL ?? "http://localhost:8000";

export interface ProducerStatus {
  is_generating: boolean;
  producer_mode: string;
  events_per_second: number;
  continuous_events_generated: number;
  events_published: number;
  publish_failures: number;
  last_generated_event: unknown | null;
  last_error: string | null;
  last_publish_error: string | null;

  // Runtime summary fields returned by your producer.
  [key: string]: unknown;
}

async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${PRODUCER_API}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers ?? {}),
    },
  });

  if (!response.ok) {
    let detail = `Request failed with status ${response.status}`;

    try {
      const body = await response.json();

      if (body?.detail) {
        detail = body.detail;
      }
    } catch {
      // Keep the generic error.
    }

    throw new Error(detail);
  }

  return response.json();
}

export function getProducerStatus() {
  return request<ProducerStatus>("/producer/status");
}

export function startProducer(
  eventsPerSecond: number,
  publishToKafka: boolean,
) {
  return request("/producer/start", {
    method: "POST",
    body: JSON.stringify({
      events_per_second: eventsPerSecond,
      publish_to_kafka: publishToKafka,
    }),
  });
}

export function stopProducer() {
  return request("/producer/stop", {
    method: "POST",
  });
}

export function generateUser() {
  return request("/generate/user", {
    method: "POST",
  });
}

export function generateProductView() {
  return request("/generate/product-view", {
    method: "POST",
  });
}

export function generateOrder() {
  return request("/generate/order", {
    method: "POST",
  });
}

export function generatePayment() {
  return request("/generate/payment", {
    method: "POST",
  });
}

export function generateRandom() {
  return request("/generate/random", {
    method: "POST",
  });
}

export function clearState() {
  return request("/state/clear", {
    method: "POST",
  });
}

export async function exportState() {
  const response = await fetch(`${PRODUCER_API}/state/export`, {
    method: "POST",
  });

  if (!response.ok) {
    let detail = `Export failed with status ${response.status}`;

    try {
      const body = await response.json();

      if (body?.detail) {
        detail = body.detail;
      }
    } catch {
      // Keep generic error.
    }

    throw new Error(detail);
  }

  return response.blob();
}
