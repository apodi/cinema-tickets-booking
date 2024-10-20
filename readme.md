# TicketTypeRequest and TicketService Overview

## Key Implemetations

### 1. Immutability with `Object.freeze`
- **TicketTypeRequest**: `Object.freeze(this)` ensures instances are immutable, preventing modifications after creation.
- **Ticket Types**: `#Type = Object.freeze(["ADULT", "CHILD", "INFANT"])` prevents changes to valid ticket types, maintaining consistent validation.

### 2. Dependency Injection in TicketService
- Injected `TicketPaymentService` and `SeatReservationService` into `TicketService` for easier testing and flexibility.
You can easily swap out dependencies (e.g., replace TicketPaymentService with a different implementation) without modifying the core logic of TicketService.

### 3. Future-Proofing with `await`
- Added `await` to `makePayment` and `reserveSeat` to handle potential future async operations without refactoring.
- Currently, makePayment and reserveSeat are synchronous, but they may become asynchronous in the future due to IO operations or AP call.

## Running the Project

1. **Install Dependencies**: Run `npm install` to install all necessary packages.
2. **Run Tests**: Use `npm test` to execute unit tests and ensure everything is working correctly.


