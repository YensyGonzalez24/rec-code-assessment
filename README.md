# Restaurant Booking API

This project implements a backend service for managing restaurant bookings, including handling dietary restrictions, table availability, and reservations. The service is built with NestJS, Prisma ORM, and TypeScript.

## Features

- Find restaurants with available tables that meet the dietary restrictions of users.
- Create reservations for a group of users at a specified time.
- Delete existing reservations.

## Prerequisites

- Node.js (v14.x or later)
- npm (v6.x or later)
- Docker (for running the PostgreSQL database)

## Setup

Follow these steps to set up and run the project:

### 1. Clone the Repository

`
git clone https://github.com/yourusername/restaurant-booking-api.git
cd restaurant-booking-api
`

### 2. Install Dependencies

`npm install`

### 3. Set Up Environment Variables

Create a .env file in the root directory and add the following environment variables:

`DATABASE_URL="postgresql://user:password@localhost:5432/restaurant-booking"`

Make sure to replace user, password, and localhost:5432 with your PostgreSQL database credentials and host.

### 4. Start the PostgreSQL Database

If you have Docker installed, you can start a PostgreSQL container with the following command:

`docker run --name restaurant-booking-db -e POSTGRES_USER=user -e POSTGRES_PASSWORD=password -e POSTGRES_DB=restaurant-booking -p 5432:5432 -d postgres`

### 5. Run Database Migrations

Use Prisma to set up the database schema:

`npx prisma migrate dev --name init`

### 6. Start the Development Server

`npm run start:dev`

## Running Tests

Use the following command to run the tests:

`npm run test`

## API Endpoints

#### Get all eaters

`GET /eaters`

Paramenters: None

#### Find restaurants

`GET /restaurants`

Parameters: None

`POST /restaurants/search`

Body:

`eaterIds`: Array of eater IDs.
`invitees`: Array of user IDs invited to the reservation.
`additionalGuests`: Number of additional guests.
`reservationTime`: Desired reservation time.

#### Get all reservations 

`GET /reservarions`

Parameters: None

#### Create Reservation

`POST /reservations`

Body:

`startTime`: Reservation start time.
`endTime`: Reservation end time. (optional)
`ownerId`: ID of the user making the reservation.
`invitees`: Array of user IDs invited to the reservation.
`additionalGuests`: Number of additional guests.
`tableId`: ID of the table to reserve.

#### Delete Reservation

`DELETE /reservations/:id`

Parameters:

`id`: ID of the reservation to delete.
