require("dotenv").config();

const express = require("express");
const cors = require("cors");
const {
  connectDB,
  getTicketsCollection,
  getNotesCollection
} = require("./database");

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

app.get("/", (req, res) => {
  res.send("Support CRM API is running");
});

// Create a ticket
app.post("/api/tickets", async (req, res) => {
  try {
    const {
      customer_name,
      customer_email,
      subject,
      description
    } = req.body;

    if (!customer_name || !customer_email || !subject || !description) {
      return res.status(400).json({
        error: "All fields are required"
      });
    }

    const ticket_id = `TKT-${Date.now()}`;
    const created_at = new Date();
    const updated_at = created_at;

    const ticket = {
      ticket_id,
      customer_name,
      customer_email,
      subject,
      description,
      status: "Open",
      created_at,
      updated_at
    };

    await getTicketsCollection().insertOne(ticket);

    res.status(201).json({
      ticket_id,
      created_at
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Failed to create ticket"
    });
  }
});

// Get tickets
app.get("/api/tickets", async (req, res) => {
  try {
    const { status, search } = req.query;

    const query = {};

    if (status) {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { ticket_id: { $regex: search, $options: "i" } },
        { customer_name: { $regex: search, $options: "i" } },
        { customer_email: { $regex: search, $options: "i" } },
        { subject: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } }
      ];
    }

    const tickets = await getTicketsCollection()
      .find(query)
      .sort({ created_at: -1 })
      .toArray();

    const result = tickets.map((ticket) => ({
      ticket_id: ticket.ticket_id,
      customer_name: ticket.customer_name,
      customer_email: ticket.customer_email,
      subject: ticket.subject,
      status: ticket.status,
      created_at: ticket.created_at
    }));

    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Failed to fetch tickets"
    });
  }
});

// Get ticket details
app.get("/api/tickets/:ticket_id", async (req, res) => {
  try {
    const { ticket_id } = req.params;

    const ticket = await getTicketsCollection().findOne({
      ticket_id
    });

    if (!ticket) {
      return res.status(404).json({
        error: "Ticket not found"
      });
    }

    const ticketNotes = await getNotesCollection()
      .find({ ticket_id })
      .sort({ created_at: 1 })
      .toArray();

    res.json({
      ticket_id: ticket.ticket_id,
      customer_name: ticket.customer_name,
      customer_email: ticket.customer_email,
      subject: ticket.subject,
      description: ticket.description,
      status: ticket.status,
      created_at: ticket.created_at,
      updated_at: ticket.updated_at,
      notes: ticketNotes.map((note) => ({
        note_text: note.note_text,
        created_at: note.created_at
      }))
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Failed to fetch ticket"
    });
  }
});

// Update ticket
app.put("/api/tickets/:ticket_id", async (req, res) => {
  try {
    const { ticket_id } = req.params;
    const { status, notes: noteText } = req.body;

    const allowedStatuses = [
      "Open",
      "In Progress",
      "Closed"
    ];

    if (status && !allowedStatuses.includes(status)) {
      return res.status(400).json({
        error: "Invalid status"
      });
    }

    const updated_at = new Date();

    const updateData = {
      updated_at
    };

    if (status) {
      updateData.status = status;
    }

    const result = await getTicketsCollection().updateOne(
      { ticket_id },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({
        error: "Ticket not found"
      });
    }

    if (noteText && noteText.trim()) {
      await getNotesCollection().insertOne({
        ticket_id,
        note_text: noteText.trim(),
        created_at: new Date()
      });
    }

    res.json({
      success: true,
      updated_at
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Failed to update ticket"
    });
  }
});

async function startServer() {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error);
    process.exit(1);
  }
}

startServer();