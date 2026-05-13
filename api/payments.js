import supabase from './_supabase.js';
import { verifyUser, handleCors } from './_auth.js';

const PAYSTACK_BASE = 'https://api.paystack.co';

async function paystack(path, options = {}) {
  const secret = process.env.PAYSTACK_SECRET_KEY;
  if (!secret) throw new Error('PAYSTACK_SECRET_KEY is not configured on the server');
  const response = await fetch(`${PAYSTACK_BASE}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${secret}`,
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok || data.status === false) throw new Error(data.message || 'Paystack request failed');
  return data;
}

export default async function handler(req, res) {
  if (handleCors(req, res)) return;

  try {
    const user = await verifyUser(req);
    const action = req.query.action;

    // GET /api/payments?action=banks - Open to all authenticated users
    if (req.method === 'GET' && action === 'banks') {
      const data = await paystack('/bank?country=nigeria&perPage=100');
      return res.status(200).json(data.data || []);
    }

    // POST /api/payments?action=resolve-account - Open to all authenticated users
    if (req.method === 'POST' && action === 'resolve-account') {
      const { bank_code, account_number } = req.body;
      if (!bank_code) return res.status(400).json({ error: 'Bank code is required' });
      if (!/^\d{10}$/.test(String(account_number || ''))) return res.status(400).json({ error: 'Valid 10-digit account number is required' });
      const data = await paystack(`/bank/resolve?account_number=${encodeURIComponent(account_number)}&bank_code=${encodeURIComponent(bank_code)}`);
      return res.status(200).json(data.data);
    }

    // POST /api/payments?action=payout - User-specific royalty payout
    if (req.method === 'POST' && action === 'payout') {
      const { amount, bank_code, bank_name, account_number, account_name, email, narration } = req.body;
      const numericAmount = Number(amount);
      if (!Number.isFinite(numericAmount) || numericAmount < 100) return res.status(400).json({ error: 'Minimum payout amount is 100 NGN' });
      if (!bank_code || !bank_name) return res.status(400).json({ error: 'Recipient bank is required' });
      if (!/^\d{10}$/.test(String(account_number || ''))) return res.status(400).json({ error: 'Valid 10-digit account number is required' });
      if (!account_name) return res.status(400).json({ error: 'Resolved account name is required' });
      if (!email || !String(email).includes('@')) return res.status(400).json({ error: 'Recipient email is required' });

      // Create transfer recipient in Paystack
      const recipient = await paystack('/transferrecipient', {
        method: 'POST',
        body: JSON.stringify({
          type: 'nuban',
          name: account_name,
          account_number,
          bank_code,
          currency: 'NGN',
          description: `Royalty recipient ${account_name} (User: ${user.id})`,
          email,
        }),
      });

      const reference = `AD-PAY-${Date.now()}`;
      const transfer = await paystack('/transfer', {
        method: 'POST',
        body: JSON.stringify({
          source: 'balance',
          amount: Math.round(numericAmount * 100), // Convert to kobo
          recipient: recipient.data.recipient_code,
          reason: narration || 'Artist royalty payout',
          reference,
        }),
      });

      const transferStatus = transfer.data?.status || 'processing';
      const confirmed = ['success', 'received', 'otp'].includes(String(transferStatus).toLowerCase()) === false ? false : String(transferStatus).toLowerCase() === 'success';
      const transactionStatus = confirmed ? 'Paid' : 'Processing';
      const description = `Paystack transfer to ${account_name} (${bank_name} ${account_number})`;

      // Securely record the transaction with the user_id
      const { data: transaction, error } = await supabase
        .from('artist_transactions')
        .insert({ 
          user_id: user.id, 
          description, 
          amount: numericAmount, 
          status: transactionStatus, 
          transaction_date: new Date().toISOString(), 
          method: 'Paystack Transfer', 
          reference 
        })
        .select()
        .single();
      
      if (error) throw error;

      // Log metadata events
      await supabase.from('artist_payout_accounts').insert({ 
        user_id: user.id, 
        account_name, 
        account_number, 
        bank_name, 
        bank_code, 
        email, 
        recipient_code: recipient.data.recipient_code, 
        last_reference: reference 
      });

      await supabase.from('artist_notifications').insert({ 
        user_id: user.id, 
        title: confirmed ? 'Royalty payment confirmed' : 'Royalty payout processing', 
        message: confirmed ? `₦${numericAmount.toLocaleString()} has been paid to ${account_name}.` : `Your Paystack payout to ${account_name} is processing. Reference: ${reference}`, 
        category: 'Payments', 
        is_read: false 
      });

      return res.status(201).json({ ok: true, reference, status: transactionStatus, message: confirmed ? 'Royalty payment confirmed and sent.' : 'Payout created and is processing.', transaction });
    }

    // POST /api/payments?action=verify - Verify a payment reference
    if (req.method === 'POST' && action === 'verify') {
      const { reference } = req.body;
      if (!reference) return res.status(400).json({ error: 'Reference is required' });
      
      const data = await paystack(`/transfer/verify/${encodeURIComponent(reference)}`);
      const status = data.data?.status || 'unknown';
      const transactionStatus = String(status).toLowerCase() === 'success' ? 'Paid' : 'Processing';
      
      // Update the transaction only if it belongs to the user
      const { data: transaction } = await supabase
        .from('artist_transactions')
        .update({ status: transactionStatus })
        .eq('reference', reference)
        .eq('user_id', user.id)
        .select()
        .single();
        
      return res.status(200).json({ ok: true, reference, status: transactionStatus, message: `Paystack status: ${status}`, transaction });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('Payment API error:', err.message);
    return res.status(err.message.includes('Auth') ? 401 : 500).json({ error: err.message });
  }
}
