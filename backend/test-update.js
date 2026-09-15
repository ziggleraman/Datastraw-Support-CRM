const http = require("http");

const data = JSON.stringify({
    status: "In Progress",
    notes: "Support team is investigating the login issue."
});

const ticketId = "TKT-1789485767000";

const options = {
    hostname: "localhost",
    port: 5000,
    path: `/api/tickets/${ticketId}`,
    method: "PUT",
    headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(data)
    }
};

const request = http.request(options, (response) => {
    let result = "";

    response.on("data", (chunk) => {
        result += chunk;
    });

    response.on("end", () => {
        console.log("Status:", response.statusCode);
        console.log("Response:", result);
    });
});

request.on("error", (error) => {
    console.error("Error:", error.message);
});

request.write(data);
request.end();