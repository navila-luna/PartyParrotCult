const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(path.join(__dirname)));

const GRID_ROWS = 17;
const GRID_COLS = 8;


// Function to create a fresh grid state
function createInitialGridState() {
    const state = {};
    for (let r = 1; r <= GRID_ROWS; r++) {
        for (let c = 1; c <= GRID_COLS; c++) {
            state[`r${r}-c${c}`] = false;
        }
    }
    return state;
}

// store checkbox state
let gridState = createInitialGridState();

io.on("connection", (socket) => {
    console.log("User connected:", socket.id);
    // Send full grid to new user
    socket.emit("init-state", 
        gridState
    );

    // Checkbox updates
    socket.on("checkbox-updated", ({ id, checked }) => {
        gridState[id] = checked;
        socket.broadcast.emit("checkbox-updated", { id, checked});
    });

    // Cursor events
    socket.on("cursor-move", (pos) => {
        socket.broadcast.emit("cursor-update", {
            userId: socket.id,
            x: pos.x,
            y: pos.y
        });
    });
    
    socket.on("reset-grid", () => {
        console.log("Grid reset requested by:", socket.id);
        gridState = createInitialGridState();
        io.emit("grid-reset", gridState);
    });

    socket.on("disconnect", () => {
        io.emit("cursor-remove", socket.id);
        console.log("User disconnected:", socket.id);
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log("Server running on http://localhost:" + PORT));
