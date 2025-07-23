"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const body_parser_1 = __importDefault(require("body-parser"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const connection_1 = require("./db/connection");
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const taskRoutes_1 = __importDefault(require("./routes/taskRoutes"));
// Load environment variables
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = process.env.PORT || 8000;
// Middleware
app.use(express_1.default.static(__dirname + '/'));
app.use(body_parser_1.default.urlencoded({ extended: false }));
app.use(body_parser_1.default.json());
app.use(express_1.default.json({ limit: '50mb' }));
app.use((0, cors_1.default)());
// Connect to MongoDB
connection_1.db.connect().catch(console.error);
// Routes
app.use('/api', userRoutes_1.default);
app.use('/api', taskRoutes_1.default);
// Test endpoint
app.get('/testEndPoint', function (req, res) {
    var response = { "response": "test endpoint" };
    res.json(response);
});
// Legacy endpoints (keeping for backward compatibility)
app.get('/getUserData', function (req, res) {
    var response = [
        { studentId: 1, studentName: "Shubham Patil", emailId: "Shubham.patil@gmail.com" },
        { studentId: 2, studentName: "Harsh Patil", emailId: "Harsh.patil@gmail.com" },
        { studentId: 3, studentName: "Vinit Patil", emailId: "Vinit.patil@gmail.com" },
        { studentId: 4, studentName: "Vinu Patil", emailId: "Vinu.patil@gmail.com" },
        { studentId: 5, studentName: "Naitik Patil", emailId: "Naitik.patil@gmail.com" },
        { studentId: 6, studentName: "Vedu Patil", emailId: ".Vedupatil@gmail.com" },
        { studentId: 7, studentName: "Vedant Patil", emailId: "Vedant.patil@gmail.com" },
        { studentId: 8, studentName: "Shubham S Patil", emailId: "Shubham.S.patil@gmail.com" }
    ];
    res.json(response);
});
app.get('/user/logIn', function (req, res) {
    var userEmail = req.query.userEmail;
    var password = req.query.password;
    if (userEmail == 'ssp@gmail.com' && password == 'ssp') {
        res.json({ status: true });
    }
    else
        res.json({ status: false });
});
// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: 'Something went wrong!',
        error: process.env.NODE_ENV === 'development' ? err.message : 'Internal Server Error'
    });
});
// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});
const server = http_1.default.createServer(app);
server.listen(port, () => {
    console.log(`🚀 theBox Running at port: ${port}`);
    console.log(`📖 API Documentation available at: http://localhost:${port}/api`);
});
//# sourceMappingURL=server.js.map