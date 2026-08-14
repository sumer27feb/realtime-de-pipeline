# Real-Time E-Commerce Data Pipeline — V1

> **Project:** Real-Time E-Commerce Data Pipeline  
> **Dashboard:** E-Commerce Pulse  
> **Version:** V1  
> **Status:** Complete  
> **Primary stack:** FastAPI, Python, Apache Kafka, Databricks, dbt, Next.js, TypeScript, TanStack Query, ECharts

---

## 1. Project Overview

The **Real-Time E-Commerce Data Pipeline** is an end-to-end data engineering and analytics project that simulates an e-commerce platform producing continuous business events and transforms those events into analytics-ready datasets and an interactive business intelligence dashboard.

The project is designed around an event-driven architecture:

```text
FastAPI Event Producer
        |
        v
      Kafka
        |
        v
   Databricks
   Bronze Layer
        |
        v
       dbt
        |
        +----------------+
        |                |
      Silver            Gold
                         |
             +-----------+-----------+-----------+-----------+
             |           |           |           |           |
             v           v           v           v           v
         Overview    Activity    Conversion   Payments   Products
             |           |           |           |           |
             +-----------+-----------+-----------+-----------+
                                 |
                                 v
                         FastAPI Metrics API
                                 |
                                 v
                          TanStack Query
                                 |
                                 v
                              Next.js
                                 |
                                 v
                        E-Commerce Pulse
                                 |
                                 v
                              ECharts
```

### Core architectural principle

The project deliberately separates:

- event generation,
- event transportation,
- cloud data storage,
- analytical transformation,
- business metric serving,
- and visualization.

The result is a complete pipeline from raw business events to interactive analytics.

---

# 2. Technology Stack

| Layer           | Technology           | Responsibility                                   |
| --------------- | -------------------- | ------------------------------------------------ |
| Event producer  | FastAPI + Python     | Generate realistic e-commerce events             |
| Event transport | Apache Kafka         | Stream events between producer and data platform |
| Data platform   | Databricks           | Bronze storage and analytics platform            |
| Transformation  | dbt                  | Build Silver and Gold analytical models          |
| API             | FastAPI              | Serve Gold metrics to frontend                   |
| Frontend        | Next.js + TypeScript | Build analytics application                      |
| Server state    | TanStack Query       | Fetch/cache API data                             |
| Visualization   | Apache ECharts       | Interactive analytics visualizations             |
| Styling         | Tailwind CSS         | Dashboard UI and responsive layout               |

> **Important:** This V1 architecture does **not** use PostgreSQL anywhere. Databricks is the data platform, while dbt is responsible for the Silver and Gold transformation layer.

---

# 3. High-Level Architecture

```text
                         REAL-TIME E-COMMERCE PIPELINE

                              EVENT GENERATION
                                      |
                                      v
                             +-------------------+
                             |  FastAPI Producer |
                             |      Python       |
                             +---------+---------+
                                       |
                                       | JSON Events
                                       v
                             +-------------------+
                             |      Kafka        |
                             | Event Transport   |
                             +---------+---------+
                                       |
                                       v
                         +-------------------------+
                         |       Databricks        |
                         |                         |
                         |      Bronze Layer      |
                         |       Raw Events       |
                         +------------+------------+
                                      |
                                      | dbt
                                      v
                              +---------------+
                              |     Silver    |
                              | Clean / Model |
                              +-------+-------+
                                      |
                                      | dbt
                                      v
                              +---------------+
                              |      Gold     |
                              | Business KPIs |
                              +-------+-------+
                                      |
                  +-------------------+-------------------+
                  |                   |                   |
                  v                   v                   v
             Overview             Activity          Conversion
                  |                   |                   |
                  +-------------------+-------------------+
                                      |
                          +-----------+-----------+
                          |                       |
                          v                       v
                     Payments                 Products
                          |                       |
                          +-----------+-----------+
                                      |
                                      v
                           FastAPI Metrics API
                                      |
                                      v
                              TanStack Query
                                      |
                                      v
                                  Next.js
                                      |
                                      v
                              E-Commerce Pulse
                                      |
                                      v
                                   ECharts
```

---

# 4. Architectural Layers

The project follows a practical layered architecture.

```text
1. Event Generation
2. Event Streaming
3. Databricks Bronze
4. dbt Silver
5. dbt Gold
6. Metrics API
7. Frontend Data Layer
8. Visualization
```

Each layer has a distinct responsibility.

---

# 5. Event Generation Layer

## 5.1 FastAPI Producer

The producer is implemented using:

```text
FastAPI
Python
Pydantic
```

Its job is to generate realistic e-commerce events.

The producer can continuously generate events rather than relying on a fixed static dataset.

The major event types are:

```text
user_created
product_viewed
order_created
payment_completed
```

---

# 6. Producer Project Structure

The producer is organized approximately as:

```text
producer/
├── app/
│   ├── __init__.py
│   ├── config.py
│   ├── export_service.py
│   ├── main.py
│   ├── producer_service.py
│   ├── schemas.py
│   └── state.py
│
├── data/
│   ├── products.json
│   └── shipping_locations.json
│
├── generator/
│   ├── functions.py
│   └── helper.py
│
└── kafka/
    ├── serializer.py
    ├── topic_router.py
    ├── key_selector.py
    └── publisher.py
```

The separation keeps:

- API logic,
- event-generation logic,
- reference data,
- runtime state,
- and Kafka publishing

independent.

---

# 7. Static Reference Data

The producer uses reference data for realistic event generation.

```text
products.json
shipping_locations.json
```

The helper layer loads these datasets with caching so the same static resources do not need to be repeatedly loaded.

Conceptually:

```python
@lru_cache(maxsize=1)
def load_products():
    ...
```

and:

```python
@lru_cache(maxsize=1)
def load_shipping_locations():
    ...
```

---

# 8. Producer Runtime State

The producer maintains runtime state to enforce relationships between generated events.

Important structures include:

```text
users
product_views
user_product_views
orders
open_orders
payments
```

This allows the producer to behave more like an actual application rather than generating statistically unrelated records.

---

# 9. Event Relationships

The event stream follows realistic business relationships.

```text
user_created
      |
      v
product_viewed
      |
      v
order_created
      |
      v
payment_completed
```

These relationships are enforced by the generator.

---

## 9.1 User Creation

A `user_created` event represents the creation of a customer.

The generated user becomes available for later events.

---

## 9.2 Product View

A `product_viewed` event requires an existing user.

If the system has no available user, a user is generated first.

This prevents product-view events from referencing nonexistent users.

---

## 9.3 Order Creation

An `order_created` event requires a previous product-view relationship.

This creates a realistic relationship between customer interest and purchasing behavior.

---

## 9.4 Payment

A payment is associated with an order.

Possible statuses are:

```text
success
failed
pending
```

Multiple payment attempts for the same order are supported.

Pending payments keep the order open.

---

# 10. Inventory Behavior

Inventory is also incorporated into the event-generation logic.

At order creation:

```text
Available Stock
      |
      v
Stock Reserved
      |
      v
Open Order
```

Payment outcomes then determine what happens to the open order.

This provides more realistic order and inventory behavior than treating stock as an unrelated product attribute.

---

# 11. Producer Validation

The producer includes an independent validation script:

```text
scripts/validate_producer_run.py
```

Exported datasets include:

```text
users.csv
product_views.csv
orders.csv
payments.csv
```

Validation covers:

- required columns,
- uniqueness,
- event relationships,
- view-to-order behavior,
- payment relationships,
- payment status distribution,
- payment mode distribution,
- revenue calculations.

This validation layer is separate from dbt and is useful for verifying that the source event generator itself is producing coherent data.

---

# 12. Event Distribution

The producer was tuned to create useful business distributions.

Target view-to-order rate:

```text
~10%–20%
```

Target payment attempts per order:

```text
~0.9–1.1
```

Payment status weighting:

```text
Success     ~78%
Failed      ~14%
Pending      ~8%
```

Payment mode weighting:

```text
UPI           ~45%
Card          ~22%
COD           ~18%
Wallet        ~10%
Net Banking    ~5%
```

These are generation targets rather than guarantees for every run.

---

# 13. Stress Testing

The producer was stress-tested with larger event volumes.

One representative run produced:

```text
Users:                 3,855
Product views:        32,062
Orders:                5,623
Payment attempts:      6,064
Successful payments:   4,779
Failed payments:         817
Pending payments:        468
```

Business metrics included:

```text
View → Order rate:       17.54%
Payment / Order:          1.0784
```

Successful revenue was approximately:

```text
₹12.57 million
```

The independent validation result passed.

---

# 14. Kafka Layer

Kafka is the event transportation layer.

The architecture is:

```text
FastAPI Producer
       |
       v
     Kafka
       |
       v
Databricks ingestion
```

Kafka decouples event generation from downstream data processing.

The producer does not need to know how Databricks stores or transforms the events.

---

# 15. Kafka Module

The Kafka implementation is separated into:

```text
kafka/
├── serializer.py
├── topic_router.py
├── key_selector.py
└── publisher.py
```

## Serializer

Events are converted into JSON-compatible bytes.

Pydantic serialization handles values such as:

- UUID,
- datetime,
- Decimal,
- Enum.

Conceptually:

```text
Pydantic Event
      |
      v
JSON-compatible representation
      |
      v
UTF-8 bytes
      |
      v
Kafka
```

---

## Topic Router

The topic router determines where an event should be published based on its event type.

Conceptually:

```text
user_created       → user event topic
product_viewed     → product-view event topic
order_created      → order event topic
payment_completed  → payment event topic
```

The exact topic configuration belongs to the project's Kafka configuration.

---

## Key Selector

Kafka message keys are selected from business identifiers where appropriate.

The purpose is to provide a meaningful partitioning/order key for related events.

---

## Publisher

The publisher encapsulates Kafka interaction so that the rest of the producer does not need to know the low-level publishing details.

---

# 16. Databricks Data Platform

Databricks is the data platform used by the project.

The analytical data path is:

```text
Kafka
  ↓
Databricks
  ↓
Bronze
  ↓
dbt Silver
  ↓
dbt Gold
```

Databricks provides the environment in which the project's analytical data is stored and processed.

---

# 17. Bronze Layer

The Bronze layer contains raw event data.

Its purpose is preservation rather than business-level interpretation.

Conceptually:

```text
Kafka Events
     |
     v
Databricks Bronze
     |
     +── users
     +── product_views
     +── orders
     +── payments
```

Bronze data should remain close to the source event representation.

The objective is to retain enough raw information to allow downstream models to be rebuilt without regenerating the original business events.

---

# 18. dbt Transformation Layer

dbt is responsible for the analytical transformation layer.

The project's analytical architecture is:

```text
Databricks Bronze
       |
       v
     dbt
       |
       v
   Silver Models
       |
       v
   Gold Models
```

The important separation is:

```text
Bronze = raw data on Databricks

Silver = cleaned / standardized analytical data built with dbt

Gold = business-facing analytical models built with dbt
```

---

# 19. Silver Layer

Silver models transform Bronze event data into cleaner analytical datasets.

Typical responsibilities include:

- cleaning fields,
- standardizing data types,
- normalizing event structures,
- preparing relationships,
- making downstream joins easier,
- removing unnecessary raw-level complexity.

The Silver layer is the foundation for Gold analytics.

---

# 20. Gold Layer

Gold models are business-facing analytical datasets.

V1 contains five Gold models:

```text
ecommerce_overview
event_activity
conversion_funnel
payment_performance
product_performance
```

Each Gold model has a specific business purpose and corresponding dashboard view.

---

# 21. dbt Gold Design Principle

Each dashboard model primarily uses its own Gold dataset.

```text
ecommerce_overview
        ↓
Overview Dashboard

event_activity
        ↓
Activity Dashboard

conversion_funnel
        ↓
Conversion Dashboard

payment_performance
        ↓
Payment Dashboard

product_performance
        ↓
Product Dashboard
```

This creates a clean contract:

```text
Gold Model
    ↓
API Schema
    ↓
Dashboard
```

---

# 22. Gold Model — Ecommerce Overview

Schema:

```python
class EcommerceOverview(BaseModel):
    total_users: int
    total_product_views: int
    unique_viewers: int
    total_orders: int
    total_payment_attempts: int
    successful_payments: int
    order_value: float
    successful_revenue: float
    average_order_value: float
    view_to_order_rate: float
    payment_success_rate: float
```

The overview model provides a high-level snapshot of the entire e-commerce system.

Core metrics:

```text
Total Users
Product Views
Unique Viewers
Orders
Payment Attempts
Successful Payments
Order Value
Successful Revenue
Average Order Value
View → Order Rate
Payment Success Rate
```

---

# 23. Overview Derived Metrics

The Gold model derives several KPIs.

### Average Order Value

```text
average_order_value
=
order_value / total_orders
```

### View-to-Order Rate

```text
view_to_order_rate
=
total_orders / total_product_views
```

### Payment Success Rate

```text
payment_success_rate
=
successful_payments / total_payment_attempts
```

Division is guarded against zero denominators.

---

# 24. Unique Viewer Data-Quality Investigation

During dashboard development, an anomaly appeared where:

```text
unique_viewers > total_users
```

The overview Gold model calculated the two metrics independently:

```sql
COUNT(DISTINCT user_id)
```

over users and product views respectively.

Because the producer/event flow had evolved while Gold models were being developed, the investigation was treated as an end-to-end data-quality issue rather than assuming the final SQL was automatically wrong.

The chosen approach was to regenerate the pipeline from fresh data:

```text
Remove old Bronze/Silver/Gold data
          ↓
Generate fresh events
          ↓
Run ingestion
          ↓
Rebuild Silver
          ↓
Rebuild Gold
          ↓
Validate dashboard metrics
```

A subsequent run produced:

```text
Total users:       1,214
Unique viewers:    1,092
Product views:    10,122
```

which was consistent with the expected relationship.

This became an important validation lesson:

> Debug the data lifecycle, not just the final dashboard query.

---

# 25. Gold Model — Event Activity

Schema:

```python
class EventActivity(BaseModel):
    window_start: datetime
    window_end: datetime
    event_type: str
    event_count: int
    unique_users: int
    events_per_active_user: float
```

The Event Activity model provides time-windowed event analytics.

It captures:

```text
Window start
Window end
Event type
Event count
Unique users
Events per active user
```

The dashboard uses this model for temporal activity analysis and event-intensity visualization.

---

# 26. Gold Model — Conversion Funnel

Schema:

```python
class ConversionFunnel(BaseModel):
    total_users: int
    total_product_views: int
    total_orders: int
    total_payment_attempts: int
    successful_payments: int
    views_per_user: float
    view_to_order_rate: float
    payment_attempts_per_order: float
    payment_success_rate: float
    view_to_successful_payment_rate: float
```

The model represents the customer journey:

```text
Product Views
      ↓
Orders
      ↓
Payment Attempts
      ↓
Successful Payments
```

It allows the dashboard to show where users are lost in the conversion journey.

---

# 27. Gold Model — Payment Performance

Schema:

```python
class PaymentPerformance(BaseModel):
    payment_mode: str
    payment_provider: str
    total_attempts: int
    successful_attempts: int
    failed_attempts: int
    pending_attempts: int
    total_payment_amount: float
    successful_payment_amount: float
    success_rate: float
    failure_rate: float
    pending_rate: float
```

This model supports payment analysis across:

```text
Payment mode
Payment provider
Attempt volume
Successful attempts
Failed attempts
Pending attempts
Payment amount
Successful payment amount
Success rate
Failure rate
Pending rate
```

---

# 28. Gold Model — Product Performance

Schema:

```python
class ProductPerformance(BaseModel):
    product_id: str
    product_name: str
    category: str
    views: int
    unique_viewers: int
    orders: int
    units_sold: int
    order_value: float
    successful_revenue: float
    conversion_rate: float
```

This model provides product-level business intelligence.

It combines:

```text
Traffic
Engagement
Orders
Units
Order Value
Successful Revenue
Conversion
```

---

# 29. dbt Lineage

The project's dbt lineage demonstrates how Bronze data feeds Silver models and how the Silver layer feeds the five Gold models.

Conceptually:

```text
Databricks Bronze
      |
      +── orders
      |
      +── users
      |
      +── product_views
      |
      +── payments
      |
      v
   dbt Silver
      |
      +----------------+----------------+----------------+----------------+
      |                |                |                |                |
      v                v                v                v                v
ecommerce_        event_          conversion_       payment_        product_
overview          activity          funnel          performance     performance
```

The actual dbt lineage is generated from model dependencies.

This is valuable because it documents the real transformation graph instead of relying on a manually maintained architecture diagram.

---

# 30. FastAPI Metrics API

The FastAPI backend serves the Gold data to the frontend.

Conceptually:

```text
Databricks Gold
      |
      v
FastAPI Metrics API
      |
      v
Typed JSON response
```

The primary endpoints are:

```text
GET /api/metrics/overview
GET /api/metrics/activity
GET /api/metrics/conversion
GET /api/metrics/payments
GET /api/metrics/products
```

The exact database/query implementation is isolated inside the API layer.

The frontend does not directly query Databricks.

---

# 31. Pydantic API Contracts

The API uses Pydantic response schemas.

The five principal contracts are:

```text
EcommerceOverview
EventActivity
ConversionFunnel
PaymentPerformance
ProductPerformance
```

This provides a typed contract between backend and frontend.

Conceptually:

```text
Gold row(s)
    ↓
FastAPI
    ↓
Pydantic model
    ↓
JSON
    ↓
Frontend
```

---

# 32. Frontend Architecture

The analytics application is built using:

```text
Next.js
TypeScript
Tailwind CSS
TanStack Query
ECharts
```

The primary route is:

```text
/analytics
```

The page contains persistent navigation between the five analytical models.

---

# 33. Analytics Navigation

The available models are:

```text
Overview
Event Activity
Conversion Funnel
Payment Performance
Product Performance
```

The selected model is maintained in React state.

Conceptually:

```tsx
const [selectedModel, setSelectedModel] = useState<ModelId>("overview");
```

The navigation remains persistent while the dashboard content changes.

---

# 34. Frontend Data Flow

```text
Databricks Gold
      |
      v
FastAPI Metrics API
      |
      v
TanStack Query
      |
      v
Typed dashboard data
      |
      v
Visualization component
      |
      v
ECharts
```

This creates a clear separation between:

- data access,
- server state,
- UI composition,
- and visualization.

---

# 35. TanStack Query

TanStack Query handles API data fetching and server state.

Conceptual query keys:

```text
["metrics", "overview"]
["metrics", "activity"]
["metrics", "conversion"]
["metrics", "payments"]
["metrics", "products"]
```

The visualization components receive data rather than owning the networking logic.

Benefits include:

- caching,
- loading state,
- error state,
- refetching,
- server-state management,
- separation of concerns.

---

# 36. Overview Dashboard

The Overview dashboard is assembled from five major visualization components:

```text
OverviewDashboard
│
├── OverviewKpiStrip
├── ConversionJourney
├── RevenuePerformance
├── AudiencePanel
└── TransactionHealth
```

The dashboard uses only:

```text
ecommerce_overview
```

for its data.

Headline KPIs include:

```text
Total Users
Product Views
Orders
Successful Revenue
Payment Success
```

Supporting sections derive additional insights from the same Gold dataset.

---

# 37. Event Activity Dashboard

The Event Activity dashboard uses only:

```text
event_activity
```

The visualization focuses on:

- event activity over time,
- event counts,
- active users,
- events per active user,
- event intensity.

One of the main visualizations is a heatmap where:

```text
X axis → Time
Y axis → Event Type
Cell intensity → Events per active user
```

Interactive ECharts tooltips expose the exact event type, timestamp, and metric.

---

# 38. Conversion Funnel Dashboard

The Conversion dashboard uses:

```text
conversion_funnel
```

The core narrative is:

```text
Views
  ↓
Orders
  ↓
Payment Attempts
  ↓
Successful Payments
```

The dashboard focuses on:

- stage volume,
- drop-off,
- view-to-order conversion,
- payment attempts per order,
- payment success,
- view-to-successful-payment conversion.

---

# 39. Payment Performance Dashboard

The Payment dashboard uses:

```text
payment_performance
```

It compares payment behavior across:

```text
Payment Mode
Payment Provider
```

Key metrics include:

```text
Total Attempts
Successful Attempts
Failed Attempts
Pending Attempts
Total Payment Amount
Successful Payment Amount
Success Rate
Failure Rate
Pending Rate
```

ECharts is used to turn these dimensions into interactive comparisons rather than static tables.

---

# 40. Product Performance Dashboard

The Product dashboard uses:

```text
product_performance
```

This is the most visualization-heavy Gold model.

The final dashboard includes advanced ECharts visualizations designed to show relationships between traffic, conversion, and revenue.

---

# 41. Product Engagement Matrix

The engagement matrix visualizes multiple product dimensions simultaneously.

Axes:

```text
X axis:
Conversion Rate

Y axis:
Revenue per 1,000 Views
```

Bubble size:

```text
Successful Revenue
```

Color:

```text
Product Category
```

Reference lines show average performance.

This allows products to be interpreted as:

```text
High conversion + high revenue efficiency
High conversion + low revenue efficiency
Low conversion + high revenue efficiency
Low conversion + low revenue efficiency
```

The visualization therefore functions as an analytical product-performance map rather than a decorative scatter plot.

---

# 42. Product Revenue Universe

The product revenue visualization uses an interactive ECharts sunburst.

Hierarchy:

```text
Successful Revenue
       |
       +-- Category
       |      |
       |      +-- Product
       |      +-- Product
       |
       +-- Category
              |
              +-- Product
              +-- Product
```

The center displays total successful revenue.

The first ring represents categories.

The outer ring represents products.

Revenue controls the visual area.

Users can click categories to explore their products.

This creates a drill-down experience directly inside the visualization.

---

# 43. ECharts Strategy

ECharts was selected because the dashboard should communicate relationships and patterns rather than merely display numbers.

The project uses visualization techniques such as:

- heatmaps,
- scatter plots,
- bubble charts,
- funnel-style visualizations,
- radial/gauge visuals,
- sunbursts,
- reference lines,
- rich tooltips,
- animation,
- emphasis states,
- interactive exploration.

The design principle is:

> **Use the chart to explain the metric. Do not use the metric merely as an excuse to draw a chart.**

---

# 44. Visual Design Language

The dashboard follows a dark analytical visual language.

The major visual characteristics are:

```text
Dark background
Subtle borders
Blue primary analytical accent
Gold / amber revenue accents
Green success accents
High-contrast typography
Low-noise secondary labels
Interactive chart emphasis
```

The UI is designed to feel like a modern analytics product rather than an administrative CRUD dashboard.

---

# 45. Responsive Design

The dashboard is responsive.

Typical layouts transition from:

```text
Desktop:
+----------------+----------------+
| Visualization  | Visualization |
+----------------+----------------+

Mobile:
+----------------+
| Visualization  |
+----------------+
| Visualization  |
+----------------+
```

Charts resize according to their containers.

Secondary information is reduced or hidden on smaller screens when necessary so that the primary analytical hierarchy remains intact.

---

# 46. Loading and Error Handling

The frontend accounts for API state.

```text
Loading
   ↓
Data loaded
```

or:

```text
Loading
   ↓
API failure
   ↓
Error state
```

Charts are not blindly rendered against undefined or incomplete data.

This is especially important for ECharts because its configuration is often derived directly from API results.

---

# 47. Data Quality Philosophy

A central lesson from V1 development was that dashboard correctness depends on the entire pipeline.

A suspicious dashboard number should be traced backward:

```text
Dashboard
   ↓
API response
   ↓
Gold
   ↓
Silver
   ↓
Bronze
   ↓
Databricks ingestion
   ↓
Kafka
   ↓
Producer
```

This prevents a visualization bug from being confused with a data-generation or transformation problem.

---

# 48. End-to-End Validation

Validation occurs at multiple points.

## Producer validation

Checks the generated event relationships and distributions.

## Bronze validation

Confirms raw event data has reached Databricks.

## Silver validation

Confirms cleaning and transformation behavior.

## Gold validation

Confirms analytical metrics.

## API validation

Confirms that Gold data is exposed through the expected response schema.

## Frontend validation

Confirms that the visualization matches the API contract and that the rendered metrics are logically consistent.

---

# 49. dbt Documentation

dbt documentation was successfully generated using:

```bash
dbt docs generate
```

The project reported:

```text
9 models
4 sources
774 macros
```

The catalog was successfully written.

Warnings were encountered for an unused configuration path and some adapter/catalog metadata fields, but documentation generation itself completed successfully.

---

# 50. V1 Scope

V1 includes:

```text
✓ FastAPI Producer
✓ Realistic e-commerce event generation
✓ Runtime event state
✓ CSV validation
✓ Kafka serialization
✓ Kafka publishing
✓ Kafka routing / key selection
✓ Databricks data platform
✓ Databricks Bronze
✓ dbt Silver
✓ dbt Gold
✓ Ecommerce Overview Gold
✓ Event Activity Gold
✓ Conversion Funnel Gold
✓ Payment Performance Gold
✓ Product Performance Gold
✓ FastAPI Metrics API
✓ Pydantic API contracts
✓ TanStack Query
✓ Next.js analytics page
✓ Persistent analytics navigation
✓ Overview dashboard
✓ Activity dashboard
✓ Conversion dashboard
✓ Payment dashboard
✓ Product dashboard
✓ ECharts visualization layer
✓ Responsive dashboard
✓ dbt documentation
✓ Producer stress testing
```

---

# 51. What V1 Does NOT Use

The following are **not part of the V1 architecture**:

```text
✗ PostgreSQL
✗ PostgreSQL raw tables
✗ PostgreSQL analytical storage
✗ dbt → PostgreSQL transformation
```

The correct V1 data-platform architecture is:

```text
Kafka
  ↓
Databricks Bronze
  ↓
dbt Silver
  ↓
dbt Gold
```

This distinction is important when explaining the project in interviews or documentation.

---

# 52. V2 Boundary

The most significant advanced feature intentionally deferred to V2 is:

```text
PySpark Structured Streaming
```

V1 establishes:

```text
Kafka
  ↓
Databricks
  ↓
dbt
  ↓
Gold
```

V2 can introduce more sophisticated streaming processing inside the Databricks ecosystem.

Potential V2 capabilities include:

- PySpark Structured Streaming,
- event-time processing,
- watermarking,
- windowed aggregations,
- stateful processing,
- checkpointing,
- schema management,
- stronger data-quality testing,
- advanced observability,
- orchestration,
- production-style deployment.

The purpose of V2 should be to deepen the engineering architecture rather than simply increase the number of technologies.

---

# 53. Why V1 and V2 Are Separated

V1 prioritizes:

```text
Correctness
Clarity
End-to-end completion
Debuggability
Business usefulness
```

V2 can then prioritize:

```text
Distributed processing
Scalability
Stateful streaming
Operational maturity
Advanced data engineering
```

This prevents V1 from becoming unnecessarily complex before the basic architecture is validated.

---

# 54. Complete Data Lifecycle

A business event moves conceptually through the system as:

```text
1. FastAPI Producer creates event
          ↓
2. Pydantic validates event
          ↓
3. Event is serialized
          ↓
4. Kafka receives event
          ↓
5. Event reaches Databricks ingestion
          ↓
6. Raw event is stored in Bronze
          ↓
7. dbt reads Bronze
          ↓
8. dbt builds Silver
          ↓
9. dbt builds Gold
          ↓
10. FastAPI queries Gold
          ↓
11. Pydantic validates API response
          ↓
12. TanStack Query fetches the API
          ↓
13. Next.js receives typed data
          ↓
14. ECharts transforms the data into visual analytics
          ↓
15. User explores E-Commerce Pulse
```

---

# 55. Final V1 Architecture Diagram

```text
                         ┌───────────────────────┐
                         │   FASTAPI PRODUCER    │
                         │        Python         │
                         └───────────┬───────────┘
                                     │
                                     │ Events
                                     ▼
                         ┌───────────────────────┐
                         │        KAFKA          │
                         │   Event Transport     │
                         └───────────┬───────────┘
                                     │
                                     ▼
                 ┌──────────────────────────────────────┐
                 │              DATABRICKS                │
                 │                                       │
                 │  ┌─────────────────────────────────┐  │
                 │  │             BRONZE              │  │
                 │  │        Raw Event Data            │  │
                 │  └────────────────┬────────────────┘  │
                 │                   │                   │
                 │                   ▼                   │
                 │            ┌──────────────┐           │
                 │            │     dbt      │           │
                 │            └──────┬───────┘           │
                 │                   │                   │
                 │                   ▼                   │
                 │  ┌─────────────────────────────────┐  │
                 │  │             SILVER              │  │
                 │  │ Clean / Standardized Analytics  │  │
                 │  └────────────────┬────────────────┘  │
                 │                   │                   │
                 │                   ▼                   │
                 │  ┌─────────────────────────────────┐  │
                 │  │              GOLD               │  │
                 │  │                                 │  │
                 │  │ Overview     Activity           │  │
                 │  │ Conversion   Payments           │  │
                 │  │ Products                         │  │
                 │  └────────────────┬────────────────┘  │
                 └───────────────────┼───────────────────┘
                                     │
                                     ▼
                         ┌───────────────────────┐
                         │   FASTAPI METRICS     │
                         │         API           │
                         └───────────┬───────────┘
                                     │
                                     ▼
                         ┌───────────────────────┐
                         │    TANSTACK QUERY     │
                         └───────────┬───────────┘
                                     │
                                     ▼
                         ┌───────────────────────┐
                         │        NEXT.JS        │
                         │    E-Commerce Pulse   │
                         └───────────┬───────────┘
                                     │
                                     ▼
                         ┌───────────────────────┐
                         │        ECHARTS        │
                         │ Interactive Analytics │
                         └───────────────────────┘
```

---

# 56. Portfolio Value

This project demonstrates practical experience across several parts of a modern data platform.

## Data Engineering

- Event-driven architecture
- Kafka
- Producer design
- Event serialization
- Message routing
- Databricks
- Bronze/Silver/Gold architecture
- dbt
- Analytical data modeling
- Data lineage
- Data-quality investigation

## Backend Engineering

- FastAPI
- REST API design
- Pydantic
- Metrics serving
- Response validation
- Error handling

## Frontend Engineering

- Next.js
- TypeScript
- Tailwind CSS
- TanStack Query
- Component architecture
- Responsive UI

## Data Visualization

- Apache ECharts
- Interactive dashboards
- Heatmaps
- Scatter/bubble charts
- Funnel visualizations
- Sunburst charts
- Multidimensional analysis
- Rich tooltips
- Animation and emphasis states

---

# 57. V1 Completion Checklist

| Layer / Component               | Status       |
| ------------------------------- | ------------ |
| FastAPI Producer                | Complete     |
| Realistic Event Generator       | Complete     |
| Runtime Event State             | Complete     |
| Producer Validation             | Complete     |
| Kafka Serialization             | Complete     |
| Kafka Publishing                | Complete     |
| Kafka Routing / Key Selection   | Complete     |
| Databricks Data Platform        | Complete     |
| Databricks Bronze               | Complete     |
| dbt Silver                      | Complete     |
| dbt Gold                        | Complete     |
| Ecommerce Overview Gold         | Complete     |
| Event Activity Gold             | Complete     |
| Conversion Funnel Gold          | Complete     |
| Payment Performance Gold        | Complete     |
| Product Performance Gold        | Complete     |
| FastAPI Metrics API             | Complete     |
| Pydantic API Contracts          | Complete     |
| TanStack Query                  | Complete     |
| Next.js Analytics               | Complete     |
| Persistent Analytics Navigation | Complete     |
| Overview Dashboard              | Complete     |
| Activity Dashboard              | Complete     |
| Conversion Dashboard            | Complete     |
| Payment Dashboard               | Complete     |
| Product Dashboard               | Complete     |
| ECharts Visualization Layer     | Complete     |
| Responsive Dashboard            | Complete     |
| dbt Documentation               | Complete     |
| Producer Stress Testing         | Complete     |
| V1 Architecture                 | **COMPLETE** |

---

# 58. Final Status

## V1 — COMPLETE

The final V1 pipeline is:

```text
EVENT GENERATION
      ↓
KAFKA
      ↓
DATABRICKS BRONZE
      ↓
DBT SILVER
      ↓
DBT GOLD
      ↓
FASTAPI METRICS API
      ↓
TANSTACK QUERY
      ↓
NEXT.JS
      ↓
ECHARTS
      ↓
E-COMMERCE PULSE
```

The project demonstrates the full lifecycle of an event-driven e-commerce analytics platform:

```text
Generate
   ↓
Stream
   ↓
Store
   ↓
Transform
   ↓
Model
   ↓
Serve
   ↓
Fetch
   ↓
Visualize
```

**V1 is complete.**

The next major architectural evolution is V2, where advanced distributed streaming capabilities can be introduced on top of the validated Databricks + dbt foundation.
