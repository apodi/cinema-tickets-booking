import TicketService from '../src/pairtest/TicketService';
import TicketTypeRequest from '../src/pairtest/lib/TicketTypeRequest';
import InvalidPurchaseException from '../src/pairtest/lib/InvalidPurchaseException';

const ErrorCodes = require('../src/pairtest/lib/ErrorCodes');

jest.mock('../src/thirdparty/paymentgateway/TicketPaymentService', () => {
  return jest.fn().mockImplementation(() => {
    return {
      makePayment: jest.fn().mockResolvedValue(),
    };
  });
});

jest.mock('../src/thirdparty/seatbooking/SeatReservationService', () => {
  return jest.fn().mockImplementation(() => {
    return {
      reserveSeat: jest.fn().mockResolvedValue(),
    };
  });
});
import TicketPaymentService from '../src/thirdparty/paymentgateway/TicketPaymentService';
import SeatReservationService from '../src/thirdparty/seatbooking/SeatReservationService';


describe('TicketService', () => {
  let ticketService;
  let paymentServiceMock;
  let reservationServiceMock;

  beforeEach(() => {
    paymentServiceMock = new TicketPaymentService();
    reservationServiceMock = new SeatReservationService();
    ticketService = new TicketService(paymentServiceMock, reservationServiceMock);
  });
  afterEach(() => {
    jest.clearAllMocks();
  });


  test('should throw InvalidPurchaseException for invalid account ID', async () => {
    await expect(ticketService.purchaseTickets(0, new TicketTypeRequest('ADULT', 1))).rejects.toThrow(InvalidPurchaseException);
    await expect(ticketService.purchaseTickets('1b', new TicketTypeRequest('ADULT', 1))).rejects.toThrow(InvalidPurchaseException);
    await expect(ticketService.purchaseTickets(0, new TicketTypeRequest('ADULT', 1))).rejects.toThrow(ErrorCodes.INVALID_ACCOUNT_ID);
  });

  test('should throw InvalidPurchaseException for invalid ticket request', async () => {
    await expect(ticketService.purchaseTickets(1, { type: 'ADULT', quantity: 1 })).rejects.toThrow(InvalidPurchaseException);
    await expect(ticketService.purchaseTickets(1, { type: 'ADULT', quantity: 1 })).rejects.toThrow(ErrorCodes.INVALID_TICKET_REQUEST);
  });

  test('should throw InvalidPurchaseException for purchasing more than 25 tickets', async () => {
    const ticketRequests = Array(26).fill(new TicketTypeRequest('ADULT', 1));
    await expect(ticketService.purchaseTickets(1, ...ticketRequests)).rejects.toThrow(InvalidPurchaseException);
    await expect(ticketService.purchaseTickets(1, ...ticketRequests)).rejects.toThrow(ErrorCodes.MAX_TICKETS_EXCEEDED);
  });

  test('should throw InvalidPurchaseException if no adult ticket is purchased', async () => {
    await expect(ticketService.purchaseTickets(1, new TicketTypeRequest('CHILD', 1))).rejects.toThrow(InvalidPurchaseException);
    await expect(ticketService.purchaseTickets(1, new TicketTypeRequest('CHILD', 1))).rejects.toThrow(ErrorCodes.NO_ADULT_TICKET);
  });

  test('should make payment and reserve seats correctly for valid ticket request', async () => {
    const makePaymentMock = paymentServiceMock.makePayment;
    const reserveSeatMock = reservationServiceMock.reserveSeat;
    await ticketService.purchaseTickets(1, new TicketTypeRequest('ADULT', 2), new TicketTypeRequest('CHILD', 1));

    expect(makePaymentMock).toHaveBeenCalledTimes(1);
    expect(makePaymentMock).toHaveBeenCalledWith(1, 65)
  });

  test('should not reserve a seat for an infant', async () => {
    await ticketService.purchaseTickets(1, new TicketTypeRequest('ADULT', 2), new TicketTypeRequest('INFANT', 1));

    expect(paymentServiceMock.makePayment).toHaveBeenCalledWith(1, 50);
    expect(reservationServiceMock.reserveSeat).toHaveBeenCalledWith(1, 2);
  });
});