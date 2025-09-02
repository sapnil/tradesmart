# Firebase Studio

This is a NextJS starter in Firebase Studio.

To get started, take a look at src/app/page.tsx.

## Solution Diagram

The following diagram illustrates the architecture of the TradeSmart India application, showing how the different components interact with each other.

```mermaid
graph TD
    subgraph "User Interface"
        A[Next.js/React Frontend]
    end

    subgraph "Backend"
        B[Next.js Server Actions]
    end

    subgraph "AI Engine"
        C[Genkit AI Flows]
        D[Google AI Models]
    end

    subgraph "Data Layer"
        E[Application Data Store]
    end
    
    subgraph "External Systems"
        F[Distributor Management System (DMS)]
    end

    A -- "User Interaction" --> B
    B -- "Invokes AI Logic" --> C
    C -- "Processes Data & Calls LLM" --> D
    B -- "Reads/Writes Data" --> E
    C -- "Reads Data" --> E
    B -- "Syncs Orders" --> F

    style A fill:#007acc,stroke:#333,stroke-width:2px,color:#fff
    style B fill:#333,stroke:#333,stroke-width:2px,color:#fff
    style C fill:#fb8c00,stroke:#333,stroke-width:2px,color:#fff
    style D fill:#4285F4,stroke:#333,stroke-width:2px,color:#fff
    style E fill:#9e9e9e,stroke:#333,stroke-width:2px,color:#fff
    style F fill:#009688,stroke:#333,stroke-width:2px,color:#fff
```
