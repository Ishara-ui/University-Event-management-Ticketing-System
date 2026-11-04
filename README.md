# South Eastern University Event Management

MERN application for university events, ticket inventory, digital tickets, payment-slip review, and attendance check-in.

## Requirements

- Node.js 18 or later
- MongoDB Atlas or a MongoDB replica set (payment approval uses transactions)

## Configure the backend

Create `backend/.env` with these values. Keep this file private and never commit real credentials.

```env
PORT=5000
MONGO_URI=mongodb+srv://<database-user>:<password>@<cluster>/<database>?retryWrites=true&w=majority
JWT_SECRET=<long-random-secret>
```

If the system DNS resolver cannot look up MongoDB SRV records, you can optionally set `MONGO_DNS_SERVERS=8.8.8.8` (or a DNS resolver approved by your network administrator). For Atlas TLS/connection failures, confirm the cluster is running, the database user's credentials are current, the machine's IP is allowed in Network Access, and `MONGO_URI` is copied correctly. Do not disable TLS certificate verification.

## Run locally

Open separate terminals from the project root.

Backend:

```powershell
cd backend
npm.cmd install
npm.cmd run dev
```

To use a local MongoDB service instead of Atlas for development, set the mode in that backend terminal before starting it:

```powershell
$env:DATABASE_MODE = "local"
npm.cmd run dev
```

This connects to `mongodb://127.0.0.1:27017/university_event_management` and leaves the Atlas `MONGO_URI` unchanged. To switch back to Atlas, open a fresh terminal (or run `Remove-Item Env:DATABASE_MODE`) and start the backend normally.

To populate each category with clearly labeled demo events, run this once from the backend terminal. The seeder is safe to rerun: it adds missing demo records without resetting existing event inventory.

```powershell
$env:DATABASE_MODE = "local"
npm.cmd run seed:events
```

Frontend:

```powershell
cd frontend
npm.cmd install
npm.cmd run dev
```

Open the Vite URL printed in the frontend terminal, normally `http://localhost:5173`.

## Roles

Public registration always creates a `Student`; clients cannot grant themselves privileged roles. To provision the first administrator, register an account, then assign its role in the trusted MongoDB database console:

```javascript
db.users.updateOne(
	{ email: "admin@example.edu" },
	{ $set: { role: "Super Admin" } }
)
```

Use `Club Admin` for event organizers and `Finance Officer` for payment reviewers. Sign out and back in after a role change because the JWT stores the role at login. Do not expose the database console to students.

## Workflows

- Student dashboards show profile details (name, student ID, email, faculty), bookings with downloadable QR codes, upcoming campus events, and notifications refreshed every 30 seconds.
- Students browse events, book free tickets, and submit transfer receipts for paid tiers. Payment approval creates the paid ticket.
- Finance Officers and Super Admins review payment slips. Approval creates the ticket and reserves inventory transactionally.
- Club Admins manage only events they created. Super Admins can manage all events.
- Organizer dashboards show event, ticket, revenue, payment, and upcoming-event metrics, plus per-event capacity and sales progress.
- Event staff search attendees, export the event directory to CSV, check in attendees using the unique ticket code encoded in the QR, and review attendance status by event.
- Booking confirmations, event changes/cancellations, and payment approvals appear in each student's notification center.
- Events with ticket or payment history are cancelled instead of deleted, preserving records.

## Validation

```powershell
cd frontend
npm.cmd run build
```