import TicketTypeRequest from "./lib/TicketTypeRequest.js";
import InvalidPurchaseException from "./lib/InvalidPurchaseException.js";
import TicketPaymentService from "../thirdparty/paymentgateway/TicketPaymentService.js";
import SeatReservationService from "../thirdparty/seatbooking/SeatReservationService.js";
import ErrorCodes from "./lib/ErrorCodes.js";
import { TICKET_PRICES, TICKET_TYPES} from "../config/config.js";

export default class TicketService {
  constructor(paymentService = new TicketPaymentService(), reservationService = new SeatReservationService()) {
    this.paymentService = paymentService;
    this.reservationService = reservationService;
    this.ticketPrices = TICKET_PRICES;
  }

  async purchaseTickets(accountId, ...ticketTypeRequests) {
    try {
      this.#validateAccountId(accountId);
      this.#validateTicketRequests(ticketTypeRequests);
      const { totalTickets, adultTickets, totalAmount } =
        this.#calculateTotals(ticketTypeRequests);
      this.#validateTicketCounts(totalTickets, adultTickets);
      await this.#makePayment(accountId, totalAmount);
      const seatsToReserve = this.#calculateSeatsToReserve(
        totalTickets,
        ticketTypeRequests
      );
      await this.#reserveSeats(accountId, seatsToReserve);
    } catch (error) {
      if (error instanceof InvalidPurchaseException) {
        throw error;
      } else {
        console.error('Unexpected error:', error);
        throw new Error(ErrorCodes.UNEXPECTED_ERROR);
      }
    }
  }

  #validateAccountId(accountId) {
    if (accountId <= 0 || !Number.isInteger(accountId)) {
      throw new InvalidPurchaseException(ErrorCodes.INVALID_ACCOUNT_ID);
    }
  }

  #validateTicketRequests(ticketTypeRequests) {
    ticketTypeRequests.forEach((request) => {
      if (!(request instanceof TicketTypeRequest) || !TICKET_TYPES.includes(request.getTicketType())) {
        throw new InvalidPurchaseException(ErrorCodes.INVALID_TICKET_REQUEST);
      }
      if (request.getNoOfTickets() <= 0 || !Number.isInteger(request.getNoOfTickets())) {
        throw new InvalidPurchaseException(ErrorCodes.INVALID_TICKET_REQUEST);
      }
    });
  }
  

  #calculateTotals(ticketTypeRequests) {
    let totalTickets = 0;
    let adultTickets = 0;
    let totalAmount = 0;

    ticketTypeRequests.forEach((request) => {
      const type = request.getTicketType();
      const quantity = request.getNoOfTickets();
      totalTickets += quantity;
      if (type === "ADULT") {
        adultTickets += quantity;
      }
      totalAmount += this.ticketPrices[type] * quantity;
    });

    return { totalTickets, adultTickets, totalAmount };
  }

  #validateTicketCounts(totalTickets, adultTickets) {
    if (totalTickets > 25) {
      throw new InvalidPurchaseException(ErrorCodes.MAX_TICKETS_EXCEEDED);
    }
    if (adultTickets === 0) {
      throw new InvalidPurchaseException(ErrorCodes.NO_ADULT_TICKET);
    }
  }

  async #makePayment(accountId, totalAmount) {
    // Using `await` to future-proof in case `makePayment` becomes asynchronous
    await this.paymentService.makePayment(accountId, totalAmount);
  }

  #calculateSeatsToReserve(totalTickets, ticketTypeRequests) {
    const infantRequest = ticketTypeRequests.find(
      (req) => req.getTicketType() === "INFANT"
    );
    const infantTickets = infantRequest ? infantRequest.getNoOfTickets() : 0;
    return totalTickets - infantTickets;
  }

  async #reserveSeats(accountId, seatsToReserve) {
    // Using `await` to future-proof in case `reserveSeats` becomes asynchronous
    await this.reservationService.reserveSeat(accountId, seatsToReserve);
  }
}
