const { dbAsync } = require('../models/db');

exports.createPayout = async (req, res) => {
  const { commission_request_id, payment_method } = req.body;

  if (!commission_request_id || !payment_method) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  if (!['upi', 'bank'].includes(payment_method)) {
    return res.status(400).json({ message: 'Invalid payment method' });
  }

  try {
    // Update payment method before payout
    await dbAsync.query(
      `UPDATE commission_requests SET payment_method = ? WHERE id = ?`,
      [payment_method, commission_request_id]
    );

    // Fetch commission + CP info
    const [row] = await dbAsync.query(`
      SELECT cr.*, cp.razorpay_contact_id,
             b.razorpay_fund_account_upi, b.razorpay_fund_account_bank
      FROM commission_requests cr
      JOIN leads l ON cr.lead_id = l.id
      JOIN channel_partners cp ON l.user_id = cp.id
      LEFT JOIN cp_bank_details b ON cp.id = b.cp_id AND b.payment_method = ?
      WHERE cr.id = ?
    `, [payment_method, commission_request_id]);

    if (!row) {
      return res.status(404).json({ message: 'Commission request not found' });
    }

    const fundAccountId = payment_method === 'upi' ? row.razorpay_fund_account_upi : row.razorpay_fund_account_bank;
    if (!fundAccountId) {
      return res.status(400).json({ message: `No fund account for ${payment_method}` });
    }

    // Simulate payout
    const payout_id = `sim_payout_${commission_request_id}`;
    const payout_status = Math.random() > 0.2 ? 'paid' : 'failed'; // 80% success

    // Update status
    await dbAsync.query(`
      UPDATE commission_requests
      SET status = ?, payment_reference = ?, paid_at = NOW()
      WHERE id = ?
    `, [payout_status, payout_id, commission_request_id]);

    return res.status(200).json({
      message: 'Payout processed',
      payout_id,
      payout_status
    });

  } catch (err) {
    console.error('Simulated payout error:', err);
    return res.status(500).json({ message: 'Internal error during payout' });
  }
};

