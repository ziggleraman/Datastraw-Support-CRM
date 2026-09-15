import { useEffect, useState } from "react";
const API_URL = import.meta.env.VITE_API_URL;

function App() {
  const [tickets, setTickets] = useState([]);
  const [allTickets, setAllTickets] = useState([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All");
  const [loading, setLoading] = useState(true);

  const [showForm, setShowForm] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);

  const [formData, setFormData] = useState({
    customer_name: "",
    customer_email: "",
    subject: "",
    description: ""
  });

  useEffect(() => {
    fetchTickets();
}, [search, status]);

useEffect(() => {
    fetchAllTickets();
}, []);

  async function fetchTickets() {
    try {
      setLoading(true);

      let url = `${API_URL}/api/tickets?`;

      if (search) {
        url += `search=${encodeURIComponent(search)}&`;
      }

      if (status !== "All") {
        url += `status=${encodeURIComponent(status)}`;
      }

      const response = await fetch(url);
      const data = await response.json();

      setTickets(data);
    } catch (error) {
      console.error("Failed to fetch tickets:", error);
    } finally {
      setLoading(false);
    }
  }

  const fetchAllTickets = async () => {
    try {
        const response = await fetch(`${API_URL}/api/tickets`);
        const data = await response.json();
        setAllTickets(data);
    } catch (error) {
        console.error("Error fetching all tickets:", error);
    }
};

  async function openTicket(ticketId) {
    try {
      const response = await fetch(
        `${API_URL}/api/tickets/${ticketId}`
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || "Failed to load ticket.");
        return;
      }

      setSelectedTicket(data);
    } catch (error) {
      console.error(error);
      alert("Could not connect to the server.");
    }
  }

  function handleChange(e) {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  }

  async function createTicket(e) {
    e.preventDefault();

    try {
      const response = await fetch(
        `${API_URL}/api/tickets`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(formData)
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || "Failed to create ticket.");
        return;
      }

      alert(`Ticket created successfully: ${data.ticket_id}`);

      setFormData({
        customer_name: "",
        customer_email: "",
        subject: "",
        description: ""
      });

      setShowForm(false);
      fetchTickets();
      fetchAllTickets();

    } catch (error) {
      console.error(error);
      alert("Could not connect to the server.");
    }
  }

  // Ticket details screen
  if (selectedTicket) {
    return (
      <TicketDetails
        ticket={selectedTicket}
        onBack={() => setSelectedTicket(null)}
        onUpdated={(updatedTicket) => {
          setSelectedTicket(updatedTicket);
          fetchTickets();
          fetchAllTickets();
        }}
      />
    );
  }

  return (
    <div className="app">

      <header className="header">
        <div>
          <h1>Datastraw Support CRM</h1>
          <p>Customer Support Ticketing System</p>
        </div>

        <button
          className="new-ticket-btn"
          onClick={() => setShowForm(true)}
        >
          + New Ticket
        </button>
      </header>

      <main className="container">

        {showForm && (
          <div className="form-card">

            <div className="form-header">
              <h2>Create New Ticket</h2>

              <button
                className="close-btn"
                onClick={() => setShowForm(false)}
              >
                ×
              </button>
            </div>

            <form onSubmit={createTicket}>

              <label>Customer Name</label>
              <input
                type="text"
                name="customer_name"
                value={formData.customer_name}
                onChange={handleChange}
                required
              />

              <label>Customer Email</label>
              <input
                type="email"
                name="customer_email"
                value={formData.customer_email}
                onChange={handleChange}
                required
              />

              <label>Issue Title</label>
              <input
                type="text"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                required
              />

              <label>Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="5"
                required
              />

              <div className="form-actions">

                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="submit-btn"
                >
                  Create Ticket
                </button>

              </div>

            </form>
          </div>
        )}
          {/* Dashboard Statistics */}
          <div className="stats">

            <div className="stat-card">
              <span>Total Tickets</span>
              <strong>{allTickets.length}</strong>
            </div>

            <div className="stat-card">
              <span>Open</span>
              <strong>
                {allTickets.filter((ticket) => ticket.status === "Open").length}
              </strong>
            </div>

            <div className="stat-card">
              <span>In Progress</span>
              <strong>
                {allTickets.filter((ticket) => ticket.status === "In Progress").length}
              </strong>
            </div>

            <div className="stat-card">
              <span>Closed</span>
              <strong>
                {allTickets.filter((ticket) => ticket.status === "Closed").length}
              </strong>
            </div>

          </div>

        <div className="toolbar">

          <input
            type="text"
            placeholder="Search by ID, name, email, subject..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="All">All Statuses</option>
            <option value="Open">Open</option>
            <option value="In Progress">In Progress</option>
            <option value="Closed">Closed</option>
          </select>

        </div>

        <div className="ticket-list">

          {loading ? (
            <p>Loading tickets...</p>
          ) : tickets.length === 0 ? (
            <p>No tickets found.</p>
          ) : (
            tickets.map((ticket) => (
              <div
                className="ticket-card"
                key={ticket.ticket_id}
                onClick={() => openTicket(ticket.ticket_id)}
              >

                <div>
                  <span className="ticket-id">
                    {ticket.ticket_id}
                  </span>

                  <h2>{ticket.subject}</h2>

                  <p>
                    Customer: {ticket.customer_name}
                  </p>

                  <p>
                  Email: {ticket.customer_email}
                  </p>

                  <p>
                  Created: {new Date(ticket.created_at).toLocaleString("en-IN", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit"
                  })}
                  </p>
                </div>

                <span
                  className={`status ${ticket.status
                    .toLowerCase()
                    .replace(" ", "-")}`}
                >
                  {ticket.status}
                </span>

              </div>
            ))
          )}

        </div>

      </main>

    </div>
  );
}


// -----------------------------
// Ticket Details Component
// -----------------------------

function TicketDetails({ ticket, onBack, onUpdated }) {

  const [newStatus, setNewStatus] = useState(ticket.status);
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);

  async function updateTicket() {

    if (!note.trim() && newStatus === ticket.status) {
      alert("Make a status change or add a note.");
      return;
    }

    try {
      setSaving(true);

      const response = await fetch(
        `${API_URL}/api/tickets/${ticket.ticket_id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            status: newStatus,
            notes: note
          })
        }
      );

      const result = await response.json();

      if (!response.ok) {
        alert(result.error || "Failed to update ticket.");
        return;
      }

      // Fetch updated ticket
      const ticketResponse = await fetch(
        `${API_URL}/api/tickets/${ticket.ticket_id}`
      );

      const updatedTicket = await ticketResponse.json();

      setNote("");
      onUpdated(updatedTicket);

      alert("Ticket updated successfully.");

    } catch (error) {
      console.error(error);
      alert("Could not connect to the server.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="app">

      <header className="header">

        <div>
          <h1>Ticket Details</h1>
          <p>{ticket.ticket_id}</p>
        </div>

        <button
          className="cancel-btn"
          onClick={onBack}
        >
          ← Back to Tickets
        </button>

      </header>

      <main className="container">

        <div className="details-card">

          <div className="details-top">
            <div>
              <span className="ticket-id">
                {ticket.ticket_id}
              </span>

              <h2>{ticket.subject}</h2>
            </div>

            <span
              className={`status ${ticket.status
                .toLowerCase()
                .replace(" ", "-")}`}
            >
              {ticket.status}
            </span>
          </div>

          <hr />

          <h3>Customer Information</h3>

          <p>
            <strong>Name:</strong> {ticket.customer_name}
          </p>

          <p>
            <strong>Email:</strong> {ticket.customer_email}
          </p>

          <h3>Issue Description</h3>

          <p className="description">
            {ticket.description}
          </p>

          <h3>Notes</h3>

          {ticket.notes.length === 0 ? (
            <p className="empty-notes">
              No notes yet.
            </p>
          ) : (
            <div className="notes-list">
              {ticket.notes.map((item) => (
                <div className="note" key={item.id}>
                  <p>{item.note_text}</p>
                  <small>{item.created_at}</small>
                </div>
              ))}
            </div>
          )}

          <hr />

          <h3>Update Ticket</h3>

          <label>Status</label>

          <select
            className="status-select"
            value={newStatus}
            onChange={(e) => setNewStatus(e.target.value)}
          >
            <option value="Open">Open</option>
            <option value="In Progress">In Progress</option>
            <option value="Closed">Closed</option>
          </select>

          <label>Add Note</label>

          <textarea
            className="note-input"
            placeholder="Write a note or comment..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows="4"
          />

          <button
            className="submit-btn"
            onClick={updateTicket}
            disabled={saving}
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>

        </div>

      </main>

    </div>
  );
}

export default App;