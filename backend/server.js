import express from "express";
import cors from "cors";
import sql from "mssql";
import multer from "multer";

const app = express();
app.use(cors());
app.use(express.json());

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // Limit to 5MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/png"];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only JPEG and PNG images are allowed"));
    }
  },
});

const config = {
  user: "jubu",
  password: "1234",
  server: "localhost", // Update to "localhost\\JuBu" if needed
  database: "USERDATA",
  options: {
    encrypt: true,
    trustServerCertificate: true,
  },
  port: 1433,
};

// Middleware to handle multer errors
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ error: `Multer error: ${err.message}` });
  } else if (err) {
    return res.status(400).json({ error: err.message });
  }
  next();
});

// Route to fetch users
app.get("/USERS", async (req, res) => {
  try {
    const pool = await sql.connect(config);
    const result = await pool.request().query(`
      SELECT UserID, UserName, Email, FullName, DateOfBirth, Gender, CreatedAt, IsActive, Image
      FROM USERS
    `);
    const users = result.recordset.map((user) => ({
      ...user,
      Image: user.Image ? Buffer.from(user.Image).toString("base64") : null,
    }));
    res.json(users);
  } catch (err) {
    console.error("SQL error", err);
    res.status(500).json({ error: `SQL Error: ${err.message}` });
  }
});

// Route to add a new user
app.post("/USERS", upload.single("Image"), async (req, res) => {
  const { UserName, Email, FullName, DateOfBirth, Gender, IsActive } = req.body;
  const image = req.file ? req.file.buffer : null;

  if (!UserName || !Email || !Gender) {
    return res
      .status(400)
      .json({ error: "UserName, Email, and Gender are required" });
  }

  try {
    const pool = await sql.connect(config);
    const request = pool.request();
    request.input("UserName", sql.VarChar(50), UserName);
    request.input("Email", sql.VarChar(100), Email);
    request.input("FullName", sql.VarChar(100), FullName || null);
    request.input("DateOfBirth", sql.Date, DateOfBirth || null);
    request.input("Gender", sql.Char(1), Gender);
    request.input("IsActive", sql.Bit, IsActive === "true" ? 1 : 0);
    request.input("Image", sql.VarBinary(sql.MAX), image);

    const query = `
      INSERT INTO USERS (UserName, Email, FullName, DateOfBirth, Gender, IsActive, Image)
      VALUES (@UserName, @Email, @FullName, @DateOfBirth, @Gender, @IsActive, @Image);
      SELECT SCOPE_IDENTITY() AS UserID;
    `;
    const result = await request.query(query);
    res
      .status(201)
      .json({ message: "User created", UserID: result.recordset[0].UserID });
  } catch (err) {
    console.error("SQL error", err);
    res.status(500).json({ error: `SQL Error: ${err.message}` });
  }
});

// Route to update a user
app.put("/USERS/:id", upload.single("Image"), async (req, res) => {
  const userId = req.params.id;
  const { UserName, Email, FullName, DateOfBirth, Gender, IsActive } = req.body;
  const image = req.file ? req.file.buffer : null;

  if (!UserName || !Email || !Gender) {
    return res
      .status(400)
      .json({ error: "UserName, Email, and Gender are required" });
  }

  try {
    const pool = await sql.connect(config);
    const request = pool.request();
    request.input("UserID", sql.Int, userId);
    request.input("UserName", sql.VarChar(50), UserName);
    request.input("Email", sql.VarChar(100), Email);
    request.input("FullName", sql.VarChar(100), FullName || null);
    request.input("DateOfBirth", sql.Date, DateOfBirth || null);
    request.input("Gender", sql.Char(1), Gender);
    request.input("IsActive", sql.Bit, IsActive === "true" ? 1 : 0);
    request.input("Image", sql.VarBinary(sql.MAX), image);

    const query = `
      UPDATE USERS
      SET UserName = @UserName,
          Email = @Email,
          FullName = @FullName,
          DateOfBirth = @DateOfBirth,
          Gender = @Gender,
          IsActive = @IsActive,
          Image = CASE WHEN @Image IS NOT NULL THEN @Image ELSE Image END
      WHERE UserID = @UserID;
    `;
    const result = await request.query(query);

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ message: "User updated successfully" });
  } catch (err) {
    console.error("SQL error", err);
    res.status(500).json({ error: `SQL Error: ${err.message}` });
  }
});

// Route to delete a user
app.delete("/USERS/:id", async (req, res) => {
  const userId = req.params.id;

  if (!userId) {
    return res.status(400).json({ error: "User ID is required" });
  }

  try {
    const pool = await sql.connect(config);
    const request = pool.request();
    request.input("UserID", sql.Int, userId);

    const query = "DELETE FROM USERS WHERE UserID = @UserID";
    const result = await request.query(query);

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ message: "User deleted successfully" });
  } catch (err) {
    console.error("SQL error", err);
    res.status(500).json({ error: `SQL Error: ${err.message}` });
  }
});

// Route to fetch employees
app.get("/Employeeqp", async (req, res) => {
  try {
    const pool = await sql.connect(config);
    const result = await pool.request().query("SELECT * FROM Employeeqp");
    res.json(result.recordset);
  } catch (err) {
    console.error("SQL error", err);
    res.status(500).json({ error: `SQL Error: ${err.message}` });
  }
});

// Test database connection
app.get("/test-db", async (req, res) => {
  try {
    const pool = await sql.connect(config);
    const result = await pool
      .request()
      .query("SELECT GETDATE() AS CurrentTime");
    res.json(result.recordset);
  } catch (err) {
    console.error("Database connection error:", err);
    res.status(500).json({ error: `DB connection failed: ${err.message}` });
  }
});

app.get("/", (req, res) => {
  res.send(
    `<div style="font-family: Arial, sans-serif; background: #f9f9f9; padding: 30px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.07); max-width: 600px; margin: 40px auto; text-align: center;">
      <h2 style="color: #2d7ff9;">Hello! I'm Jubayer from backend.</h2>
      <p style="font-size: 1.1em; color: #333;">
        Welcome to the server!<br>
        To see the data, go to <a href="/USERS" style="color: #2d7ff9;">/USERS</a> or <a href="/Employeeqp" style="color: #2d7ff9;">/Employeeqp</a>
      </p>
    </div>`
  );
});

const PORT = process.env.PORT || 3010;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// import express from "express";
// import cors from "cors";
// import sql from "mssql";

// const app = express();
// app.use(cors());

// const config = {
//   user: "jubu",
//   password: "1234",
//   server: "localhost",
//   database: "USERDATA",
//   options: {
//     encrypt: true,
//     trustServerCertificate: true,
//   },
//   port: 1433,
// };

// // Route to fetch users from the database
// app.get("/USERS", async (req, res) => {
//   try {
//     const pool = await sql.connect(config); // Connect to SQL Server
//     const result = await pool.request().query("SELECT * FROM USERS"); // Run the query
//     res.json(result.recordset); // Return the records as JSON
//   } catch (err) {
//     console.error("SQL error", err);
//     res.status(500).send("SQL Error: " + err.message); // Return error if query fails
//   }
// });

// app.get("/Employeeqp", async (req, res) => {
//   try {
//     const pool = await sql.connect(config);
//     const result = await pool.request().query("SELECT * FROM Employeeqp");
//     res.json(result.recordset);
//   } catch (err) {
//     console.error("SQL error", err);
//     res.status(500).send("SQL Error: " + err.message); // Return error if query fails
//   }
// });

// // Test database connection
// app.get("/test-db", async (req, res) => {
//   try {
//     const pool = await sql.connect(config); // Connect to SQL Server
//     const result = await pool
//       .request()
//       .query("SELECT GETDATE() AS CurrentTime"); // Query current time
//     res.json(result.recordset); // Return current time
//   } catch (err) {
//     console.error("Database connection error:", err);
//     res.status(500).send("DB connection failed: " + err.message); // Return error if connection fails
//   }
// });

// app.get("/", (req, res) => {
//   res.send("Hello! I'm Jubayer from backend. Welcome to my server!");
// });

// const PORT = process.env.PORT || 3000;
// app.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`);
// });
