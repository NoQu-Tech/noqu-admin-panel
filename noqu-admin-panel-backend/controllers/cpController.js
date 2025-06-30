// controllers/cpController.js

const { db } = require('../models/db');
const { dbAsync } = require('../models/db');
const { sendEmail } = require('../services/emailservices');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken'); 
const path = require('path');
const fs = require('fs');

// Generate 6-digit OTP
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();


exports.loginAdmin = (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }

  const sql = "SELECT * FROM admins WHERE email = ?";
  db.query(sql, [email], async (err, results) => {
    if (err) return res.status(500).json({ message: 'Database error', error: err });
    if (results.length === 0) return res.status(401).json({ message: 'Admin not found' });

    const admin = results[0];
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) return res.status(401).json({ message: 'Incorrect password' });

    // Ensure 'role' field exists in DB (e.g., 'admin', 'subadmin')
    const token = jwt.sign(
      {
        id: admin.id,
        role: admin.role || 'admin',  // Fallback to 'admin' if role is not present
        email: admin.email
      },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    return res.status(200).json({
      token,
      user: {
        id: admin.id,
        email: admin.email,
        role: admin.role
      }
    });
  });
};




/**
 * 1. CP Registration (initial request)
 * Inserts into `cp_requests` (legacy `cp`) table
 */
exports.registerCP = (req, res) => {
  const {
    companyName,
    typeOfCompany,
    companyAddress,
    companySize,
    fullName,
    countryCode,
    phoneNo,
    email,
    building,
    city,
    stateProvince,
    country,
    zip,
    website,
  } = req.body;

  const sql = `
    INSERT INTO cp_requests
    (company_name, type_of_company, company_address, company_size,
     full_name, country_code, phone_no, email, building,
     city, state_province, country, zip, website, status, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', NOW())
  `;
  const values = [
    companyName,
    typeOfCompany,
    companyAddress,
    companySize,
    fullName,
    countryCode,
    phoneNo,
    email,
    building,
    city,
    stateProvince,
    country,
    zip,
    website || null,
  ];

  db.query(sql, values, (err, result) => {
    if (err) {
      console.error('Error saving CP request:', err);
      return res.status(500).json({ message: 'Database error' });
    }
    // Confirmation email to CP
    const mailOptions = {
      to: email,
      subject: 'Thank you for your CP request',
      html: `<p>Hi ${fullName},</p><p>Thanks for registering as a Channel Partner. We'll review and get back to you.</p>`
    };
    sendEmail(mailOptions);
    return res.status(200).json({ message: 'Registration request submitted' });
  });
};

/**
 * 2. List all CP requests (pending)
 */
exports.getCPRequests = (_req, res) => {
  const sql = `
    SELECT *
    FROM cp_requests
    ORDER BY created_at DESC
  `;
  db.query(sql, (err, rows) => {
    if (err) {
      console.error('Error fetching CP requests:', err);
      return res.status(500).json({ message: 'Database error' });
    }
    return res.status(200).json({ requests: rows });
  });
};

/**
 * 3. Get single CP request by ID
 */
exports.getCPRequestById = (req, res) => {
  const { id } = req.params;
  const sql = `
    SELECT *
    FROM cp_requests
    WHERE id = ?
  `;
  db.query(sql, [id], (err, rows) => {
    if (err) {
      console.error('Error fetching CP detail:', err);
      return res.status(500).json({ message: 'Database error' });
    }
    if (rows.length === 0) {
      return res.status(404).json({ message: 'CP request not found' });
    }
    return res.status(200).json({ cp: rows[0] });
  });
};

/**
 * 4. Approve CP request
 *  - Create Firebase Auth user
 *  - Insert into channel_partners
 *  - Update cp_requests.status = 'approved'
 */
exports.approveCPRequest = async (req, res) => {
  const { id } = req.body;
  if (!id) return res.status(400).json({ message: 'Request ID required' });

  // 1. Get pending CP request
  db.query(
    `SELECT * FROM cp_requests WHERE id = ? AND status = 'pending'`,
    [id],
    async (err, rows) => {
      if (err || rows.length === 0) {
        console.error('CP fetch error:', err);
        return res.status(404).json({ message: 'Request not found or already processed' });
      }
      const cp = rows[0];

      // 2. Generate and hash temp password
      const tempPassword = Math.random().toString(36).slice(-8);
      const tempHash = await bcrypt.hash(tempPassword, 10);

      // 3. Insert into channel_partners
     const sqlIns = `
      INSERT INTO channel_partners (
        email, full_name, phone_no, country_code, company_name,
        type_of_company, company_address, company_size, website,
        city, state, zip, country, password_hash, temp_password, status,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, true, 'inactive', NOW(), NOW())
    `;
    
    const values = [
      cp.email, cp.full_name, cp.phone_no, cp.country_code, cp.company_name,
      cp.type_of_company, cp.company_address, cp.company_size, cp.website,
      cp.city, cp.state_province, cp.zip, cp.country, tempHash
    ];

      db.query(sqlIns, values, (insErr) => {
        if (insErr) {
          console.error('Insert error:', insErr);
          return res.status(500).json({ message: 'MySQL insert failed' });
        }

        // 4. Mark CP request as approved
        db.query(`UPDATE cp_requests SET status='approved' WHERE id = ?`, [id]);

        // 5. Send email with temp password
        sendEmail({
          to: cp.email,
          subject: 'CP Approved',
          text: `Hi ${cp.full_name}, your CP account is active.\nEmail: ${cp.email}\nPassword: ${tempPassword}`
        });

        return res.status(200).json({ message: 'CP Approved' });
      });
    }
  );
};

/**
 * 5. Update CP profile (channel_partners)
 */
exports.updateCPMember = (req, res) => {
  const { id, ...fields } = req.body;

  if (!id) {
    return res.status(400).json({ message: 'CP ID required' });
  }

  // Filter only keys that are defined (not null or undefined)
  const entries = Object.entries(fields).filter(([_, value]) => value !== undefined);

  if (entries.length === 0) {
    return res.status(400).json({ message: 'No valid fields provided for update' });
  }

  // Prepare SET clause dynamically
  const setClause = entries.map(([key]) => `${key} = ?`).join(', ');
  const values = entries.map(([_, value]) => value);

  const sql = `
    UPDATE channel_partners
    SET ${setClause}, updated_at = NOW()
    WHERE id = ?
  `;
  values.push(id);

  db.query(sql, values, (err, result) => {
    if (err) {
      console.error('Update CP error:', err);
      return res.status(500).json({ message: 'Update failed' });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'CP not found' });
    }
    return res.status(200).json({ message: 'CP updated successfully' });
  });
};




exports.loginCP = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password required' });
  }

  db.query(`SELECT * FROM channel_partners WHERE email = ?`, [email], async (err, rows) => {
    if (err || rows.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const cp = rows[0];
    const isMatch = await bcrypt.compare(password, cp.password_hash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Handle temporary password logic
    if (cp.temp_password) {
      return res.status(200).json({
        tempLogin: true,
        user: {
          id: cp.id,
          email: cp.email
        },
        message: 'Temporary password in use. Redirect to reset password.'
      });
    }

    // ✅ Add role to token (important for role-based access)
    const token = jwt.sign(
      {
        id: cp.id,
        role: 'cp',
        email: cp.email
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.status(200).json({ token, user: cp });
  });
};



/**
 * 6. Reject CP request
 */
exports.rejectCPRequest = (req, res) => {
  const { id } = req.body;
  if (!id) return res.status(400).json({ message: 'Request ID required' });
  db.query(
    `UPDATE cp_requests SET status='rejected' WHERE id = ? AND status='pending'`,
    [id],
    (err, result) => {
      if (err) {
        console.error('Reject error:', err);
        return res.status(500).json({ message: 'DB error' });
      }
      if (result.affectedRows === 0) return res.status(404).json({ message: 'Not found or already processed' });
      return res.status(200).json({ message: 'Request rejected' });
    }
  );
};

/**
 * 7. Get CP by UID
 */
exports.getCPMemberById = (req, res) => {
    
  const id = parseInt(req.params.id);
  const tokenId = parseInt(req.user?.id);
  const role = req.user?.role;
  
    console.log('🔐 route param id:', id);
    console.log('🔐 token id:', tokenId);
    console.log('🔐 role:', role);
  
  // Prevent CPs from viewing other CPs
     if (
      role === 'cp' &&
      (!id || !tokenId || parseInt(id) !== parseInt(tokenId))
    ) {
      return res.status(403).json({ message: 'Access denied' });
    }

  db.query(
    `SELECT * FROM channel_partners WHERE id = ?`,
    [id],
    (err, rows) => {
      if (err) {
        console.error('Fetch CP error:', err);
        return res.status(500).json({ message: 'DB error' });
      }
      console.log(rows)
      if (rows.length === 0) return res.status(404).json({ message: 'CP not found' });
      return res.status(200).json({ cp: rows[0] });
    }
  );
};


/**
 * 8. List all CP members
 */
exports.getCPMembers = (_req, res) => {
  db.query(
    `SELECT * FROM channel_partners ORDER BY created_at DESC`,
    (err, rows) => {
      if (err) {
        console.error('Fetch CPs error:', err);
        return res.status(500).json({ message: 'DB error' });
      }
      return res.status(200).json({ members: rows });
    }
  );
};

/**
 * 9. Resend temporary password
 */
exports.resendTempPassword = async (req, res) => {
  const { id } = req.body;
  if (!id) return res.status(400).json({ message: 'CP ID required' });

  // Fetch CP
  db.query(
    `SELECT email, full_name FROM channel_partners WHERE id = ?`,
    [id],
    async (err, rows) => {
      if (err || rows.length === 0) {
        console.error('Fetch CP error:', err);
        return res.status(404).json({ message: 'CP not found' });
      }

      const { email, full_name } = rows[0];
      const tempPassword = Math.random().toString(36).slice(-8);
      const tempHash = await bcrypt.hash(tempPassword, 10);

      // Update hash in DB
      db.query(
        `UPDATE channel_partners SET password_hash = ?, temp_password = true, updated_at = NOW() WHERE id = ?`,
        [tempHash, id],
        (updErr) => {
          if (updErr) {
            console.error('Update temp password error:', updErr);
            return res.status(500).json({ message: 'Temp password update failed' });
          }

          sendEmail({
            to: email,
            subject: 'Your new temporary password',
            text: `Hi ${full_name}, your new temporary password is: ${tempPassword}`
          });

          return res.status(200).json({ message: 'Temp password sent' });
        }
      );
    }
  );
};

exports.resetPassword = async (req, res) => {
  const { id, newPassword } = req.body;
  if (!id || !newPassword) return res.status(400).json({ message: 'Missing data' });

  try {
    const hash = await bcrypt.hash(newPassword, 10);
    db.query(
      `UPDATE channel_partners SET password_hash = ?, temp_password = false, updated_at = NOW() WHERE id = ?`,
      [hash, id],
      (err, result) => {
        if (err) {
          console.error('Password reset error:', err);
          return res.status(500).json({ message: 'Reset failed' });
        }
        return res.status(200).json({ message: 'Password reset successful. Please login again.' });
      }
    );
  } catch (err) {
    return res.status(500).json({ message: 'Hashing failed' });
  }
};

exports.addLead = (req, res) => {
  const {
    cpId,
    companyName,
    phone,
    email,
    contactName,
  } = req.body;

  const sql = `
    INSERT INTO leads
    (user_id, company_name, phone, email, contact_name, created_at )
    VALUES (?, ?, ?, ?, ?, NOW())
  `;
  const values = [
    cpId,
    companyName,
    phone,
    email,
    contactName,
  ];

  db.query(sql, values, (err, result) => {
    if (err) {
      console.error('Error sending lead:', err);
      return res.status(500).json({ message: 'Database error' });
    }
    return res.status(200).json({ message: 'Lead send Successfully' });
  });
};

exports.getLeads = (req, res) => {
  const { userId } = req.params;
  if (!userId) {
    return res.status(400).json({ message: 'User ID is required' });
  }

  const sql = `
    SELECT * FROM leads
    WHERE user_id = ?
    ORDER BY created_at DESC
  `;

  db.query(sql, [userId], (err, results) => {
    if (err) {
      console.error('Error fetching leads:', err);
      return res.status(500).json({ message: 'Database error while fetching leads' });
    }

    return res.status(200).json({ leads: results });
  });
};

exports.getLeadDetail = (req, res) => {
  const { leadId } = req.params;

  if (!leadId) {
    return res.status(400).json({ message: 'Lead ID is required' });
  }

  const sql = `SELECT * FROM leads WHERE id = ? LIMIT 1`;

  db.query(sql, [leadId], (err, results) => {
    if (err) {
      console.error('Error fetching lead detail:', err);
      return res.status(500).json({ message: 'Database error' });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: 'Lead not found' });
    }

    const lead = results[0];

    // Parse status JSON if it's stored as a string
    try {
      lead.status = JSON.parse(lead.status || '{}');
    } catch (e) {
      lead.status = {};
    }

    // Optional: parse any other JSON fields like details
    try {
      lead.details = JSON.parse(lead.details || '{}');
    } catch (e) {
      lead.details = {};
    }

    return res.status(200).json({ lead });
  });
};


exports.cpAgreement = (req, res) => {
  // multer.fields() stores form fields as arrays
  const cpId = Array.isArray(req.body.cpId) ? req.body.cpId[0] : req.body.cpId;
  const uploadedFileName = req.files?.agreement?.[0]?.filename;

  console.log('req.body:', req.body);
  console.log('req.files:', req.files);

  if (!cpId) return res.status(400).json({ message: 'cpId is required' });
  if (!uploadedFileName) return res.status(400).json({ message: 'No file uploaded' });

  const agreementUrl = uploadedFileName;

  const sql = `UPDATE channel_partners SET agreement_url = ? WHERE id = ?`;

  db.query(sql, [agreementUrl, cpId], (err, result) => {
    if (err) {
      console.error('❌ Error updating agreement_url:', err);
      return res.status(500).json({ message: 'Database update failed' });
    }

    return res.status(200).json({
      message: '✅ Agreement uploaded and saved successfully',
      filename: agreementUrl
    });
  });
};


exports.downloadCPAgreement = (req, res) => {
  const { filename } = req.params;
  const user = req.user; // comes from authenticateToken middleware
  const filePath = path.join('/home/noqu/agreements/CP-Agreements', filename);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ message: 'File not found' });
  }

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `inline; filename="${filename}"`);

  const fileStream = fs.createReadStream(filePath);
  fileStream.pipe(res);
};



exports.getCPBusinessCommissions = (req, res) => {
  const { userId } = req.params;
  if (!userId) return res.status(400).json({ message: 'User ID is required' });

  const sql = `
    SELECT 
      commission_requests.id,
      commission_requests.lead_id,
      leads.company_name,
      commission_requests.amount,
      commission_requests.commission_percent,
      commission_requests.commission_amount,
      commission_requests.status,
      commission_requests.created_at
    FROM commission_requests
    INNER JOIN leads ON commission_requests.lead_id = leads.id
    WHERE leads.user_id = ?
    ORDER BY commission_requests.created_at DESC
  `;

  db.query(sql, [userId], (err, results) => {
    if (err) {
      console.error('Error fetching business commissions:', err);
      return res.status(500).json({ message: 'Database error' });
    }

    return res.status(200).json(results || []);
  });
};

exports.updateLeadStageWithDetails = (req, res) => {
  let { leadId, stage, details } = req.body;

  console.log('Incoming payload:', stage);

  if (!leadId || typeof stage !== 'string' || !details) {
    return res.status(400).json({ message: 'Missing leadId, stage, or details' });
  }

  // Ensure JSON string format
  const stringifiedDetails = JSON.stringify(details);

  const updateSql = `
    UPDATE leads
    SET stage = ?, details = ?, last_updated = NOW()
    WHERE id = ?
  `;

  db.query(updateSql, [stage, stringifiedDetails, leadId], (err, result) => {
    if (err) {
      console.error('Lead update failed:', err);
      return res.status(500).json({ message: 'Database error' });
    }

    // Optional: log affected rows
    console.log('Lead updated successfully:', result.affectedRows);

    // 🔁 Commission insert only for "sale-completed"
    if (stage === 'sale-completed' && details.sale_amount) {
      const saleAmount = details.sale_amount;
      const percent = 10;
      const commission = (saleAmount * percent) / 100;

      db.query(`SELECT id FROM commission_requests WHERE lead_id = ?`, [leadId], (err2, rows) => {
        if (err2) {
          console.error('Commission lookup failed:', err2);
          return res.status(500).json({ message: 'Commission check failed' });
        }

        if (rows.length === 0) {
          const insertSql = `
            INSERT INTO commission_requests
            (lead_id, amount, commission_percent, commission_amount, status, created_at)
            VALUES (?, ?, ?, ?, 'pending', NOW())
          `;
          db.query(insertSql, [leadId, saleAmount, percent, commission], (err3) => {
            if (err3) {
              console.error('Commission insert failed:', err3);
              return res.status(500).json({ message: 'Commission insert failed' });
            }
            return res.status(200).json({ message: 'Stage updated and commission created' });
          });
        } else {
          return res.status(200).json({ message: 'Stage updated (commission already exists)' });
        }
      });
    } else {
      return res.status(200).json({ message: 'Stage updated successfully' });
    }
  });
};

exports.getCPBankDetails = (req, res) => {
  const cpId = req.params.cpId;
  db.query(`SELECT * FROM cp_bank_details WHERE cp_id = ?`, [cpId], (err, rows) => {
    if (err) return res.status(500).json({ message: 'Database error' });
    return res.status(200).json(rows);
  });
};


exports.saveCPBankDetails = async (req, res) => {
  const {
    cp_id, payment_method, upi_id,
    account_holder_name, account_number,
    ifsc_code, bank_name, branch
  } = req.body;

  if (!cp_id || !payment_method) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    // 1. Insert the bank details
    const sql = `
      INSERT INTO cp_bank_details
      (cp_id, payment_method, upi_id, account_holder_name, account_number, ifsc_code, bank_name, branch)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const values = [
      cp_id, payment_method, upi_id || null, account_holder_name || null,
      account_number || null, ifsc_code || null, bank_name || null, branch || null
    ];

    await dbAsync.query(sql, values);

    // 2. Create Razorpay Contact if not exists
    const [cp] = await dbAsync.query('SELECT * FROM channel_partners WHERE id = ?', [cp_id]);
    if (!cp) return res.status(404).json({ message: 'Channel Partner not found' });

    if (!cp.razorpay_contact_id) {
      const fakeContactId = `sim_contact_${cp_id}`;
      await dbAsync.query(
        'UPDATE channel_partners SET razorpay_contact_id = ? WHERE id = ?',
        [fakeContactId, cp_id]
      );
    }

    // 3. Create Razorpay Fund Account for this payment method
    const fundId = `sim_fund_${cp_id}_${payment_method}`;
    const column = payment_method === 'upi' ? 'razorpay_fund_account_upi' : 'razorpay_fund_account_bank';

    await dbAsync.query(
      `UPDATE cp_bank_details SET ${column} = ? WHERE cp_id = ? AND payment_method = ?`,
      [fundId, cp_id, payment_method]
    );

    return res.status(200).json({
      message: 'Bank details saved and Razorpay simulation setup completed',
      razorpay_contact_id: cp.razorpay_contact_id || `sim_contact_${cp_id}`,
      razorpay_fund_account_id: fundId
    });

  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'Payment method already added' });
    }
    console.error('Save CP bank details failed:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};


exports.updateCPBankDetails = async (req, res) => {
  const {
    cp_id,
    payment_method,
    upi_id,
    account_holder_name,
    account_number,
    ifsc_code,
    bank_name,
    branch,
  } = req.body;

  if (!cp_id || !payment_method) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    // 1. Update the bank details
    const updateSql = `
      UPDATE cp_bank_details
      SET 
        upi_id = ?, 
        account_holder_name = ?, 
        account_number = ?,
        ifsc_code = ?, 
        bank_name = ?, 
        branch = ?
      WHERE cp_id = ? AND payment_method = ?
    `;

    const updateValues = [
      upi_id || null,
      account_holder_name || null,
      account_number || null,
      ifsc_code || null,
      bank_name || null,
      branch || null,
      cp_id,
      payment_method,
    ];

    await dbAsync.query(updateSql, updateValues);

    // 2. Simulate Razorpay Contact ID if not exists
    const [cpRow] = await dbAsync.query(
      'SELECT razorpay_contact_id FROM channel_partners WHERE id = ?',
      [cp_id]
    );

    if (!cpRow?.razorpay_contact_id) {
      const fakeContactId = `sim_contact_${cp_id}`;
      await dbAsync.query(
        'UPDATE channel_partners SET razorpay_contact_id = ? WHERE id = ?',
        [fakeContactId, cp_id]
      );
    }

    // 3. Simulate Razorpay Fund Account ID
    const fundAccountId = `sim_fund_${cp_id}_${payment_method}`;
    const fundColumn =
      payment_method === 'upi'
        ? 'razorpay_fund_account_upi'
        : 'razorpay_fund_account_bank';

    await dbAsync.query(
      `UPDATE cp_bank_details SET ${fundColumn} = ? WHERE cp_id = ? AND payment_method = ?`,
      [fundAccountId, cp_id, payment_method]
    );

    res.status(200).json({
      message: 'Bank details updated and fund account simulated',
    });
  } catch (err) {
    console.error('Update bank details error:', err);
    res.status(500).json({ message: 'Failed to update bank details' });
  }
};

exports.getCommissionDetails = async (req, res) => {
  try {
    const rows = await dbAsync.query(`
      SELECT cr.id, cr.lead_id, cr.amount AS lead_amount, cr.commission_percent,
             cr.commission_amount, cr.status, cr.payment_reference,
             cr.paid_at AS closed_at,
             l.company_name AS lead_title,
             cp.full_name AS cp_name
      FROM commission_requests cr
      JOIN leads l ON cr.lead_id = l.id
      JOIN channel_partners cp ON l.user_id = cp.id
      ORDER BY cr.created_at DESC
    `);
    res.status(200).json(rows);
  } catch (err) {
    console.error('Fetch commission error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.cpForgotPasswordInit = async (req, res) => {
  const { email } = req.body;
  console.log(email)
  if (!email) return res.status(400).json({ message: 'Email required' });

  db.query(`SELECT * FROM channel_partners WHERE email = ?`, [email], async (err, rows) => {
    if (err || rows.length === 0) {
      return res.status(404).json({ message: 'Email not found' });
    }

    const tempPass = Math.random().toString(36).slice(-8);
    const hash = await bcrypt.hash(tempPass, 10);

    db.query(
      `UPDATE channel_partners SET password_hash = ?, temp_password = true WHERE email = ?`,
      [hash, email],
      (err2) => {
        if (err2) {
          return res.status(500).json({ message: 'Error updating password' });
        }

        sendEmail({
          to: email,
          subject: 'Temporary Password',
          text: `Your temporary password is: ${tempPass}`,
        });

        return res.status(200).json({ message: 'Temp password sent' });
      }
    );
  });
};

exports.cpForgotPasswordVerify = async (req, res) => {
 const { email, tempPassword } = req.body;
  if (!email || !tempPassword) return res.status(400).json({ message: 'Missing fields' });

  db.query(`SELECT * FROM channel_partners WHERE email = ?`, [email], async (err, rows) => {
    if (err || rows.length === 0) {
      return res.status(404).json({ message: 'Email not found' });
    }

    const cp = rows[0];
    if (!cp.temp_password) {
      return res.status(400).json({ message: 'Not in temp password mode' });
    }

    const isMatch = await bcrypt.compare(tempPassword, cp.password_hash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid temp password' });
    }

    return res.status(200).json({ userId: cp.id });
  });
};








