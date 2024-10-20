import dotenv from 'dotenv';
dotenv.config();

export const TICKET_PRICES = process.env.TICKET_PRICES
  ? JSON.parse(process.env.TICKET_PRICES)
  : {
      INFANT: 0,
      CHILD: 15,
      ADULT: 25,
    };

export const TICKET_TYPES = Object.keys(TICKET_PRICES);
