## Project Link
https://invoice-genera.netlify.app/

    # Invoice Details Page — Full Stack Assignment

A clean Invoice Details module built with **React + Vite + Tailwind** (frontend) and **Express + MongoDB + Mongoose** (backend).

## 📁 Project Structure

```
├── backend/
│   ├── config/db.js          # MongoDB connection
│   ├── models/
│   │   ├── Invoice.js        # Invoice model
│   │   ├── Invoiceline.js    # InvoiceLine sub-schema
│   │   └── Payment.js        # Payment model
│   ├── controllers/Invoice.js # All API logic
│   ├── routes/invoice.js      # Route definitions
│   └── server.js              # Express server entry
├── frontend/
│   └── src/
│       ├── pages/InvoiceDetail.jsx  # Invoice details page
│       ├── App.jsx                   # App router
│       └── main.jsx                  # Entry point
```

## ⚙️ Setup Instructions

### Prerequisites
- Node.js v18+
- MongoDB running locally (or MongoDB Atlas URI)

### 1. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file:
```
MONGO_URI=mongodb://localhost:27017/meru-technosoft OR MONGO_URI=mongodb+srv://<username>:<password>@meru-technosoft.0jzqz.mongodb.net/meru-technosoft
PORT=5000
```

Start the server:
```bash
node --watch server.js
```

Backend runs on: `http://localhost:5000`

### 2. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on: `http://localhost:5173`

### 3. Open in Browser

```
http://localhost:5173/invoices/<invoice-id>
```

## 🔹 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/invoices/:id` | Get invoice details + line items + payments |
| POST | `/api/invoices/createInvoice` | Create a new invoice |
| POST | `/api/invoices/:id/payments` | Add payment to an invoice |
| POST | `/api/invoices/archive` | Archive an invoice |
| POST | `/api/invoices/restore` | Restore an archived invoice |

## 🧠 Business Rules

- **Line Total** = quantity × unit price
- **Total** = sum of line totals
- **Balance Due** = total – amountPaid
- No overpayment allowed (amount ≤ balanceDue)
- Auto-sets status to **PAID** when fully paid
