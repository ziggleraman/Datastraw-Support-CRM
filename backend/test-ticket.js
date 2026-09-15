const http = require("http");

const data = JSON.stringify({
    customer_name: "Aman",
    customer_email: "aman@example.com",
    subject: "Login problem",
    description: "I am unable to log into my account."
});

const options = {
    hostname: "localhost",
    port: 5000,
    path: "/api/tickets",
    method: "POST",
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