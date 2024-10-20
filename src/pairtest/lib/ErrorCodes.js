const ErrorCodes = {
    INVALID_TICKET_TYPE: 'Invalid ticket type. Valid types are INFANT, CHILD, ADULT.',
    INVALID_QUANTITY: 'Quantity must be greater than zero.',
    INVALID_ACCOUNT_ID: 'Invalid account ID. Account ID must be greater than zero.',
    INVALID_TICKET_REQUEST: 'Invalid ticket request. Request must be an instance of TicketTypeRequest.',
    MAX_TICKETS_EXCEEDED: 'Cannot purchase more than 25 tickets at a time.',
    NO_ADULT_TICKET: 'Child and Infant tickets cannot be purchased without an Adult ticket.',
    UNEXPECTED_ERROR: 'An unexpected error occurred during ticket purchase.',
  };
  
  module.exports = ErrorCodes;
  