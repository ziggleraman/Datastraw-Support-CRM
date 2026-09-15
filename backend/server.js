const express = require("express");
const cors = require("cors");
const db = require("./database");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Test route
app.get("/", (req, res) => {
    res.json({
        message: "Datastraw Support CRM Backend is running!"
    });
});

// Create a new ticket
app.post("/api/tickets", (req, res) => {
    const {
        customer_name,
        customer_email,
        subject,
        description
    } = req.body;

    // Check required fields
    if (!customer_name || !customer_email || !subject || !description) {
        return res.status(400).json({
            error: "All fields are required."
        });
    }

    // Generate ticket ID
    const ticketId = `TKT-${Date.now()}`;

    const sql = `
        INSERT INTO tickets
        (ticket_id, customer_name, customer_email, subject, description)
        VALUES (?, ?, ?, ?, ?)
    `;

    db.run(
        sql,
        [
            ticketId,
            customer_name,
            customer_email,
            subject,
            description
        ],
        function (err) {
            if (err) {
                console.error(err.message);

                return res.status(500).json({
                    error: "Failed to create ticket."
                });
            }

            res.status(201).json({
                ticket_id: ticketId,
                created_at: new Date().toISOString()
            });
        }
    );
});

// Get a single ticket with its notes
app.get("/api/tickets/:ticket_id", (req, res) => {
    const ticketId = req.params.ticket_id;

    const ticketSql = `
        SELECT
            ticket_id,
            customer_name,
            customer_email,
            subject,
            description,
            status,
            created_at,
            updated_at
        FROM tickets
        WHERE ticket_id = ?
    `;

    db.get(ticketSql, [ticketId], (err, ticket) => {
        if (err) {
            console.error(err.message);

            return res.status(500).json({
                error: "Failed to retrieve ticket."
            });
        }

        if (!ticket) {
            return res.status(404).json({
                error: "Ticket not found."
            });
        }

        const notesSql = `
            SELECT
                id,
                note_text,
                created_at
            FROM notes
            WHERE ticket_id = ?
            ORDER BY created_at DESC
        `;

        db.all(notesSql, [ticketId], (err, notes) => {
            if (err) {
                console.error(err.message);

                return res.status(500).json({
                    error: "Failed to retrieve notes."
                });
            }

            res.json({
                ...ticket,
                notes: notes
            });
        });
    });
});

// Update ticket status and/or add a note
app.put("/api/tickets/:ticket_id", (req, res) => {
    const ticketId = req.params.ticket_id;
    const { status, notes } = req.body;

    const allowedStatuses = ["Open", "In Progress", "Closed"];

    // Validate status if provided
    if (status && !allowedStatuses.includes(status)) {
        return res.status(400).json({
            error: "Invalid status."
        });
    }

    // Check that the ticket exists
    db.get(
        "SELECT ticket_id FROM tickets WHERE ticket_id = ?",
        [ticketId],
        (err, ticket) => {
            if (err) {
                console.error(err.message);

                return res.status(500).json({
                    error: "Database error."
                });
            }

            if (!ticket) {
                return res.status(404).json({
                    error: "Ticket not found."
                });
            }

            const updatedAt = new Date().toISOString();

            // Update status if provided
            if (status) {
                db.run(
                    `UPDATE tickets
                     SET status = ?, updated_at = ?
                     WHERE ticket_id = ?`,
                    [status, updatedAt, ticketId],
                    (err) => {
                        if (err) {
                            console.error(err.message);

                            return res.status(500).json({
                                error: "Failed to update ticket."
                            });
                        }

                        addNote();
                    }
                );
            } else {
                addNote();
            }

            // Add note if provided
            function addNote() {
                if (notes && notes.trim() !== "") {
                    db.run(
                        `INSERT INTO notes (ticket_id, note_text)
                         VALUES (?, ?)`,
                        [ticketId, notes.trim()],
                        (err) => {
                            if (err) {
                                console.error(err.message);

                                return res.status(500).json({
                                    error: "Failed to add note."
                                });
                            }

                            finishUpdate();
                        }
                    );
                } else {
                    finishUpdate();
                }
            }

            function finishUpdate() {
                res.json({
                    success: true,
                    updated_at: updatedAt
                });
            }
        }
    );
});

    // Get all tickets
app.get("/api/tickets", (req, res) => {
    const { status, search } = req.query;

    let sql = `
        SELECT
            ticket_id,
            customer_name,
            customer_email,
            subject,
            status,
            created_at
        FROM tickets
    `;

    const conditions = [];
    const params = [];

    // Filter by status
    if (status) {
        conditions.push("status = ?");
        params.push(status);
    }

    // Search across relevant fields
    if (search) {
        conditions.push(`
            (
                ticket_id LIKE ?
                OR customer_name LIKE ?
                OR customer_email LIKE ?
                OR subject LIKE ?
                OR description LIKE ?
            )
        `);

        const searchValue = `%${search}%`;

        params.push(
            searchValue,
            searchValue,
            searchValue,
            searchValue,
            searchValue
        );
    }

    // Add conditions to SQL
    if (conditions.length > 0) {
        sql += " WHERE " + conditions.join(" AND ");
    }

    // Newest tickets first
    sql += " ORDER BY created_at DESC";

    db.all(sql, params, (err, rows) => {
        if (err) {
            console.error(err.message);

            return res.status(500).json({
                error: "Failed to retrieve tickets."
            });
        }

        res.json(rows);
    });
});
// Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});