const db = require("../config/db");

// Stats
exports.getAdminStats = async (req, res) => {
  try {
    const [total] = await db.query("SELECT COUNT(*) AS count FROM users");
    const [active] = await db.query("SELECT COUNT(*) AS count FROM users WHERE account_status = 'active'");
    const [frozen] = await db.query("SELECT COUNT(*) AS count FROM users WHERE account_status = 'frozen'");
console.log("Admin stats API called");
console.log("Total:", total[0].count);
console.log("Active:", active[0].count);
console.log("Frozen:", frozen[0].count);
    res.json({
      totalUsers: total[0].count,
      activeUsers: active[0].count,
      frozenUsers: frozen[0].count,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching stats" });
  }
};
exports.getRecentTransactions = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT id, type, amount, description, status, created_at
      FROM transactions
      ORDER BY created_at DESC
      LIMIT 5
    `);

    console.log("RECENT ROWS:", rows);
    res.json(rows);
  } catch (error) {
    console.error("RECENT ERROR:", error);
    res.status(500).json({ message: "Error fetching recent transactions" });
  }
};

exports.getMonthlyTransactions = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        DATE_FORMAT(created_at, '%b') AS month,
        COUNT(*) AS totalTransactions
      FROM transactions
      GROUP BY DATE_FORMAT(created_at, '%b')
      ORDER BY MIN(created_at)
    `);

    const formattedRows = rows.map((row) => ({
      month: row.month,
      totalTransactions: Number(row.totalTransactions),
    }));

    console.log("MONTHLY ROWS:", formattedRows);
    res.json(formattedRows);
  } catch (error) {
    console.error("MONTHLY ERROR:", error);
    res.status(500).json({ message: "Error fetching monthly transactions" });
  }
};

exports.getTransactionSummary = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT type, SUM(amount) AS total
      FROM transactions
      GROUP BY type
    `);

    let deposits = 0;
    let withdrawals = 0;
    let transfers = 0;

    rows.forEach((row) => {
      if (row.type === "deposit") deposits = Number(row.total);
      if (row.type === "withdraw") withdrawals = Number(row.total);
      if (row.type === "transfer") transfers = Number(row.total);
    });

    const summary = {
      deposits,
      withdrawals,
      transfers,
    };

    console.log("SUMMARY ROWS:", summary);
    res.json(summary);
  } catch (error) {
    console.error("SUMMARY ERROR:", error);
    res.status(500).json({ message: "Error fetching transaction summary" });
  }
};
// Get users
exports.getAllUsers = async (req, res) => {
  try {
    const [users] = await db.query(
      "SELECT id, first_name, last_name, mobile, email, role, account_status FROM users"
    );
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching users" });
  }
};

// Freeze
exports.freezeAccount = async (req, res) => {
  try {
    const { id } = req.params;

    await db.query(
      "UPDATE users SET account_status = 'frozen' WHERE id = ?",
      [id]
    );

    res.json({ message: "Account frozen" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error freezing account" });
  }
};

// Unfreeze
exports.unfreezeAccount = async (req, res) => {
  try {
    const { id } = req.params;

    await db.query(
      "UPDATE users SET account_status = 'active' WHERE id = ?",
      [id]
    );

    res.json({ message: "Account active" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error unfreezing account" });
  }
};