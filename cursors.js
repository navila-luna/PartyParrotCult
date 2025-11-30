const socket = io();

const layer = document.getElementById("cursor-layer");
const cursors = {};

document.addEventListener("mousemove", (e) => {
    socket.emit("cursor-move", { x: e.clientX, y: e.clientY });
});

socket.on("cursor-update", ({ userId, x, y }) => {
    let cursor = cursors[userId];
    if (!cursor) {
        cursor = document.createElement("div");
        cursor.className = "remote-cursor";
        cursor.textContent = "🖱️";
        layer.appendChild(cursor);
        cursors[userId] = cursor;
    }
    cursor.style.left = x + "px";
    cursor.style.top = y + "px";
});

socket.on("cursor-remove", (userId) => {
    if (cursors[userId]) {
        cursors[userId].remove();
        delete cursors[userId];
    }
});
