const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const dotenv = require("dotenv");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const adminRoutes = require("./routes/adminRoutes");
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use("/api/admin", adminRoutes);

const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

// test route
app.get("/", (req, res) => {
  res.send("Banking API running");
});

// register
app.post("/register", async (req, res) => {
  try {
    const { first_name, last_name, mobile, email, password } = req.body;

    if (!first_name || !last_name || !mobile || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const sql =
      "INSERT INTO users (first_name, last_name, mobile, email, password) VALUES (?, ?, ?, ?, ?)";

    db.query(
      sql,
      [first_name, last_name, mobile, email, hashedPassword],
      (err, result) => {
        if (err) {
          console.log(err);
          return res.status(500).json({ message: "Registration failed", error: err });
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

        console.log("Generated OTP:", otp);

        db.query(
          "INSERT INTO otp_verifications (user_id, mobile, otp_code, expires_at) VALUES (?, ?, ?, ?)",
          [result.insertId, mobile, otp, expiresAt],
          (otpErr) => {
            if (otpErr) {
              console.log(otpErr);
              return res.status(500).json({ message: "OTP save failed", error: otpErr });
            }

            res.json({
              message: "User registered. OTP generated successfully.",
              userId: result.insertId,
              demoOtp: otp
            });
          }
        );
      }
    );
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});
app.get("/admin/user-count", (req, res) => {
  const sql = "SELECT COUNT(*) AS totalUsers FROM users";

  db.query(sql, (err, result) => {
    if (err) return res.status(500).json(err);
    res.json({ totalUsers: result[0].totalUsers });
  });
});
app.get("/admin/account-count", (req, res) => {
  const sql = "SELECT COUNT(*) AS totalAccounts FROM accounts";

  db.query(sql, (err, result) => {
    if (err) return res.status(500).json(err);
    res.json({ totalAccounts: result[0].totalAccounts });
  });
});
app.get("/admin/transaction-count", (req, res) => {
  const sql = "SELECT COUNT(*) AS totalTransactions FROM transactions";

  db.query(sql, (err, result) => {
    if (err) return res.status(500).json(err);
    res.json({ totalTransactions: result[0].totalTransactions });
  });
});
app.get("/api/admin/stats", (req, res) => {
  const totalUsersQuery = "SELECT COUNT(*) AS totalUsers FROM users";
  const activeUsersQuery = "SELECT COUNT(*) AS activeUsers FROM users WHERE status = 'active'";
  const frozenUsersQuery = "SELECT COUNT(*) AS frozenUsers FROM users WHERE status = 'frozen'";

  db.query(totalUsersQuery, (err, totalResult) => {
    if (err) return res.status(500).json(err);

    db.query(activeUsersQuery, (err, activeResult) => {
      if (err) return res.status(500).json(err);

      db.query(frozenUsersQuery, (err, frozenResult) => {
        if (err) return res.status(500).json(err);

        res.json({
          totalUsers: totalResult[0].totalUsers,
          activeUsers: activeResult[0].activeUsers,
          frozenUsers: frozenResult[0].frozenUsers,
        });
      });
    });
  });
});
// verify otp
app.post("/verify-otp", (req, res) => {
  const { mobile, otp } = req.body;

  db.query(
    "SELECT * FROM otp_verifications WHERE mobile = ? AND otp_code = ? AND verified = FALSE ORDER BY id DESC LIMIT 1",
    [mobile, otp],
    (err, results) => {
      if (err) {
        return res.status(500).json({ message: "OTP verification failed", error: err });
      }

      if (results.length === 0) {
        return res.status(400).json({ message: "Invalid OTP" });
      }

      const record = results[0];
      const now = new Date();

      if (now > new Date(record.expires_at)) {
        return res.status(400).json({ message: "OTP expired" });
      }
      db.query(
        "UPDATE otp_verifications SET verified = TRUE WHERE id = ?",
        [record.id],
        (otpUpdateErr) => {
          if (otpUpdateErr) {
            return res.status(500).json({ message: "OTP update failed", error: otpUpdateErr });
          }

          db.query(
            "UPDATE users SET is_verified = TRUE WHERE id = ?",
            [record.user_id],
            (userUpdateErr) => {
              if (userUpdateErr) {
                return res.status(500).json({ message: "User verification failed", error: userUpdateErr });
              }

              res.json({ message: "OTP verified successfully" });
            }
          );
        }
      );
    }
  );
});

// login
app.post("/login", (req, res) => {
  const { email, password } = req.body;

  db.query("SELECT * FROM users WHERE email = ?", [email], async (err, results) => {
    if (err) {
      return res.status(500).json({ message: "Login failed", error: err });
    }

    if (results.length === 0) {
      return res.status(400).json({ message: "User not found" });
    }

    const user = results[0];

    if (!user.is_verified) {
      return res.status(400).json({ message: "Please verify OTP first" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid password" });
    }

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        mobile: user.mobile,
        role: user.role
      }
    });
  });
});
app.post("/create-account", async (req, res) => {
  try {
    const {
      user_id,
      account_type,
      branch_name,
      ifsc_code,
      initial_deposit,
      transaction_pin
    } = req.body;

    if (!user_id || !account_type || !branch_name || !ifsc_code || !transaction_pin) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const accountNumber = Math.floor(100000000000 + Math.random() * 900000000000).toString();
    const hashedPin = await bcrypt.hash(transaction_pin, 10);

    const sql = `
      INSERT INTO bank_accounts
      (user_id, account_number, account_type, branch_name, ifsc_code, balance, transaction_pin)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(
      sql,
      [
        user_id,
        accountNumber,
        account_type,
        branch_name,
        ifsc_code,
        initial_deposit || 0,
        hashedPin
      ],
      (err, result) => {
        if (err) {
          console.log("Create account error:", err);
          return res.status(500).json({ message: "Bank account creation failed", error: err });
        }

        res.json({
          message: "Bank account created successfully",
          account_number: accountNumber
        });
      }
    );
  } catch (error) {
    console.log("Create account server error:", error);
    res.status(500).json({ message: "Server error", error });
  }
});
app.get("/accounts/:user_id", (req, res) => {
  const { user_id } = req.params;

  db.query(
    "SELECT id, account_number, account_type, branch_name, ifsc_code, balance, created_at FROM bank_accounts WHERE user_id = ?",
    [user_id],
    (err, results) => {
      if (err) {
        console.log("Fetch accounts error:", err);
        return res.status(500).json({ message: "Failed to fetch accounts", error: err });
      }

      res.json(results);
    }
  );
});
app.post("/deposit", (req, res) => {
  const { account_id, amount, transaction_pin } = req.body;

  if (!account_id || !amount || !transaction_pin) {
    return res.status(400).json({ message: "Account ID, amount, and transaction PIN are required" });
  }

  db.query(
    "SELECT * FROM bank_accounts WHERE id = ?",
    [account_id],
    async (err, results) => {
      if (err) {
        console.log("Deposit fetch error:", err);
        return res.status(500).json({ message: "Server error", error: err });
      }

      if (results.length === 0) {
        return res.status(404).json({ message: "Account not found" });
      }

      const account = results[0];
      const isPinValid = await bcrypt.compare(transaction_pin, account.transaction_pin);

      if (!isPinValid) {
        return res.status(400).json({ message: "Invalid transaction PIN" });
      }

      const newBalance = Number(account.balance) + Number(amount);

      db.query(
        "UPDATE bank_accounts SET balance = ? WHERE id = ?",
        [newBalance, account_id],
        (updateErr) => {
          if (updateErr) {
            console.log("Deposit update error:", updateErr);
            return res.status(500).json({ message: "Deposit failed", error: updateErr });
          }

          db.query(
            "INSERT INTO transactions (account_id, type, amount, description, status) VALUES (?, 'deposit', ?, 'Amount deposited', 'success')",
            [account_id, amount],
            (txnErr) => {
              if (txnErr) {
                console.log("Transaction insert error:", txnErr);
                return res.status(500).json({ message: "Transaction save failed", error: txnErr });
              }

              res.json({
                message: "Deposit successful",
                new_balance: newBalance
              });
            }
          );
        }
      );
    }
  );
});
app.post("/withdraw", (req, res) => {
  const { account_id, amount, transaction_pin } = req.body;

  if (!account_id || !amount || !transaction_pin) {
    return res.status(400).json({
      message: "Account ID, amount, and transaction PIN are required"
    });
  }

  db.query(
    "SELECT * FROM bank_accounts WHERE id = ?",
    [account_id],
    async (err, results) => {
      if (err) {
        console.log(err);
        return res.status(500).json({ message: "Server error" });
      }

      if (results.length === 0) {
        return res.status(404).json({ message: "Account not found" });
      }

      const account = results[0];

      const isPinValid = await bcrypt.compare(
        transaction_pin,
        account.transaction_pin
      );

      if (!isPinValid) {
        return res.status(400).json({ message: "Invalid transaction PIN" });
      }

      if (Number(account.balance) < Number(amount)) {
        return res.status(400).json({ message: "Insufficient balance" });
      }

      const newBalance = Number(account.balance) - Number(amount);

      db.query(
        "UPDATE bank_accounts SET balance = ? WHERE id = ?",
        [newBalance, account_id],
        (updateErr) => {
          if (updateErr) {
            console.log(updateErr);
            return res.status(500).json({ message: "Withdraw failed" });
          }

          db.query(
            "INSERT INTO transactions (account_id, type, amount, description, status) VALUES (?, 'withdraw', ?, 'Amount withdrawn', 'success')",
            [account_id, amount]
          );

          res.json({
            message: "Withdraw successful",
            new_balance: newBalance
          });
        }
      );
    }
  );
});
app.get("/transactions/:account_id", (req, res) => {
  const { account_id } = req.params;

  db.query(
    "SELECT * FROM transactions WHERE account_id = ? ORDER BY created_at DESC",
    [account_id],
    (err, results) => {
      if (err) {
        console.log("Transaction history error:", err);
        return res.status(500).json({
          message: "Failed to fetch transaction history",
          error: err
        });
      }

      res.json(results);
    }
  );
});
app.post("/transfer-flex", (req, res) => {
  const {
    sender_account_id,
    receiver_account_number,
    receiver_mobile,
    amount,
    transaction_pin
  } = req.body;

  if (!sender_account_id || !amount || !transaction_pin) {
    return res.status(400).json({
      message: "Sender account, amount and PIN are required"
    });
  }

  if (!receiver_account_number && !receiver_mobile) {
    return res.status(400).json({
      message: "Provide receiver account number or mobile number"
    });
  }

  db.query(
    "SELECT * FROM bank_accounts WHERE id = ?",
    [sender_account_id],
    async (err, senderResults) => {
      if (err) {
        return res.status(500).json({ message: "Server error", error: err });
      }

      if (senderResults.length === 0) {
        return res.status(404).json({ message: "Sender account not found" });
      }

      const sender = senderResults[0];

      const isPinValid = await bcrypt.compare(transaction_pin, sender.transaction_pin);

      if (!isPinValid) {
        return res.status(400).json({ message: "Invalid transaction PIN" });
      }

      if (Number(sender.balance) < Number(amount)) {
        return res.status(400).json({ message: "Insufficient balance" });
      }

      const handleReceiverAccount = (receiver) => {
        if (!receiver) {
          return res.status(404).json({ message: "Receiver account not found" });
        }

        if (Number(receiver.id) === Number(sender.id)) {
          return res.status(400).json({ message: "Cannot transfer to the same account" });
        }

        const senderNewBalance = Number(sender.balance) - Number(amount);
        const receiverNewBalance = Number(receiver.balance) + Number(amount);

        db.query(
          "UPDATE bank_accounts SET balance = ? WHERE id = ?",
          [senderNewBalance, sender.id],
          (err1) => {
            if (err1) {
              return res.status(500).json({ message: "Failed to update sender balance", error: err1 });
            }

            db.query(
              "UPDATE bank_accounts SET balance = ? WHERE id = ?",
              [receiverNewBalance, receiver.id],
              (err2) => {
                if (err2) {
                  return res.status(500).json({ message: "Failed to update receiver balance", error: err2 });
                }

                db.query(
                  "INSERT INTO transactions (account_id, type, amount, description, receiver_account_number, status) VALUES (?, 'transfer', ?, 'Transfer successful', ?, 'success')",
                  [sender.id, amount, receiver.account_number]
                );

                db.query(
                  "INSERT INTO transactions (account_id, type, amount, description, status) VALUES (?, 'deposit', ?, 'Received transfer', 'success')",
                  [receiver.id, amount]
                );

                return res.json({
                  message: "Transfer successful",
                  sender_balance: senderNewBalance,
                  receiver_account_number: receiver.account_number
                });
              }
            );
          }
        );
      };

      if (receiver_account_number) {
        db.query(
          "SELECT * FROM bank_accounts WHERE account_number = ?",
          [receiver_account_number],
          (err3, receiverResults) => {
            if (err3) {
              return res.status(500).json({ message: "Receiver lookup failed", error: err3 });
            }

            if (receiverResults.length === 0) {
              return res.status(404).json({ message: "Receiver account not found" });
            }

            handleReceiverAccount(receiverResults[0]);
          }
        );
      } else {
        db.query(
          "SELECT * FROM users WHERE mobile = ?",
          [receiver_mobile],
          (err4, userResults) => {
            if (err4) {
              return res.status(500).json({ message: "Receiver mobile lookup failed", error: err4 });
            }

            if (userResults.length === 0) {
              return res.status(404).json({ message: "Receiver user not found" });
            }

            const receiverUser = userResults[0];

            db.query(
              "SELECT * FROM bank_accounts WHERE user_id = ? LIMIT 1",
              [receiverUser.id],
              (err5, receiverResults) => {
                if (err5) {
                  return res.status(500).json({ message: "Receiver account lookup failed", error: err5 });
                }

                if (receiverResults.length === 0) {
                  return res.status(404).json({ message: "Receiver bank account not found" });
                }

                handleReceiverAccount(receiverResults[0]);
              }
            );
          }
        );
      }
    }
  );
});
app.post("/view-balance", (req, res) => {
  const { user_id, password } = req.body;

  if (!user_id || !password) {
    return res.status(400).json({ message: "User ID and password are required" });
  }

  db.query("SELECT * FROM users WHERE id = ?", [user_id], async (err, userResults) => {
    if (err) {
      return res.status(500).json({ message: "Server error", error: err });
    }

    if (userResults.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const user = userResults[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid password" });
    }

    db.query(
      "SELECT account_number, account_type, balance FROM bank_accounts WHERE user_id = ?",
      [user_id],
      (accErr, accountResults) => {
        if (accErr) {
          return res.status(500).json({ message: "Failed to fetch balances", error: accErr });
        }

        res.json({
          message: "Balance fetched successfully",
          accounts: accountResults
        });
      }
    );
  });
});
app.delete("/delete-account/:id", (req, res) => {
  const accountId = req.params.id;

  db.query(
    "DELETE FROM transactions WHERE account_id = ?",
    [accountId],
    (txnErr) => {
      if (txnErr) {
        return res.status(500).json({
          message: "Failed to delete related transactions",
          error: txnErr
        });
      }

      db.query(
        "DELETE FROM bank_accounts WHERE id = ?",
        [accountId],
        (accErr, result) => {
          if (accErr) {
            return res.status(500).json({
              message: "Failed to delete account",
              error: accErr
            });
          }

          if (result.affectedRows === 0) {
            return res.status(404).json({
              message: "Account not found"
            });
          }

          res.json({
            message: "Account deleted successfully"
          });
        }
      );
    }
  );
});
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});